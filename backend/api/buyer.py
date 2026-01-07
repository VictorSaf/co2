"""
Buyer Marketplace API endpoints
For EU industrials buying CEA
"""
from flask import Blueprint, request, jsonify
from database import db
from models import (
    Listing, ListingStatus, DemandListing, DemandStatus, IntendedUse,
    User, UserRole
)
from utils.helpers import require_auth, standard_error_response
from datetime import datetime, timedelta
import uuid

buyer_bp = Blueprint('buyer', __name__)


@buyer_bp.route('/offerings', methods=['GET'])
@require_auth
def browse_offerings():
    """Browse CEA offerings (anonymized)"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is a buyer
        if user.role != UserRole.CEA_BUYER and not user.is_admin:
            return standard_error_response('Access denied. Buyer role required.', 'ACCESS_DENIED'), 403
        
        # Get query parameters for filtering
        min_volume = request.args.get('min_volume', type=int)
        max_volume = request.args.get('max_volume', type=int)
        max_price = request.args.get('max_price', type=float)
        currency = request.args.get('currency')
        timeline = request.args.get('timeline')
        status = request.args.get('status', 'active')
        
        # Query active listings
        query = Listing.query.filter_by(status=ListingStatus.ACTIVE)
        
        if min_volume:
            query = query.filter(Listing.volume >= min_volume)
        if max_volume:
            query = query.filter(Listing.volume <= max_volume)
        if max_price:
            query = query.filter(Listing.price_per_tonne <= max_price)
        if currency:
            query = query.filter(Listing.currency == currency)
        if timeline:
            query = query.filter(Listing.timeline == timeline)
        
        listings = query.order_by(Listing.price_per_tonne.asc()).all()
        
        # Return anonymized listings (hide seller_id, show only seller_code)
        offerings = []
        for listing in listings:
            listing_dict = listing.to_dict(camel_case=True)
            # Remove seller_id, keep only seller_code for anonymity
            if 'sellerId' in listing_dict:
                del listing_dict['sellerId']
            offerings.append(listing_dict)
        
        return jsonify({
            'offerings': offerings,
            'total': len(offerings)
        }), 200
        
    except Exception as e:
        return standard_error_response(f'Error browsing offerings: {str(e)}', 'BROWSE_OFFERINGS_ERROR'), 500


@buyer_bp.route('/offerings/search', methods=['POST'])
@require_auth
def search_offerings():
    """Advanced search for CEA offerings"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is a buyer
        if user.role != UserRole.CEA_BUYER and not user.is_admin:
            return standard_error_response('Access denied. Buyer role required.', 'ACCESS_DENIED'), 403
        
        data = request.get_json() or {}
        
        # Build query
        query = Listing.query.filter_by(status=ListingStatus.ACTIVE)
        
        if 'volume_range' in data:
            min_vol = data['volume_range'].get('min')
            max_vol = data['volume_range'].get('max')
            if min_vol:
                query = query.filter(Listing.volume >= min_vol)
            if max_vol:
                query = query.filter(Listing.volume <= max_vol)
        
        if 'price_ceiling' in data:
            query = query.filter(Listing.price_per_tonne <= float(data['price_ceiling']))
        
        if 'currency' in data:
            query = query.filter(Listing.currency == data['currency'])
        
        if 'timeline' in data:
            query = query.filter(Listing.timeline == data['timeline'])
        
        listings = query.order_by(Listing.price_per_tonne.asc()).all()
        
        # Return anonymized listings
        offerings = []
        for listing in listings:
            listing_dict = listing.to_dict(camel_case=True)
            if 'sellerId' in listing_dict:
                del listing_dict['sellerId']
            offerings.append(listing_dict)
        
        return jsonify({
            'offerings': offerings,
            'total': len(offerings)
        }), 200
        
    except Exception as e:
        return standard_error_response(f'Error searching offerings: {str(e)}', 'SEARCH_OFFERINGS_ERROR'), 500


@buyer_bp.route('/demand', methods=['POST'])
@require_auth
def post_demand():
    """Post a demand listing"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is a buyer
        if user.role != UserRole.CEA_BUYER and not user.is_admin:
            return standard_error_response('Access denied. Buyer role required.', 'ACCESS_DENIED'), 403
        
        # Generate buyer code if not exists
        if not user.buyer_code:
            import random
            code_number = random.randint(1000, 9999)
            user.buyer_code = f"BUYER-EU-{code_number}"
            db.session.commit()
        
        data = request.get_json()
        if not data:
            return standard_error_response('Request body required', 'MISSING_BODY'), 400
        
        # Validate required fields
        required_fields = ['volume_needed', 'max_price', 'currency', 'timeline']
        for field in required_fields:
            if field not in data:
                return standard_error_response(f'Missing required field: {field}', f'MISSING_{field.upper()}'), 400
        
        # Create demand listing
        demand = DemandListing(
            id=str(uuid.uuid4()),
            buyer_id=user_id,
            buyer_code=user.buyer_code,
            volume_needed=int(data['volume_needed']),
            max_price=float(data['max_price']),
            currency=data['currency'],
            intended_use=IntendedUse(data['intended_use']) if data.get('intended_use') else None,
            timeline=data['timeline'],
            seller_preferences=data.get('seller_preferences'),
            status=DemandStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=30) if data.get('expires_at') is None else None
        )
        
        db.session.add(demand)
        db.session.commit()
        
        return jsonify(demand.to_dict(camel_case=True)), 201
        
    except Exception as e:
        db.session.rollback()
        return standard_error_response(f'Error posting demand: {str(e)}', 'POST_DEMAND_ERROR'), 500


@buyer_bp.route('/demand', methods=['GET'])
@require_auth
def list_demand():
    """List buyer's demand listings"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is a buyer
        if user.role != UserRole.CEA_BUYER and not user.is_admin:
            return standard_error_response('Access denied. Buyer role required.', 'ACCESS_DENIED'), 403
        
        demands = DemandListing.query.filter_by(buyer_id=user_id).order_by(DemandListing.created_at.desc()).all()
        
        return jsonify({
            'demands': [demand.to_dict(camel_case=True) for demand in demands],
            'total': len(demands)
        }), 200
        
    except Exception as e:
        return standard_error_response(f'Error listing demands: {str(e)}', 'LIST_DEMAND_ERROR'), 500


@buyer_bp.route('/portfolio', methods=['GET'])
@require_auth
def get_portfolio():
    """Get CEA portfolio holdings"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is a buyer
        if user.role != UserRole.CEA_BUYER and not user.is_admin:
            return standard_error_response('Access denied. Buyer role required.', 'ACCESS_DENIED'), 403
        
        from models import CEAPortfolio
        portfolio = CEAPortfolio.query.filter_by(user_id=user_id, is_available=True).all()
        
        total_volume = sum(p.volume for p in portfolio)
        total_cost = sum(p.volume * p.cost_basis for p in portfolio)
        avg_cost = total_cost / total_volume if total_volume > 0 else 0
        
        return jsonify({
            'holdings': [p.to_dict(camel_case=True) for p in portfolio],
            'total_volume': total_volume,
            'total_cost': float(total_cost),
            'average_cost': float(avg_cost),
            'count': len(portfolio)
        }), 200
        
    except Exception as e:
        return standard_error_response(f'Error getting portfolio: {str(e)}', 'GET_PORTFOLIO_ERROR'), 500

