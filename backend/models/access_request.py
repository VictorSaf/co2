"""
Access Request model for storing access requests from the login page
"""
from datetime import datetime
from sqlalchemy import Enum as SQLEnum
import enum
from database import db


class AccessRequestStatus(enum.Enum):
    """Access request status enumeration"""
    PENDING = 'pending'
    REVIEWED = 'reviewed'
    APPROVED = 'approved'
    REJECTED = 'rejected'


class AccessRequest(db.Model):
    """
    Access Request model for storing access requests from "Request Access" form.
    
    Fields:
        id: UUID primary key (string, 36 chars)
        entity: Company/organization name (string, max 200 chars, required)
        contact: Email address (string, max 120 chars, required, indexed)
        position: User's position in the entity (string, max 100 chars, required)
        reference: Reference number or code (string, max 100 chars, required)
        status: Request status enum (pending, reviewed, approved, rejected), default pending, indexed
        created_at: Timestamp when request was created (datetime, required, indexed)
        reviewed_at: Timestamp when request was reviewed (datetime, optional)
        reviewed_by: Admin user ID who reviewed the request (string, 36 chars, optional)
        notes: Admin notes about the request (text, optional)
    
    Note: The position field was added in feature 0022, and reference was made required.
    Run migration script migrate_access_requests_0022.py to update existing databases.
    """
    __tablename__ = 'access_requests'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID as string
    entity = db.Column(db.String(200), nullable=False)  # Company/organization name
    contact = db.Column(db.String(120), nullable=False, index=True)  # Email address
    position = db.Column(db.String(100), nullable=False)  # User's position in the entity
    reference = db.Column(db.String(100), nullable=False)  # Reference number or code
    status = db.Column(SQLEnum(AccessRequestStatus), default=AccessRequestStatus.PENDING, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    reviewed_by = db.Column(db.String(36), nullable=True)  # Admin user ID
    notes = db.Column(db.Text, nullable=True)
    
    def to_dict(self, camel_case: bool = True):
        """
        Convert access request to dictionary
        Args:
            camel_case: If True, convert keys to camelCase for frontend compatibility
        """
        data = {
            'id': self.id,
            'entity': self.entity,
            'contact': self.contact,
            'position': self.position,
            'reference': self.reference,
            'status': self.status.value if self.status else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'reviewed_by': self.reviewed_by,
            'notes': self.notes,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data

