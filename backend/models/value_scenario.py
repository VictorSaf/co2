"""
Value Scenario Model

Stores calculated value scenarios for users.
"""

from datetime import datetime
from database import db
from utils.serializers import to_camel_case


class ValueScenario(db.Model):
    """Model for storing calculated value scenarios"""
    
    __tablename__ = 'value_scenarios'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    scenario_type = db.Column(db.String(20), nullable=False)  # 'seller_cea' or 'buyer_swap'
    input_data = db.Column(db.Text, nullable=False)  # JSON serialized
    nihao_benefits = db.Column(db.Text, nullable=False)  # JSON serialized
    alternative_costs = db.Column(db.Text, nullable=False)  # JSON serialized
    savings = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='value_scenarios')
    
    def __init__(self, **kwargs):
        super(ValueScenario, self).__init__(**kwargs)
        if not self.created_at:
            self.created_at = datetime.utcnow()
    
    def to_dict(self, camel_case=False):
        """Convert to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'scenario_type': self.scenario_type,
            'input_data': self.input_data,
            'nihao_benefits': self.nihao_benefits,
            'alternative_costs': self.alternative_costs,
            'savings': self.savings,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if camel_case:
            return to_camel_case(data)
        return data
    
    def __repr__(self):
        return f'<ValueScenario {self.id} - {self.scenario_type}>'

