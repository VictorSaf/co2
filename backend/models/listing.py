"""
Listing model for CEA offerings
"""
from datetime import datetime
from sqlalchemy import Enum as SQLEnum
import enum
from database import db


class ListingStatus(enum.Enum):
    """Listing status enumeration"""
    ACTIVE = 'active'
    PENDING = 'pending'
    MATCHED = 'matched'
    WITHDRAWN = 'withdrawn'
    EXPIRED = 'expired'


class Listing(db.Model):
    """
    CEA listing model for seller offerings
    """
    __tablename__ = 'listings'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    seller_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    seller_code = db.Column(db.String(50), nullable=False, index=True)  # e.g., "SELLER-CN-2847"
    
    # Listing details
    volume = db.Column(db.Integer, nullable=False)  # tonnes
    price_per_tonne = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default='EUR')  # EUR, USD, GBP, RMB, HKD
    timeline = db.Column(db.String(50), nullable=False)  # "T+2", "T+3", "Flexible", "Immediate"
    
    # Price expectations
    reference_price = db.Column(db.Numeric(10, 2), nullable=True)  # Shanghai ETS spot price
    premium_expected = db.Column(db.Numeric(5, 2), nullable=True)  # Percentage premium
    
    # Settlement preferences
    settlement_currencies = db.Column(db.JSON, default=list, nullable=False)  # Multiple currencies allowed
    
    # Tax optimization
    tax_optimization_requested = db.Column(db.Boolean, default=False, nullable=False)
    
    # Status
    status = db.Column(SQLEnum(ListingStatus), default=ListingStatus.ACTIVE, nullable=False, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    seller = db.relationship('User', backref='listings', lazy=True)
    negotiations = db.relationship('Negotiation', backref='listing', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, camel_case: bool = True):
        """Convert listing to dictionary"""
        data = {
            'id': self.id,
            'seller_id': self.seller_id,
            'seller_code': self.seller_code,
            'volume': int(self.volume) if self.volume else None,
            'price_per_tonne': float(self.price_per_tonne) if self.price_per_tonne else None,
            'currency': self.currency,
            'timeline': self.timeline,
            'reference_price': float(self.reference_price) if self.reference_price else None,
            'premium_expected': float(self.premium_expected) if self.premium_expected else None,
            'settlement_currencies': self.settlement_currencies,
            'tax_optimization_requested': self.tax_optimization_requested,
            'status': self.status.value if self.status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'total_value': float(self.price_per_tonne * self.volume) if self.price_per_tonne and self.volume else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data

