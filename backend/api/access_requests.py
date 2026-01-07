"""
Access Requests API endpoints

This module provides REST API endpoints for handling access requests from the login page.

Endpoints:
- POST /api/access-requests - Create new access request (no authentication required)
- GET /api/admin/access-requests - List all access requests (admin only)
- GET /api/admin/access-requests/<request_id> - Get specific request (admin only)
- POST /api/admin/access-requests/<request_id>/review - Update request status (admin only)

All responses use camelCase format for frontend compatibility.
All errors use standardized error response format with error codes.
"""
from typing import Tuple, Dict, Any
from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models.access_request import AccessRequest, AccessRequestStatus
from utils.helpers import generate_uuid, require_auth, require_admin, standard_error_response
from utils.validators import validate_email, sanitize_string
from utils.serializers import to_camel_case
import logging

logger = logging.getLogger(__name__)

access_requests_bp = Blueprint('access_requests', __name__, url_prefix='/api')


@access_requests_bp.route('/access-requests', methods=['POST'])
def create_access_request():
    """
    Create a new access request (no authentication required)
    
    Body:
        {
            "entity": string (required),
            "contact": string (required, must be valid email),
            "position": string (required, max 100 chars),
            "reference": string (required, max 100 chars)
        }
    
    Returns:
        {
            "message": string,
            "requestId": string
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return standard_error_response(
                'Request body is required',
                'MISSING_BODY',
                400
            ), 400
        
        # Validate required fields
        entity = data.get('entity')
        contact = data.get('contact')
        position = data.get('position')
        reference = data.get('reference')
        
        if not entity:
            return standard_error_response(
                'Entity field is required',
                'MISSING_ENTITY',
                400
            ), 400
        
        if not contact:
            return standard_error_response(
                'Contact field is required',
                'MISSING_CONTACT',
                400
            ), 400
        
        if not position:
            return standard_error_response(
                'Position field is required',
                'MISSING_POSITION',
                400
            ), 400
        
        if not reference:
            return standard_error_response(
                'Reference field is required',
                'MISSING_REFERENCE',
                400
            ), 400
        
        # Validate email format
        if not validate_email(contact):
            return standard_error_response(
                'Invalid email address format',
                'INVALID_EMAIL',
                400
            ), 400
        
        # Sanitize inputs
        entity = sanitize_string(entity, max_length=200)
        contact = sanitize_string(contact, max_length=120)
        position = sanitize_string(position, max_length=100)
        reference = sanitize_string(reference, max_length=100)
        
        # Create access request
        access_request = AccessRequest(
            id=generate_uuid(),
            entity=entity,
            contact=contact,
            position=position,
            reference=reference,
            status=AccessRequestStatus.PENDING
        )
        
        db.session.add(access_request)
        db.session.commit()
        
        logger.info(f"Access request created: {access_request.id} for entity: {entity}")
        
        return jsonify({
            'message': 'Access request submitted successfully',
            'requestId': access_request.id
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating access request: {str(e)}", exc_info=True)
        db.session.rollback()
        return standard_error_response(
            'Failed to create access request',
            'INTERNAL_ERROR',
            500
        ), 500


@access_requests_bp.route('/admin/access-requests', methods=['GET'])
@require_admin
def list_access_requests():
    """
    List all access requests (admin only)
    
    This endpoint provides paginated access to all access requests with filtering
    and search capabilities. Results are sorted by creation date (newest first).
    
    Query Parameters:
        - status: Filter by status (pending, reviewed, approved, rejected)
        - limit: Number of results per page (default: 50, max recommended: 100)
        - offset: Pagination offset (default: 0)
        - search: Search by entity name or contact email (case-insensitive, partial match)
    
    Returns:
        200: {
            "requests": [AccessRequest],  # Array of access request objects (camelCase)
            "total": int,                 # Total number of requests matching filters
            "limit": int,                 # Number of results per page
            "offset": int                 # Pagination offset
        }
        400: Invalid status value (INVALID_STATUS)
        500: Internal server error (INTERNAL_ERROR)
    
    Sorting:
        Results are sorted by created_at descending (newest requests first).
    
    Search:
        Search parameter matches against both entity name and contact email fields
        using case-insensitive partial matching (ILIKE pattern).
    
    Security:
        - Requires admin authentication via @require_admin decorator
        - All responses use camelCase format for frontend compatibility
    """
    try:
        # Get query parameters
        status_filter = request.args.get('status')
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        search = request.args.get('search', '').strip()
        
        # Build query
        query = AccessRequest.query
        
        if status_filter:
            try:
                status_enum = AccessRequestStatus(status_filter)
                query = query.filter(AccessRequest.status == status_enum)
            except ValueError:
                return standard_error_response(
                    f'Invalid status: {status_filter}',
                    'INVALID_STATUS',
                    400
                ), 400
        
        # Apply search filter (entity or contact)
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                db.or_(
                    AccessRequest.entity.ilike(search_pattern),
                    AccessRequest.contact.ilike(search_pattern)
                )
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        requests = query.order_by(AccessRequest.created_at.desc()).limit(limit).offset(offset).all()
        
        return jsonify({
            'requests': [req.to_dict(camel_case=True) for req in requests],
            'total': total,
            'limit': limit,
            'offset': offset
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing access requests: {str(e)}", exc_info=True)
        return standard_error_response(
            'Failed to retrieve access requests',
            'INTERNAL_ERROR',
            500
        ), 500


@access_requests_bp.route('/admin/access-requests/<request_id>', methods=['GET'])
@require_admin
def get_access_request(request_id: str):
    """
    Get a specific access request by ID (admin only)
    
    Returns:
        AccessRequest object
    """
    try:
        access_request = AccessRequest.query.get(request_id)
        
        if not access_request:
            return standard_error_response(
                'Access request not found',
                'NOT_FOUND',
                404
            ), 404
        
        return jsonify(access_request.to_dict(camel_case=True)), 200
        
    except Exception as e:
        logger.error(f"Error retrieving access request: {str(e)}", exc_info=True)
        return standard_error_response(
            'Failed to retrieve access request',
            'INTERNAL_ERROR',
            500
        ), 500


@access_requests_bp.route('/admin/access-requests/<request_id>/review', methods=['POST'])
@require_admin
def review_access_request(request_id: str):
    """
    Update access request status (admin only)
    
    This endpoint allows administrators to review access requests by updating
    their status and adding notes. The reviewed_at timestamp and reviewed_by
    admin ID are automatically set.
    
    Request Body:
        {
            "status": string (required, one of: pending, reviewed, approved, rejected),
            "notes": string (optional, max 1000 characters, sanitized)
        }
    
    Updates:
        - Sets status to the provided value
        - Sets reviewed_at to current UTC timestamp
        - Sets reviewed_by to admin ID from X-Admin-ID header
        - Updates notes field if provided (sanitized, max 1000 chars)
    
    Returns:
        200: Updated AccessRequest object (camelCase format)
        400: Invalid status value or missing body (INVALID_STATUS, MISSING_BODY)
        404: Access request not found (NOT_FOUND)
        500: Internal server error (INTERNAL_ERROR)
    
    Security:
        - Requires admin authentication via @require_admin decorator
        - Notes are sanitized to prevent XSS attacks
        - All review actions are logged for audit purposes
        - Admin ID is extracted from X-Admin-ID header and stored in reviewed_by field
    """
    try:
        access_request = AccessRequest.query.get(request_id)
        
        if not access_request:
            return standard_error_response(
                'Access request not found',
                'NOT_FOUND',
                404
            ), 404
        
        data = request.get_json()
        
        if not data:
            return standard_error_response(
                'Request body is required',
                'MISSING_BODY',
                400
            ), 400
        
        # Update status
        new_status = data.get('status')
        if new_status:
            try:
                status_enum = AccessRequestStatus(new_status)
                access_request.status = status_enum
                access_request.reviewed_at = datetime.utcnow()
                access_request.reviewed_by = request.admin_id
            except ValueError:
                return standard_error_response(
                    f'Invalid status: {new_status}',
                    'INVALID_STATUS',
                    400
                ), 400
        
        # Update notes
        notes = data.get('notes')
        if notes is not None:
            access_request.notes = sanitize_string(notes, max_length=1000)
        
        db.session.commit()
        
        # Audit log: Access request review
        admin_id = request.admin_id
        old_status = access_request.status.value if hasattr(access_request, '_old_status') else 'unknown'
        logger.info(
            f"ADMIN_ACTION: Access request reviewed | "
            f"Admin ID: {admin_id} | "
            f"Request ID: {request_id} | "
            f"Entity: {access_request.entity} | "
            f"Contact: {access_request.contact} | "
            f"Status changed to: {access_request.status.value} | "
            f"Notes added: {bool(notes)}"
        )
        
        return jsonify(access_request.to_dict(camel_case=True)), 200
        
    except Exception as e:
        logger.error(f"Error reviewing access request: {str(e)}", exc_info=True)
        db.session.rollback()
        return standard_error_response(
            'Failed to update access request',
            'INTERNAL_ERROR',
            500
        ), 500

