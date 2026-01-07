"""
Configuration for Flask application
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY')
    if not SECRET_KEY:
        # In production, SECRET_KEY must be set
        if os.environ.get('FLASK_ENV') == 'production':
            raise ValueError(
                'SECRET_KEY environment variable must be set in production. '
                'Generate a secure key using: python -c "import secrets; print(secrets.token_hex(32))"'
            )
        # Only allow default in development
        SECRET_KEY = 'dev-secret-key-change-in-production'
        import warnings
        warnings.warn(
            'Using default SECRET_KEY. This is insecure for production! '
            'Set SECRET_KEY environment variable before deploying.'
        )
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'sqlite:///{BASE_DIR}/kyc_database.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File upload configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'kyc_documents')
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}
    
    # KYC Configuration
    KYC_DOCUMENT_MAX_AGE_DAYS = 90  # Maximum age for company registration certificate
    
    # Sanctions checker configuration (for future integration)
    SANCTIONS_CHECK_ENABLED = os.environ.get('SANCTIONS_CHECK_ENABLED', 'true').lower() == 'true'
    
    # EU ETS Registry verification (for future integration)
    EU_ETS_VERIFICATION_ENABLED = os.environ.get('EU_ETS_VERIFICATION_ENABLED', 'true').lower() == 'true'

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'sqlite:///{BASE_DIR}/kyc_database_dev.db'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    # Use PostgreSQL in production if DATABASE_URL is set, otherwise fall back to SQLite
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'sqlite:///{BASE_DIR}/kyc_database.db'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

