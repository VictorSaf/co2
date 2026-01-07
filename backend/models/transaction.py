"""
Transaction model for executed trades
"""
from datetime import datetime, date
from sqlalchemy import Enum as SQLEnum
import enum
from database import db


class TransactionType(enum.Enum):
    """Transaction type enumeration"""
    CEA_SALE = 'cea_sale'          # CEA sold by Chinese seller
    CEA_PURCHASE = 'cea_purchase'  # CEA purchased by EU buyer
    SWAP = 'swap'                   # EUA↔CEA swap


class TransactionStatus(enum.Enum):
    """Transaction status enumeration"""
    PENDING = 'pending'
    IN_ESCROW = 'in_escrow'
    SETTLED = 'settled'
    FAILED = 'failed'
    CANCELLED = 'cancelled'


class Transaction(db.Model):
    """
    Transaction model for executed trades
    """
    __tablename__ = 'transactions'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    transaction_type = db.Column(SQLEnum(TransactionType), nullable=False, index=True)
    
    # Parties (anonymous codes)
    seller_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    buyer_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    seller_code = db.Column(db.String(50), nullable=False)
    buyer_code = db.Column(db.String(50), nullable=False)
    
    # Transaction details
    volume = db.Column(db.Integer, nullable=False)  # tonnes
    price_per_tonne = db.Column(db.Numeric(10, 2), nullable=False)
    total_value = db.Column(db.Numeric(15, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default='EUR')
    
    # For swaps
    swap_ratio = db.Column(db.Numeric(5, 2), nullable=True)  # e.g., 10.5
    eua_volume = db.Column(db.Integer, nullable=True)  # For swaps
    cea_volume = db.Column(db.Integer, nullable=True)  # For swaps
    
    # Settlement
    settlement_date = db.Column(db.Date, nullable=True)
    settlement_timeline = db.Column(db.String(50), nullable=True)  # "T+2", "T+3", etc.
    
    # Status
    status = db.Column(SQLEnum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False, index=True)
    
    # Related entities
    listing_id = db.Column(db.String(36), db.ForeignKey('listings.id'), nullable=True)
    demand_id = db.Column(db.String(36), db.ForeignKey('demand_listings.id'), nullable=True)
    negotiation_id = db.Column(db.String(36), db.ForeignKey('negotiations.id'), nullable=True)
    swap_quote_id = db.Column(db.String(36), db.ForeignKey('swap_quotes.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    settled_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    seller = db.relationship('User', foreign_keys=[seller_id], backref='sales_transactions', lazy=True)
    buyer = db.relationship('User', foreign_keys=[buyer_id], backref='purchase_transactions', lazy=True)
    listing = db.relationship('Listing', backref='transactions', lazy=True)
    demand_listing = db.relationship('DemandListing', backref='transactions', lazy=True)
    negotiation = db.relationship('Negotiation', backref='transactions', lazy=True)
    swap_quote = db.relationship('SwapQuote', backref='transactions', lazy=True)
    legal_documents = db.relationship('LegalDocument', backref='transaction', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, camel_case: bool = True):
        """Convert transaction to dictionary"""
        data = {
            'id': self.id,
            'transaction_type': self.transaction_type.value if self.transaction_type else None,
            'seller_id': self.seller_id,
            'buyer_id': self.buyer_id,
            'seller_code': self.seller_code,
            'buyer_code': self.buyer_code,
            'volume': int(self.volume) if self.volume else None,
            'price_per_tonne': float(self.price_per_tonne) if self.price_per_tonne else None,
            'total_value': float(self.total_value) if self.total_value else None,
            'currency': self.currency,
            'swap_ratio': float(self.swap_ratio) if self.swap_ratio else None,
            'eua_volume': int(self.eua_volume) if self.eua_volume else None,
            'cea_volume': int(self.cea_volume) if self.cea_volume else None,
            'settlement_date': self.settlement_date.isoformat() if self.settlement_date else None,
            'settlement_timeline': self.settlement_timeline,
            'status': self.status.value if self.status else None,
            'listing_id': self.listing_id,
            'demand_id': self.demand_id,
            'negotiation_id': self.negotiation_id,
            'swap_quote_id': self.swap_quote_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'settled_at': self.settled_at.isoformat() if self.settled_at else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data


class LegalDocumentType(enum.Enum):
    """Legal document type enumeration"""
    SWAP_AGREEMENT = 'swap_agreement'
    TAX_MEMO = 'tax_memo'
    SETTLEMENT_INSTRUCTIONS = 'settlement_instructions'
    REGULATORY_ATTESTATION = 'regulatory_attestation'
    INSURANCE_CERTIFICATE = 'insurance_certificate'


class LegalDocument(db.Model):
    """
    Legal document model for auto-generated documents
    """
    __tablename__ = 'legal_documents'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    transaction_id = db.Column(db.String(36), db.ForeignKey('transactions.id'), nullable=False, index=True)
    
    # Document details
    document_type = db.Column(SQLEnum(LegalDocumentType), nullable=False, index=True)
    file_path = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(200), nullable=False)
    file_size = db.Column(db.Integer, nullable=True)  # bytes
    
    # Generation metadata
    generated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    generated_by = db.Column(db.String(36), nullable=True)  # System or admin user ID
    template_version = db.Column(db.String(50), nullable=True)
    
    def to_dict(self, camel_case: bool = True):
        """Convert legal document to dictionary"""
        data = {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'document_type': self.document_type.value if self.document_type else None,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
            'generated_by': self.generated_by,
            'template_version': self.template_version,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data


class CEAPortfolio(db.Model):
    """
    CEA portfolio holdings model
    """
    __tablename__ = 'cea_portfolio'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Holdings
    volume = db.Column(db.Integer, nullable=False)  # tonnes
    cost_basis = db.Column(db.Numeric(10, 2), nullable=False)  # Average cost per tonne
    purchase_date = db.Column(db.Date, nullable=False, index=True)
    
    # Source
    source_transaction_id = db.Column(db.String(36), db.ForeignKey('transactions.id'), nullable=True)
    
    # Status
    is_available = db.Column(db.Boolean, default=True, nullable=False)  # Available for swap/sale
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref='cea_portfolio', lazy=True)
    source_transaction = db.relationship('Transaction', backref='cea_portfolio_entries', lazy=True)
    
    def to_dict(self, camel_case: bool = True):
        """Convert CEA portfolio entry to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'volume': int(self.volume) if self.volume else None,
            'cost_basis': float(self.cost_basis) if self.cost_basis else None,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'source_transaction_id': self.source_transaction_id,
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'total_cost': float(self.volume * self.cost_basis) if self.volume and self.cost_basis else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data

