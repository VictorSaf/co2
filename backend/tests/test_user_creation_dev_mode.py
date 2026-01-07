"""
Unit tests for user auto-creation in development mode

Tests ensure that users are properly auto-created in development mode
when they don't exist, and that this is blocked in production mode.
"""
import pytest
import sys
import uuid
from pathlib import Path

# Add parent directory to path to allow imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Flask
from flask_cors import CORS
from database import db
from models import User
from models.user import KYCStatus, RiskLevel
from api.kyc import kyc_bp


@pytest.fixture
def app_development():
    """Create Flask app in development mode"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['DEBUG'] = True  # Development mode
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    CORS(app)
    db.init_app(app)
    app.register_blueprint(kyc_bp)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def app_production():
    """Create Flask app in production mode"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['DEBUG'] = False  # Production mode
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    CORS(app)
    db.init_app(app)
    app.register_blueprint(kyc_bp)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client_dev(app_development):
    """Test client for development mode"""
    return app_development.test_client()


@pytest.fixture
def client_prod(app_production):
    """Test client for production mode"""
    return app_production.test_client()


class TestUserAutoCreation:
    """Test suite for user auto-creation in development mode"""
    
    def test_user_auto_created_in_development(self, client_dev, app_development):
        """Test that user is auto-created in development mode when not found"""
        user_id = str(uuid.uuid4())
        registration_data = {
            'user_id': user_id,
            'company_name': 'Test Company',
            'address': '123 Test St',
            'contact_person': 'John Doe',
            'phone': '+1234567890'
        }
        
        # Verify user doesn't exist
        with app_development.app_context():
            user = User.query.filter_by(id=user_id).first()
            assert user is None, "User should not exist before registration"
        
        # Register (should auto-create user)
        response = client_dev.post(
            '/api/kyc/register',
            json=registration_data,
            content_type='application/json'
        )
        
        assert response.status_code == 200, \
            f"Registration should succeed in development mode, got {response.status_code}"
        
        # Verify user was created
        with app_development.app_context():
            user = User.query.filter_by(id=user_id).first()
            assert user is not None, "User should be auto-created in development mode"
            assert user.id == user_id, "User ID should match"
            assert user.username.startswith('user_'), "Auto-created user should have generated username"
            assert user.email.endswith('@example.com'), "Auto-created user should have generated email"
            assert user.kyc_status == KYCStatus.PENDING, "Auto-created user should have PENDING status"
            assert user.risk_level == RiskLevel.LOW, "Auto-created user should have LOW risk level"
    
    def test_user_not_auto_created_in_production(self, client_prod, app_production):
        """Test that user is NOT auto-created in production mode"""
        user_id = str(uuid.uuid4())
        registration_data = {
            'user_id': user_id,
            'company_name': 'Test Company',
            'address': '123 Test St',
            'contact_person': 'John Doe',
            'phone': '+1234567890'
        }
        
        # Verify user doesn't exist
        with app_production.app_context():
            user = User.query.filter_by(id=user_id).first()
            assert user is None, "User should not exist before registration"
        
        # Try to register (should fail with 404)
        response = client_prod.post(
            '/api/kyc/register',
            json=registration_data,
            content_type='application/json'
        )
        
        assert response.status_code == 404, \
            f"Registration should fail in production mode, got {response.status_code}"
        
        response_data = response.get_json()
        assert 'error' in response_data, "Error response should contain 'error' field"
        assert 'User not found' in response_data['error'], \
            f"Error message should indicate user not found, got: {response_data.get('error')}"
        
        # Verify user was NOT created
        with app_production.app_context():
            user = User.query.filter_by(id=user_id).first()
            assert user is None, "User should NOT be auto-created in production mode"
    
    def test_existing_user_updated_in_development(self, client_dev, app_development):
        """Test that existing user is updated (not recreated) in development mode"""
        user_id = str(uuid.uuid4())
        
        # Create user manually first
        with app_development.app_context():
            user = User(
                id=user_id,
                username='existing_user',
                email='existing@example.com',
                password_hash='hash',
                kyc_status=KYCStatus.PENDING,
                risk_level=RiskLevel.LOW
            )
            db.session.add(user)
            db.session.commit()
        
        registration_data = {
            'user_id': user_id,
            'company_name': 'Updated Company',
            'address': '456 Updated St',
            'contact_person': 'Jane Doe',
            'phone': '+9876543210'
        }
        
        # Register (should update existing user, not create new one)
        response = client_dev.post(
            '/api/kyc/register',
            json=registration_data,
            content_type='application/json'
        )
        
        assert response.status_code == 200, \
            "Registration should succeed with existing user"
        
        # Verify user was updated, not recreated
        with app_development.app_context():
            user = User.query.filter_by(id=user_id).first()
            assert user is not None, "User should still exist"
            assert user.username == 'existing_user', "Username should not change"
            assert user.email == 'existing@example.com', "Email should not change"
            assert user.company_name == 'Updated Company', "Company name should be updated"
            assert user.address == '456 Updated St', "Address should be updated"
            assert user.contact_person == 'Jane Doe', "Contact person should be updated"
            assert user.phone == '+9876543210', "Phone should be updated"
            
            # Verify only one user with this ID exists
            users = User.query.filter_by(id=user_id).all()
            assert len(users) == 1, "Should have exactly one user with this ID"

