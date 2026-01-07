"""
Unit tests for Calculator API endpoints

Tests the calculator endpoints to ensure:
- Proper validation of input data
- Correct calculation results
- Error handling for missing/invalid data
"""
import pytest
import sys
import os
from pathlib import Path

# Add parent directory to path to allow imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Flask
from flask_cors import CORS
from database import db
from models import User
from api.calculator import calculator_bp


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
    app.register_blueprint(calculator_bp)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def test_user(app):
    """Create test user"""
    with app.app_context():
        user = User(
            id='test-user-id-12345678901234567890',
            username='testuser',
            email='test@example.com',
            password_hash='dummy'
        )
        db.session.add(user)
        db.session.commit()
        return user


def test_seller_scenario_missing_volume(client, test_user):
    """Test seller scenario endpoint with missing volume"""
    response = client.post(
        '/api/calculator/seller-scenario',
        json={'currentPrice': 8.0},
        headers={'X-User-ID': test_user.id}
    )
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data
    assert 'volume' in data['error'].lower() or 'MISSING_VOLUME' in data.get('code', '')


def test_seller_scenario_missing_price(client, test_user):
    """Test seller scenario endpoint with missing price"""
    response = client.post(
        '/api/calculator/seller-scenario',
        json={'volume': 1000000},
        headers={'X-User-ID': test_user.id}
    )
    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_seller_scenario_valid(client, test_user):
    """Test seller scenario endpoint with valid data"""
    response = client.post(
        '/api/calculator/seller-scenario',
        json={
            'volume': 1000000,
            'currentPrice': 8.0,
            'urgency': 'normal',
            'confidentiality': False
        },
        headers={'X-User-ID': test_user.id}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert 'nihaoOffer' in data
    assert 'shanghaiAlternative' in data
    assert 'benefits' in data
    assert 'totalSavings' in data
    assert isinstance(data['totalSavings'], (int, float))


def test_buyer_swap_scenario_valid(client, test_user):
    """Test buyer swap scenario endpoint with valid data"""
    response = client.post(
        '/api/calculator/buyer-swap-scenario',
        json={
            'euaVolume': 100000,
            'euaPrice': 88.0,
            'useCase': 'compliance',
            'hasChinaOperations': False
        },
        headers={'X-User-ID': test_user.id}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert 'directSwapCosts' in data
    assert 'nihaoSwap' in data
    assert 'benefits' in data
    assert 'totalSavings' in data


def test_market_opportunities_endpoint(client):
    """Test market opportunities endpoint"""
    response = client.get(
        '/api/market/opportunities',
        query_string={'euaPrice': 88.0, 'ceaPrice': 8.0}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert 'opportunities' in data
    assert isinstance(data['opportunities'], list)


def test_market_analysis_endpoint(client):
    """Test market analysis endpoint"""
    response = client.get(
        '/api/market/analysis',
        query_string={'euaPrice': 88.0, 'ceaPrice': 8.0}
    )
    assert response.status_code == 200
    data = response.get_json()
    assert 'currentPrices' in data
    assert 'spread' in data
    assert 'arbitrageOpportunities' in data
    assert 'swapRecommendations' in data
    assert 'marketCondition' in data

