"""
Unit tests for KYC registration endpoint

Tests the /api/kyc/register endpoint to ensure:
- Proper validation of input data
- User creation in development mode
- Workflow creation
- Error handling for missing/invalid data
- RiskLevel enum is properly imported and used
"""
import pytest
import uuid
import sys
import os
from pathlib import Path

# Add parent directory to path to allow imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Flask
from flask_cors import CORS
from database import db
from models import User, KYCWorkflow
from models.user import KYCStatus, RiskLevel
from models.kyc_workflow import WorkflowStep, WorkflowStatus
from api.kyc import kyc_bp


@pytest.fixture
def app():
    """Create Flask app for testing"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['FLASK_ENV'] = 'development'
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    
    # Register blueprint
    app.register_blueprint(kyc_bp)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def valid_user_id():
    """Generate a valid UUID for testing"""
    return str(uuid.uuid4())


@pytest.fixture
def valid_registration_data(valid_user_id):
    """Valid registration data"""
    return {
        'user_id': valid_user_id,
        'company_name': 'Test Company Ltd',
        'address': '123 Test Street, Test City',
        'contact_person': 'John Doe',
        'phone': '+1234567890'
    }


class TestKYCRegisterEndpoint:
    """Test suite for /api/kyc/register endpoint"""
    
    def test_register_success_new_user_development(self, client, valid_registration_data, app):
        """Test successful registration with new user in development mode"""
        with app.app_context():
            response = client.post(
                '/api/kyc/register',
                json=valid_registration_data,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            data = response.get_json()
            assert 'workflow' in data
            assert data['workflow']['currentStep'] == 'document_collection'
            assert data['workflow']['status'] == 'in_progress'
            
            # Verify user was created
            user = User.query.filter_by(id=valid_registration_data['user_id']).first()
            assert user is not None
            assert user.company_name == 'Test Company Ltd'
            assert user.risk_level == RiskLevel.LOW  # Verify RiskLevel is properly used
            assert user.kyc_status == KYCStatus.PENDING
            
            # Verify workflow was created
            workflow = KYCWorkflow.query.filter_by(user_id=valid_registration_data['user_id']).first()
            assert workflow is not None
            assert workflow.current_step == WorkflowStep.DOCUMENT_COLLECTION
    
    def test_register_success_existing_user(self, client, valid_registration_data, app):
        """Test successful registration with existing user"""
        with app.app_context():
            # Create user first
            user = User(
                id=valid_registration_data['user_id'],
                username='testuser',
                email='test@example.com',
                password_hash='hash',
                kyc_status=KYCStatus.PENDING,
                risk_level=RiskLevel.LOW
            )
            db.session.add(user)
            db.session.commit()
            
            response = client.post(
                '/api/kyc/register',
                json=valid_registration_data,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            data = response.get_json()
            assert 'workflow' in data
            
            # Verify user info was updated
            user = User.query.filter_by(id=valid_registration_data['user_id']).first()
            assert user.company_name == 'Test Company Ltd'
    
    def test_register_missing_user_id(self, client, valid_registration_data):
        """Test registration fails when user_id is missing"""
        data = valid_registration_data.copy()
        del data['user_id']
        
        response = client.post(
            '/api/kyc/register',
            json=data,
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'user_id is required' in data['error']
    
    def test_register_invalid_uuid(self, client, valid_registration_data):
        """Test registration fails with invalid UUID format"""
        data = valid_registration_data.copy()
        data['user_id'] = 'not-a-valid-uuid'
        
        response = client.post(
            '/api/kyc/register',
            json=data,
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'Invalid user ID format' in data['error']
    
    def test_register_missing_required_fields(self, client, valid_registration_data):
        """Test registration fails when required fields are missing"""
        # Test missing company_name
        data = valid_registration_data.copy()
        data['company_name'] = ''
        
        response = client.post(
            '/api/kyc/register',
            json=data,
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'All fields are required' in data['error']
    
    def test_register_risk_level_import(self, app):
        """Test that RiskLevel is properly imported and can be used"""
        with app.app_context():
            # This test ensures RiskLevel import works correctly
            user = User(
                id=str(uuid.uuid4()),
                username='test',
                email='test@example.com',
                password_hash='hash',
                kyc_status=KYCStatus.PENDING,
                risk_level=RiskLevel.LOW  # This would fail if RiskLevel wasn't imported
            )
            db.session.add(user)
            db.session.commit()
            
            # Verify it was saved correctly
            saved_user = User.query.filter_by(id=user.id).first()
            assert saved_user.risk_level == RiskLevel.LOW
    
    def test_register_workflow_creation(self, client, valid_registration_data, app):
        """Test that workflow is created with correct initial state"""
        with app.app_context():
            response = client.post(
                '/api/kyc/register',
                json=valid_registration_data,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            
            workflow = KYCWorkflow.query.filter_by(user_id=valid_registration_data['user_id']).first()
            assert workflow is not None
            assert workflow.current_step == WorkflowStep.DOCUMENT_COLLECTION
            assert workflow.status == WorkflowStatus.IN_PROGRESS
    
    def test_register_workflow_update_existing(self, client, valid_registration_data, app):
        """Test that existing workflow is updated correctly"""
        with app.app_context():
            # Create user and workflow first
            user = User(
                id=valid_registration_data['user_id'],
                username='testuser',
                email='test@example.com',
                password_hash='hash',
                kyc_status=KYCStatus.APPROVED,  # Different status
                risk_level=RiskLevel.MEDIUM  # Different risk level
            )
            db.session.add(user)
            
            workflow = KYCWorkflow(
                id=str(uuid.uuid4()),
                user_id=valid_registration_data['user_id'],
                current_step=WorkflowStep.SUITABILITY_ASSESSMENT,
                status=WorkflowStatus.IN_PROGRESS
            )
            db.session.add(workflow)
            db.session.commit()
            
            # Register again
            response = client.post(
                '/api/kyc/register',
                json=valid_registration_data,
                content_type='application/json'
            )
            
            assert response.status_code == 200
            
            # Verify workflow was reset to document_collection
            workflow = KYCWorkflow.query.filter_by(user_id=valid_registration_data['user_id']).first()
            assert workflow.current_step == WorkflowStep.DOCUMENT_COLLECTION


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

