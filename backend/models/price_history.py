"""
Price History Database Model
Stores historical EUA price data from various sources
"""

from database import db
from datetime import datetime, timezone


class PriceHistory(db.Model):
    """Model for storing historical price data"""
    
    __tablename__ = 'price_history'
    __table_args__ = (
        db.Index('idx_price_history_timestamp_source', 'timestamp', 'source'),
    )
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), nullable=False, default='EUR')
    source = db.Column(db.String(100), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    change24h = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f'<PriceHistory {self.id}: {self.price} {self.currency} from {self.source} at {self.timestamp}>'
    
    def to_dict(self, camel_case=False):
        """
        Serialize to dictionary for API responses
        
        Args:
            camel_case: If True, convert keys to camelCase (for frontend compatibility)
        
        Returns:
            Dictionary representation of the model
        """
        data = {
            'id': self.id,
            'price': self.price,
            'currency': self.currency,
            'source': self.source,
            'timestamp': self.timestamp.isoformat() if isinstance(self.timestamp, datetime) else self.timestamp,
            'change24h': self.change24h,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
        }
        
        if camel_case:
            # Convert snake_case to camelCase
            return {
                'id': data['id'],
                'price': data['price'],
                'currency': data['currency'],
                'source': data['source'],
                'timestamp': data['timestamp'],
                'change24h': data['change24h'],
                'createdAt': data['created_at'],
            }
        
        return data

