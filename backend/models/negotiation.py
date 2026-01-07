"""
Negotiation model for bilateral conversations
"""
from datetime import datetime
from sqlalchemy import Enum as SQLEnum
import enum
from database import db


class NegotiationStatus(enum.Enum):
    """Negotiation status enumeration"""
    OPEN = 'open'
    ACCEPTED = 'accepted'
    DECLINED = 'declined'
    EXPIRED = 'expired'
    CANCELLED = 'cancelled'


class Negotiation(db.Model):
    """
    Negotiation model for bilateral conversations between sellers and buyers
    """
    __tablename__ = 'negotiations'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    listing_id = db.Column(db.String(36), db.ForeignKey('listings.id'), nullable=True, index=True)
    demand_id = db.Column(db.String(36), db.ForeignKey('demand_listings.id'), nullable=True, index=True)
    
    # Parties (anonymous codes)
    initiator_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    initiator_code = db.Column(db.String(50), nullable=False)  # SELLER-CN-xxxx or BUYER-EU-xxxx
    counterparty_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    counterparty_code = db.Column(db.String(50), nullable=False)  # SELLER-CN-xxxx or BUYER-EU-xxxx
    
    # Current proposal
    proposed_volume = db.Column(db.Integer, nullable=True)
    proposed_price = db.Column(db.Numeric(10, 2), nullable=True)
    proposed_currency = db.Column(db.String(3), nullable=True)
    
    # Status
    status = db.Column(SQLEnum(NegotiationStatus), default=NegotiationStatus.OPEN, nullable=False, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    initiator = db.relationship('User', foreign_keys=[initiator_id], backref='initiated_negotiations', lazy=True)
    counterparty = db.relationship('User', foreign_keys=[counterparty_id], backref='received_negotiations', lazy=True)
    messages = db.relationship('NegotiationMessage', backref='negotiation', lazy=True, 
                              cascade='all, delete-orphan', order_by='NegotiationMessage.created_at')
    
    def to_dict(self, camel_case: bool = True):
        """Convert negotiation to dictionary"""
        data = {
            'id': self.id,
            'listing_id': self.listing_id,
            'demand_id': self.demand_id,
            'initiator_id': self.initiator_id,
            'initiator_code': self.initiator_code,
            'counterparty_id': self.counterparty_id,
            'counterparty_code': self.counterparty_code,
            'proposed_volume': int(self.proposed_volume) if self.proposed_volume else None,
            'proposed_price': float(self.proposed_price) if self.proposed_price else None,
            'proposed_currency': self.proposed_currency,
            'status': self.status.value if self.status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'message_count': len(self.messages) if self.messages else 0,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data


class MessageSenderType(enum.Enum):
    """Message sender type enumeration"""
    SELLER = 'seller'
    BUYER = 'buyer'
    NIHAO = 'nihao'  # Nihao intermediation messages


class NegotiationMessage(db.Model):
    """
    Message model for negotiation conversations
    """
    __tablename__ = 'negotiation_messages'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    negotiation_id = db.Column(db.String(36), db.ForeignKey('negotiations.id'), nullable=False, index=True)
    
    # Sender
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True, index=True)  # NULL for NIHAO messages
    sender_type = db.Column(SQLEnum(MessageSenderType), nullable=False)
    sender_code = db.Column(db.String(50), nullable=True)  # Anonymous code or "NIHAO"
    
    # Message content
    message_text = db.Column(db.Text, nullable=False)
    
    # Price/volume proposals (if applicable)
    price_proposal = db.Column(db.Numeric(10, 2), nullable=True)
    volume_proposal = db.Column(db.Integer, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    sender = db.relationship('User', backref='negotiation_messages', lazy=True)
    
    def to_dict(self, camel_case: bool = True):
        """Convert message to dictionary"""
        data = {
            'id': self.id,
            'negotiation_id': self.negotiation_id,
            'sender_id': self.sender_id,
            'sender_type': self.sender_type.value if self.sender_type else None,
            'sender_code': self.sender_code,
            'message_text': self.message_text,
            'price_proposal': float(self.price_proposal) if self.price_proposal else None,
            'volume_proposal': int(self.volume_proposal) if self.volume_proposal else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data

