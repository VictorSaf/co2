"""
User model with KYC fields
"""
from datetime import datetime
from sqlalchemy import Enum as SQLEnum
import enum
import json
from database import db


class KYCStatus(enum.Enum):
    """KYC status enumeration"""
    PENDING = 'pending'
    IN_REVIEW = 'in_review'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    NEEDS_UPDATE = 'needs_update'


class RiskLevel(enum.Enum):
    """Risk level enumeration"""
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'


class SanctionsCheckStatus(enum.Enum):
    """Sanctions check status enumeration"""
    PENDING = 'pending'
    CLEARED = 'cleared'
    FLAGGED = 'flagged'


class UserRole(enum.Enum):
    """User role enumeration for platform access"""
    CEA_SELLER = 'cea_seller'  # Chinese entities selling CEA
    CEA_BUYER = 'cea_buyer'    # EU industrials buying CEA
    EUA_HOLDER = 'eua_holder'  # Institutional investors with EUA
    ADMIN = 'admin'             # Nihao staff/admin


class User(db.Model):
    """
    User model extended with KYC fields
    """
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID as string
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Basic user info
    company_name = db.Column(db.String(200))
    address = db.Column(db.Text)
    contact_person = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    
    # KYC Status fields
    kyc_status = db.Column(SQLEnum(KYCStatus), default=KYCStatus.PENDING, nullable=False)
    risk_level = db.Column(SQLEnum(RiskLevel), default=RiskLevel.LOW, nullable=False)
    
    # KYC Timestamps
    kyc_submitted_at = db.Column(db.DateTime, nullable=True)
    kyc_approved_at = db.Column(db.DateTime, nullable=True)
    kyc_reviewed_by = db.Column(db.String(36), nullable=True)  # Reviewer user ID
    kyc_rejection_reason = db.Column(db.Text, nullable=True)
    
    # KYC Documents metadata (JSON)
    kyc_documents = db.Column(db.JSON, default=list, nullable=False)
    
    # EU ETS Registry
    eu_ets_registry_account = db.Column(db.String(100), nullable=True)
    eu_ets_registry_country = db.Column(db.String(2), nullable=True)  # ISO country code
    eu_ets_registry_verified = db.Column(db.Boolean, default=False, nullable=False)
    eu_ets_registry_verified_at = db.Column(db.DateTime, nullable=True)
    
    # Suitability and Appropriateness assessments (JSON)
    suitability_assessment = db.Column(db.JSON, nullable=True)
    appropriateness_assessment = db.Column(db.JSON, nullable=True)
    
    # Beneficial owners (JSON array)
    beneficial_owners = db.Column(db.JSON, default=list, nullable=False)
    
    # PEP and Sanctions
    pep_status = db.Column(db.Boolean, default=False, nullable=False)
    sanctions_check_status = db.Column(SQLEnum(SanctionsCheckStatus), 
                                       default=SanctionsCheckStatus.PENDING, 
                                       nullable=False)
    sanctions_check_date = db.Column(db.DateTime, nullable=True)
    
    # Review tracking
    last_kyc_review = db.Column(db.DateTime, nullable=True)
    
    # Admin privileges
    is_admin = db.Column(db.Boolean, default=False, nullable=False, index=True)
    
    # User role for platform access
    role = db.Column(SQLEnum(UserRole), nullable=True, index=True)
    
    # Generic codes for anonymous matching (e.g., "SELLER-CN-2847", "BUYER-EU-5621")
    seller_code = db.Column(db.String(50), unique=True, nullable=True, index=True)
    buyer_code = db.Column(db.String(50), unique=True, nullable=True, index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, 
                          onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    documents = db.relationship('KYCDocument', backref='user', lazy=True, 
                              cascade='all, delete-orphan')
    workflow = db.relationship('KYCWorkflow', backref='user', lazy=True, 
                             uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self, camel_case: bool = True):
        """
        Convert user to dictionary
        Args:
            camel_case: If True, convert keys to camelCase for frontend compatibility
        """
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'company_name': self.company_name,
            'address': self.address,
            'contact_person': self.contact_person,
            'phone': self.phone,
            'kyc_status': self.kyc_status.value if self.kyc_status else None,
            'risk_level': self.risk_level.value if self.risk_level else None,
            'kyc_submitted_at': self.kyc_submitted_at.isoformat() if self.kyc_submitted_at else None,
            'kyc_approved_at': self.kyc_approved_at.isoformat() if self.kyc_approved_at else None,
            'kyc_reviewed_by': self.kyc_reviewed_by,
            'kyc_rejection_reason': self.kyc_rejection_reason,
            'kyc_documents': self.kyc_documents,
            'eu_ets_registry_account': self.eu_ets_registry_account,
            'eu_ets_registry_country': self.eu_ets_registry_country,
            'eu_ets_registry_verified': self.eu_ets_registry_verified,
            'eu_ets_registry_verified_at': self.eu_ets_registry_verified_at.isoformat() if self.eu_ets_registry_verified_at else None,
            'suitability_assessment': self.suitability_assessment,
            'appropriateness_assessment': self.appropriateness_assessment,
            'beneficial_owners': self.beneficial_owners,
            'pep_status': self.pep_status,
            'sanctions_check_status': self.sanctions_check_status.value if self.sanctions_check_status else None,
            'sanctions_check_date': self.sanctions_check_date.isoformat() if self.sanctions_check_date else None,
            'last_kyc_review': self.last_kyc_review.isoformat() if self.last_kyc_review else None,
            'is_admin': self.is_admin,
            'role': self.role.value if self.role else None,
            'seller_code': self.seller_code,
            'buyer_code': self.buyer_code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data

