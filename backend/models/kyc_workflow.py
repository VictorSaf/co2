"""
KYC Workflow model
"""
from datetime import datetime
from sqlalchemy import Enum as SQLEnum
import enum
from database import db


class WorkflowStep(enum.Enum):
    """Workflow step enumeration"""
    DOCUMENT_COLLECTION = 'document_collection'
    IDENTITY_VERIFICATION = 'identity_verification'
    SANCTIONS_CHECK = 'sanctions_check'
    EU_ETS_VERIFICATION = 'eu_ets_verification'
    SUITABILITY_ASSESSMENT = 'suitability_assessment'
    APPROPRIATENESS_ASSESSMENT = 'appropriateness_assessment'
    FINAL_REVIEW = 'final_review'
    APPROVED = 'approved'
    REJECTED = 'rejected'


class WorkflowStatus(enum.Enum):
    """Workflow status enumeration"""
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    REJECTED = 'rejected'
    ON_HOLD = 'on_hold'


class KYCWorkflow(db.Model):
    """
    Model for tracking KYC workflow progress
    """
    __tablename__ = 'kyc_workflows'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID as string
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), 
                       nullable=False, unique=True, index=True)
    
    # Workflow state
    current_step = db.Column(SQLEnum(WorkflowStep), 
                            default=WorkflowStep.DOCUMENT_COLLECTION, 
                            nullable=False)
    status = db.Column(SQLEnum(WorkflowStatus), 
                      default=WorkflowStatus.IN_PROGRESS, 
                      nullable=False)
    
    # Assignment and tracking
    assigned_reviewer = db.Column(db.String(36), nullable=True)  # Reviewer user ID
    workflow_data = db.Column(db.JSON, default=dict, nullable=False)  # Intermediate data
    notes = db.Column(db.Text, nullable=True)
    
    # Timestamps
    started_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self, camel_case: bool = True):
        """
        Convert workflow to dictionary
        Args:
            camel_case: If True, convert keys to camelCase for frontend compatibility
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'current_step': self.current_step.value if self.current_step else None,
            'status': self.status.value if self.status else None,
            'assigned_reviewer': self.assigned_reviewer,
            'workflow_data': self.workflow_data,
            'notes': self.notes,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data

