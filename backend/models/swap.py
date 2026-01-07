"""
Swap request and quote models for EUA↔CEA swaps
"""
from datetime import datetime, timedelta
from sqlalchemy import Enum as SQLEnum
import enum
from database import db


class SwapRequestStatus(enum.Enum):
    """Swap request status enumeration"""
    PENDING = 'pending'
    QUOTED = 'quoted'
    ACCEPTED = 'accepted'
    EXECUTED = 'executed'
    DECLINED = 'declined'
    EXPIRED = 'expired'


class SwapQuoteStatus(enum.Enum):
    """Swap quote status enumeration"""
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    DECLINED = 'declined'
    EXPIRED = 'expired'
    EXECUTED = 'executed'


class SwapRequest(db.Model):
    """
    Swap request model for EUA→CEA swap requests
    """
    __tablename__ = 'swap_requests'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    requester_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    
    # EUA position details
    eua_volume = db.Column(db.Integer, nullable=False)  # tonnes
    eua_average_cost = db.Column(db.Numeric(10, 2), nullable=True)
    eua_current_price = db.Column(db.Numeric(10, 2), nullable=True)
    
    # Desired outcome
    desired_ratio = db.Column(db.Numeric(5, 2), nullable=True)  # e.g., 10.5
    target_profile = db.Column(db.String(100), nullable=True)  # "portfolio_diversification", "risk_hedge", "tactical_rotation"
    investment_horizon = db.Column(db.String(50), nullable=True)  # "1-3 years", "3-5 years", "5+ years"
    expected_cea_price_target = db.Column(db.Numeric(10, 2), nullable=True)
    
    # Settlement terms
    settlement_timeline = db.Column(db.String(50), nullable=False, default='T+2')  # "T+1", "T+2", "T+3", "Flexible"
    insurance_required = db.Column(db.Boolean, default=True, nullable=False)
    
    # Counterparty preferences
    counterparty_preferences = db.Column(db.JSON, nullable=True)
    
    # Status
    status = db.Column(SQLEnum(SwapRequestStatus), default=SwapRequestStatus.PENDING, nullable=False, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    requester = db.relationship('User', backref='swap_requests', lazy=True)
    quotes = db.relationship('SwapQuote', backref='swap_request', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, camel_case: bool = True):
        """Convert swap request to dictionary"""
        data = {
            'id': self.id,
            'requester_id': self.requester_id,
            'eua_volume': int(self.eua_volume) if self.eua_volume else None,
            'eua_average_cost': float(self.eua_average_cost) if self.eua_average_cost else None,
            'eua_current_price': float(self.eua_current_price) if self.eua_current_price else None,
            'desired_ratio': float(self.desired_ratio) if self.desired_ratio else None,
            'target_profile': self.target_profile,
            'investment_horizon': self.investment_horizon,
            'expected_cea_price_target': float(self.expected_cea_price_target) if self.expected_cea_price_target else None,
            'settlement_timeline': self.settlement_timeline,
            'insurance_required': self.insurance_required,
            'counterparty_preferences': self.counterparty_preferences,
            'status': self.status.value if self.status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'eua_value': float(self.eua_volume * self.eua_current_price) if self.eua_volume and self.eua_current_price else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data


class SwapQuote(db.Model):
    """
    Swap quote model for EUA→CEA swap quotes
    """
    __tablename__ = 'swap_quotes'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    swap_request_id = db.Column(db.String(36), db.ForeignKey('swap_requests.id'), nullable=False, index=True)
    
    # Quote details
    offered_ratio = db.Column(db.Numeric(5, 2), nullable=False)  # e.g., 10.5
    cea_volume = db.Column(db.Integer, nullable=False)  # Calculated: eua_volume * ratio
    cea_price = db.Column(db.Numeric(10, 2), nullable=False)  # CEA price at quote time
    cea_value = db.Column(db.Numeric(15, 2), nullable=False)  # cea_volume * cea_price
    
    # Value comparison
    eua_value = db.Column(db.Numeric(15, 2), nullable=False)  # EUA value at quote time
    premium = db.Column(db.Numeric(10, 2), nullable=True)  # Value premium in EUR
    
    # Fees
    facilitation_fee_percent = db.Column(db.Numeric(5, 2), nullable=True, default=0.5)  # 0.5% default
    facilitation_fee_amount = db.Column(db.Numeric(15, 2), nullable=True)
    
    # Settlement
    settlement_timeline = db.Column(db.String(50), nullable=False)
    insurance_included = db.Column(db.Boolean, default=True, nullable=False)
    
    # Status
    status = db.Column(SQLEnum(SwapQuoteStatus), default=SwapQuoteStatus.PENDING, nullable=False, index=True)
    
    # Validity
    valid_until = db.Column(db.DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(days=1))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self, camel_case: bool = True):
        """Convert swap quote to dictionary"""
        data = {
            'id': self.id,
            'swap_request_id': self.swap_request_id,
            'offered_ratio': float(self.offered_ratio) if self.offered_ratio else None,
            'cea_volume': int(self.cea_volume) if self.cea_volume else None,
            'cea_price': float(self.cea_price) if self.cea_price else None,
            'cea_value': float(self.cea_value) if self.cea_value else None,
            'eua_value': float(self.eua_value) if self.eua_value else None,
            'premium': float(self.premium) if self.premium else None,
            'facilitation_fee_percent': float(self.facilitation_fee_percent) if self.facilitation_fee_percent else None,
            'facilitation_fee_amount': float(self.facilitation_fee_amount) if self.facilitation_fee_amount else None,
            'settlement_timeline': self.settlement_timeline,
            'insurance_included': self.insurance_included,
            'status': self.status.value if self.status else None,
            'valid_until': self.valid_until.isoformat() if self.valid_until else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data

