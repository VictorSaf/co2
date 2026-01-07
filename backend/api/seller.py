"""
Seller Portal API endpoints
For Chinese entities selling CEA
"""
from flask import Blueprint, request, jsonify
from database import db
from models import Listing, ListingStatus, User, UserRole
from utils.helpers import require_auth, standard_error_response, generate_uuid
from datetime import datetime, timedelta
import uuid

seller_bp = Blueprint('seller', __name__)


@seller_bp.route('/listings', methods=['POST'])
@require_auth
def create_listing():
    """Create a new CEA listing"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is a seller
        if user.role != UserRole.CEA_SELLER and not user.is_admin:
            return standard_error_response('Access denied. Seller role required.', 'ACCESS_DENIED'), 403
        
        data = request.get_json()
        if not data:
            return standard_error_response('Request body required', 'MISSING_BODY'), 400
        
        # Validate required fields
        required_fields = ['volume', 'price_per_tonne', 'currency', 'timeline']
        for field in required_fields:
            if field not in data:
                return standard_error_response(f'Missing required field: {field}', f'MISSING_{field.upper()}'), 400
        
        # Generate seller code if not exists
        if not user.seller_code:
            # Generate unique seller code: SELLER-CN-{4-digit}
            import random
            code_number = random.randint(1000, 9999)
            user.seller_code = f"SELLER-CN-{code_number}"
            db.session.commit()
        
        # Create listing
        listing = Listing(
            id=str(uuid.uuid4()),
            seller_id=user_id,
            seller_code=user.seller_code,
            volume=int(data['volume']),
            price_per_tonne=float(data['price_per_tonne']),
            currency=data['currency'],
            timeline=data['timeline'],
            reference_price=float(data.get('reference_price')) if data.get('reference_price') else None,
            premium_expected=float(data.get('premium_expected')) if data.get('premium_expected') else None,
            settlement_currencies=data.get('settlement_currencies', [data['currency']]),
            tax_optimization_requested=data.get('tax_optimization_requested', False),
            status=ListingStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=30) if data.get('expires_at') is None else None
        )
        
        db.session.add(listing)
        db.session.commit()
        
        return jsonify(listing.to_dict(camel_case=True)), 201
        
    except Exception as e:
        db.session.rollback()
        return standard_error_response(f'Error creating listing: {str(e)}', 'CREATE_LISTING_ERROR'), 500


@seller_bp.route('/listings', methods=['GET'])
@require_auth
def list_listings():
    """List seller's listings"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is a seller
        if user.role != UserRole.CEA_SELLER and not user.is_admin:
            return standard_error_response('Access denied. Seller role required.', 'ACCESS_DENIED'), 403
        
        # Get query parameters
        status = request.args.get('status')
        
        # Query listings
        query = Listing.query.filter_by(seller_id=user_id)
        
        if status:
            try:
                status_enum = ListingStatus(status)
                query = query.filter_by(status=status_enum)
            except ValueError:
                return standard_error_response(f'Invalid status: {status}', 'INVALID_STATUS'), 400
        
        listings = query.order_by(Listing.created_at.desc()).all()
        
        return jsonify({
            'listings': [listing.to_dict(camel_case=True) for listing in listings],
            'total': len(listings)
        }), 200
        
    except Exception as e:
        return standard_error_response(f'Error listing listings: {str(e)}', 'LIST_LISTINGS_ERROR'), 500


@seller_bp.route('/listings/<listing_id>', methods=['GET'])
@require_auth
def get_listing(listing_id):
    """Get listing details"""
    try:
        user_id = request.headers.get('X-User-ID')
        listing = Listing.query.get(listing_id)
        
        if not listing:
            return standard_error_response('Listing not found', 'LISTING_NOT_FOUND'), 404
        
        # Verify ownership or admin
        user = User.query.get(user_id)
        if listing.seller_id != user_id and not (user and user.is_admin):
            return standard_error_response('Access denied', 'ACCESS_DENIED'), 403
        
        return jsonify(listing.to_dict(camel_case=True)), 200
        
    except Exception as e:
        return standard_error_response(f'Error getting listing: {str(e)}', 'GET_LISTING_ERROR'), 500


@seller_bp.route('/listings/<listing_id>', methods=['PUT'])
@require_auth
def update_listing(listing_id):
    """Update listing"""
    try:
        user_id = request.headers.get('X-User-ID')
        listing = Listing.query.get(listing_id)
        
        if not listing:
            return standard_error_response('Listing not found', 'LISTING_NOT_FOUND'), 404
        
        # Verify ownership
        if listing.seller_id != user_id:
            return standard_error_response('Access denied', 'ACCESS_DENIED'), 403
        
        data = request.get_json()
        if not data:
            return standard_error_response('Request body required', 'MISSING_BODY'), 400
        
        # Update allowed fields
        if 'volume' in data:
            listing.volume = int(data['volume'])
        if 'price_per_tonne' in data:
            listing.price_per_tonne = float(data['price_per_tonne'])
        if 'currency' in data:
            listing.currency = data['currency']
        if 'timeline' in data:
            listing.timeline = data['timeline']
        if 'status' in data:
            try:
                listing.status = ListingStatus(data['status'])
            except ValueError:
                return standard_error_response(f'Invalid status: {data["status"]}', 'INVALID_STATUS'), 400
        
        listing.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(listing.to_dict(camel_case=True)), 200
        
    except Exception as e:
        db.session.rollback()
        return standard_error_response(f'Error updating listing: {str(e)}', 'UPDATE_LISTING_ERROR'), 500


@seller_bp.route('/listings/<listing_id>', methods=['DELETE'])
@require_auth
def withdraw_listing(listing_id):
    """Withdraw listing"""
    try:
        user_id = request.headers.get('X-User-ID')
        listing = Listing.query.get(listing_id)
        
        if not listing:
            return standard_error_response('Listing not found', 'LISTING_NOT_FOUND'), 404
        
        # Verify ownership
        if listing.seller_id != user_id:
            return standard_error_response('Access denied', 'ACCESS_DENIED'), 403
        
        # Update status to WITHDRAWN
        listing.status = ListingStatus.WITHDRAWN
        listing.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(listing.to_dict(camel_case=True)), 200
        
    except Exception as e:
        db.session.rollback()
        return standard_error_response(f'Error withdrawing listing: {str(e)}', 'WITHDRAW_LISTING_ERROR'), 500

