"""
Market Opportunity Model

Stores detected market opportunities.
"""

from datetime import datetime
from database import db
from utils.serializers import to_camel_case


class MarketOpportunity(db.Model):
    """Model for storing market opportunities"""
    
    __tablename__ = 'market_opportunities'
    
    id = db.Column(db.String(36), primary_key=True)
    opportunity_type = db.Column(db.String(30), nullable=False)  # 'arbitrage', 'swap_optimization', 'liquidity_crisis'
    market_data = db.Column(db.Text, nullable=False)  # JSON serialized
    potential_savings = db.Column(db.Float, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    def __init__(self, **kwargs):
        super(MarketOpportunity, self).__init__(**kwargs)
        if not self.created_at:
            self.created_at = datetime.utcnow()
    
    def to_dict(self, camel_case=False):
        """Convert to dictionary"""
        data = {
            'id': self.id,
            'opportunity_type': self.opportunity_type,
            'market_data': self.market_data,
            'potential_savings': self.potential_savings,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if camel_case:
            return to_camel_case(data)
        return data
    
    def __repr__(self):
        return f'<MarketOpportunity {self.id} - {self.opportunity_type}>'

