"""
Demand listing model for buyer requests
"""
from datetime import datetime
from sqlalchemy import Enum as SQLEnum
import enum
from database import db


class DemandStatus(enum.Enum):
    """Demand listing status enumeration"""
    ACTIVE = 'active'
    MATCHED = 'matched'
    WITHDRAWN = 'withdrawn'
    EXPIRED = 'expired'


class IntendedUse(enum.Enum):
    """Intended use for CEA"""
    IMMEDIATE_COMPLIANCE = 'immediate_compliance'
    PORTFOLIO_POSITIONING = 'portfolio_positioning'
    SWAP_PREPARATION = 'swap_preparation'
    CBAM_HEDGE = 'cbam_hedge'
    UNDECIDED = 'undecided'


class DemandListing(db.Model):
    """
    Demand listing model for buyer requests
    """
    __tablename__ = 'demand_listings'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    buyer_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    buyer_code = db.Column(db.String(50), nullable=False, index=True)  # e.g., "BUYER-EU-5621"
    
    # Demand details
    volume_needed = db.Column(db.Integer, nullable=False)  # tonnes
    max_price = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), nullable=False, default='EUR')
    
    # Intended use
    intended_use = db.Column(SQLEnum(IntendedUse), nullable=True)
    
    # Timeline
    timeline = db.Column(db.String(50), nullable=False)  # "T+2", "T+5", "Flexible"
    
    # Seller preferences
    seller_preferences = db.Column(db.JSON, nullable=True)  # "top-rated", "any-approved"
    
    # Status
    status = db.Column(SQLEnum(DemandStatus), default=DemandStatus.ACTIVE, nullable=False, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    buyer = db.relationship('User', backref='demand_listings', lazy=True)
    negotiations = db.relationship('Negotiation', backref='demand_listing', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, camel_case: bool = True):
        """Convert demand listing to dictionary"""
        data = {
            'id': self.id,
            'buyer_id': self.buyer_id,
            'buyer_code': self.buyer_code,
            'volume_needed': int(self.volume_needed) if self.volume_needed else None,
            'max_price': float(self.max_price) if self.max_price else None,
            'currency': self.currency,
            'intended_use': self.intended_use.value if self.intended_use else None,
            'timeline': self.timeline,
            'seller_preferences': self.seller_preferences,
            'status': self.status.value if self.status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'total_value': float(self.max_price * self.volume_needed) if self.max_price and self.volume_needed else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data

