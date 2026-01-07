"""
KYC Document model
"""
from datetime import datetime
from sqlalchemy import Enum as SQLEnum
import enum
from database import db


class DocumentType(enum.Enum):
    """Document type enumeration"""
    COMPANY_REGISTRATION = 'company_registration'  # Certificat constatator
    FINANCIAL_STATEMENT = 'financial_statement'  # Bilanț contabil
    TAX_CERTIFICATE = 'tax_certificate'  # Certificat fiscal
    EU_ETS_PROOF = 'eu_ets_proof'  # Dovadă cont EU ETS Registry
    POWER_OF_ATTORNEY = 'power_of_attorney'  # Împuternicire reprezentant legal
    ID_DOCUMENT = 'id_document'  # Document identitate
    ADDRESS_PROOF = 'address_proof'  # Dovadă adresă
    BENEFICIAL_OWNERSHIP = 'beneficial_ownership'  # Documente beneficiari reali


class VerificationStatus(enum.Enum):
    """Document verification status"""
    PENDING = 'pending'
    VERIFIED = 'verified'
    REJECTED = 'rejected'


class KYCDocument(db.Model):
    """
    Model for KYC documents uploaded by users
    """
    __tablename__ = 'kyc_documents'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID as string
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Document type and file info
    document_type = db.Column(SQLEnum(DocumentType), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    mime_type = db.Column(db.String(100), nullable=False)
    
    # Verification info
    verification_status = db.Column(SQLEnum(VerificationStatus), 
                                   default=VerificationStatus.PENDING, 
                                   nullable=False)
    verification_notes = db.Column(db.Text, nullable=True)
    verified_by = db.Column(db.String(36), nullable=True)  # Reviewer user ID
    
    # Timestamps
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    verified_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self, camel_case: bool = True):
        """
        Convert document to dictionary
        Args:
            camel_case: If True, convert keys to camelCase for frontend compatibility
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'document_type': self.document_type.value if self.document_type else None,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'verification_status': self.verification_status.value if self.verification_status else None,
            'verification_notes': self.verification_notes,
            'verified_by': self.verified_by,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
        }
        
        if camel_case:
            from utils.serializers import to_camel_case
            return to_camel_case(data)
        return data

