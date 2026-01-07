"""
Swap Desk API endpoints
For institutional investors swapping EUA→CEA
"""
from flask import Blueprint, request, jsonify
from database import db
from models import (
    SwapRequest, SwapRequestStatus, SwapQuote, SwapQuoteStatus,
    User, UserRole
)
from utils.helpers import require_auth, standard_error_response
from datetime import datetime, timedelta
import uuid

swap_bp = Blueprint('swap', __name__)


@swap_bp.route('/request', methods=['POST'])
@require_auth
def request_swap():
    """Request a swap quote"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is EUA holder
        if user.role != UserRole.EUA_HOLDER and not user.is_admin:
            return standard_error_response('Access denied. EUA holder role required.', 'ACCESS_DENIED'), 403
        
        data = request.get_json()
        if not data:
            return standard_error_response('Request body required', 'MISSING_BODY'), 400
        
        # Validate required fields
        required_fields = ['eua_volume', 'settlement_timeline']
        for field in required_fields:
            if field not in data:
                return standard_error_response(f'Missing required field: {field}', f'MISSING_{field.upper()}'), 400
        
        # Create swap request
        swap_request = SwapRequest(
            id=str(uuid.uuid4()),
            requester_id=user_id,
            eua_volume=int(data['eua_volume']),
            eua_average_cost=float(data.get('eua_average_cost')) if data.get('eua_average_cost') else None,
            eua_current_price=float(data.get('eua_current_price')) if data.get('eua_current_price') else None,
            desired_ratio=float(data.get('desired_ratio')) if data.get('desired_ratio') else None,
            target_profile=data.get('target_profile'),
            investment_horizon=data.get('investment_horizon'),
            expected_cea_price_target=float(data.get('expected_cea_price_target')) if data.get('expected_cea_price_target') else None,
            settlement_timeline=data['settlement_timeline'],
            insurance_required=data.get('insurance_required', True),
            counterparty_preferences=data.get('counterparty_preferences'),
            status=SwapRequestStatus.PENDING
        )
        
        db.session.add(swap_request)
        db.session.commit()
        
        return jsonify(swap_request.to_dict(camel_case=True)), 201
        
    except Exception as e:
        db.session.rollback()
        return standard_error_response(f'Error creating swap request: {str(e)}', 'CREATE_SWAP_REQUEST_ERROR'), 500


@swap_bp.route('/requests', methods=['GET'])
@require_auth
def list_swap_requests():
    """List swap requests"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is EUA holder
        if user.role != UserRole.EUA_HOLDER and not user.is_admin:
            return standard_error_response('Access denied. EUA holder role required.', 'ACCESS_DENIED'), 403
        
        # Get user's swap requests
        requests = SwapRequest.query.filter_by(requester_id=user_id).order_by(SwapRequest.created_at.desc()).all()
        
        return jsonify({
            'requests': [req.to_dict(camel_case=True) for req in requests],
            'total': len(requests)
        }), 200
        
    except Exception as e:
        return standard_error_response(f'Error listing swap requests: {str(e)}', 'LIST_SWAP_REQUESTS_ERROR'), 500


@swap_bp.route('/requests/<request_id>', methods=['GET'])
@require_auth
def get_swap_request(request_id):
    """Get swap request details"""
    try:
        user_id = request.headers.get('X-User-ID')
        swap_request = SwapRequest.query.get(request_id)
        
        if not swap_request:
            return standard_error_response('Swap request not found', 'SWAP_REQUEST_NOT_FOUND'), 404
        
        # Verify ownership or admin
        user = User.query.get(user_id)
        if swap_request.requester_id != user_id and not (user and user.is_admin):
            return standard_error_response('Access denied', 'ACCESS_DENIED'), 403
        
        response_data = swap_request.to_dict(camel_case=True)
        
        # Include quotes if any
        quotes = SwapQuote.query.filter_by(swap_request_id=request_id).all()
        response_data['quotes'] = [quote.to_dict(camel_case=True) for quote in quotes]
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return standard_error_response(f'Error getting swap request: {str(e)}', 'GET_SWAP_REQUEST_ERROR'), 500


@swap_bp.route('/quotes/<quote_id>', methods=['GET'])
@require_auth
def get_swap_quote(quote_id):
    """Get swap quote details"""
    try:
        user_id = request.headers.get('X-User-ID')
        quote = SwapQuote.query.get(quote_id)
        
        if not quote:
            return standard_error_response('Swap quote not found', 'SWAP_QUOTE_NOT_FOUND'), 404
        
        # Verify ownership or admin
        swap_request = SwapRequest.query.get(quote.swap_request_id)
        user = User.query.get(user_id)
        if swap_request.requester_id != user_id and not (user and user.is_admin):
            return standard_error_response('Access denied', 'ACCESS_DENIED'), 403
        
        return jsonify(quote.to_dict(camel_case=True)), 200
        
    except Exception as e:
        return standard_error_response(f'Error getting swap quote: {str(e)}', 'GET_SWAP_QUOTE_ERROR'), 500


@swap_bp.route('/quotes/<quote_id>/accept', methods=['POST'])
@require_auth
def accept_swap_quote(quote_id):
    """Accept a swap quote"""
    try:
        user_id = request.headers.get('X-User-ID')
        quote = SwapQuote.query.get(quote_id)
        
        if not quote:
            return standard_error_response('Swap quote not found', 'SWAP_QUOTE_NOT_FOUND'), 404
        
        # Verify ownership
        swap_request = SwapRequest.query.get(quote.swap_request_id)
        if swap_request.requester_id != user_id:
            return standard_error_response('Access denied', 'ACCESS_DENIED'), 403
        
        # Check if quote is still valid
        if quote.status != SwapQuoteStatus.PENDING:
            return standard_error_response('Quote is no longer available', 'QUOTE_NOT_AVAILABLE'), 400
        
        if quote.valid_until < datetime.utcnow():
            quote.status = SwapQuoteStatus.EXPIRED
            db.session.commit()
            return standard_error_response('Quote has expired', 'QUOTE_EXPIRED'), 400
        
        # Update quote and request status
        quote.status = SwapQuoteStatus.ACCEPTED
        swap_request.status = SwapRequestStatus.ACCEPTED
        quote.updated_at = datetime.utcnow()
        swap_request.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(quote.to_dict(camel_case=True)), 200
        
    except Exception as e:
        db.session.rollback()
        return standard_error_response(f'Error accepting quote: {str(e)}', 'ACCEPT_QUOTE_ERROR'), 500


@swap_bp.route('/portfolio', methods=['GET'])
@require_auth
def get_swap_portfolio():
    """Get institutional portfolio analytics"""
    try:
        user_id = request.headers.get('X-User-ID')
        user = User.query.get(user_id)
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND'), 404
        
        # Verify user is EUA holder
        if user.role != UserRole.EUA_HOLDER and not user.is_admin:
            return standard_error_response('Access denied. EUA holder role required.', 'ACCESS_DENIED'), 403
        
        # Get swap requests and quotes
        swap_requests = SwapRequest.query.filter_by(requester_id=user_id).all()
        
        # Calculate portfolio metrics
        total_eua_volume = sum(req.eua_volume for req in swap_requests if req.eua_volume)
        pending_swaps = [req for req in swap_requests if req.status == SwapRequestStatus.PENDING]
        accepted_swaps = [req for req in swap_requests if req.status == SwapRequestStatus.ACCEPTED]
        
        return jsonify({
            'total_eua_volume': total_eua_volume,
            'pending_swaps_count': len(pending_swaps),
            'accepted_swaps_count': len(accepted_swaps),
            'swap_requests': [req.to_dict(camel_case=True) for req in swap_requests]
        }), 200
        
    except Exception as e:
        return standard_error_response(f'Error getting portfolio: {str(e)}', 'GET_SWAP_PORTFOLIO_ERROR'), 500

