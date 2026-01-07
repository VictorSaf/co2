"""
Helper utility functions
"""
import uuid
from functools import wraps
from flask import request, jsonify
from .validators import validate_uuid


def generate_uuid():
    """Generate a UUID string"""
    return str(uuid.uuid4())


def require_auth(f):
    """
    Decorator to require authentication for KYC endpoints.
    
    Currently a placeholder implementation for development. Validates:
    - Presence of X-User-ID header
    - Valid UUID format for user ID
    
    In production, this should be replaced with:
    - JWT token validation
    - Session-based authentication
    - OAuth2/OIDC integration
    
    Args:
        f: Function to decorate
        
    Returns:
        Decorated function that validates authentication before execution
        
    Raises:
        Returns 401 if authentication is missing
        Returns 400 if user ID format is invalid
        
    Note:
        Sets request.user_id attribute for use in route handlers
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # TODO: Implement real authentication
        # For now, check for user_id in headers or session
        user_id = request.headers.get('X-User-ID')
        if not user_id:
            return standard_error_response('Authentication required', 'AUTH_REQUIRED', 401)
        
        # Validate UUID format
        if not validate_uuid(user_id):
            return standard_error_response('Invalid user ID format', 'INVALID_USER_ID', 400)
        
        # Store user_id in request context for use in route handlers
        request.user_id = user_id
        
        return f(*args, **kwargs)
    return decorated_function


def require_admin(f):
    """
    Decorator to require admin authentication
    Verifies that the user exists in the database and has admin privileges
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_id = request.headers.get('X-Admin-ID')
        if not admin_id:
            return standard_error_response('Admin authentication required', 'ADMIN_AUTH_REQUIRED', 401)
        
        # Validate UUID format
        if not validate_uuid(admin_id):
            return standard_error_response('Invalid admin ID format', 'INVALID_ADMIN_ID', 400)
        
        # Check if user exists and has admin privileges
        from models import User
        admin_user = User.query.filter_by(id=admin_id).first()
        if not admin_user:
            return standard_error_response('Admin user not found', 'ADMIN_NOT_FOUND', 404)
        
        if not admin_user.is_admin:
            return standard_error_response('Admin privileges required', 'ADMIN_PRIVILEGES_REQUIRED', 403)
        
        # Store admin_id in request context for use in route handlers
        request.admin_id = admin_id
        
        return f(*args, **kwargs)
    return decorated_function


def is_victor_admin(admin_id: str) -> bool:
    """
    Check if admin_id corresponds to Victor and has admin privileges
    """
    if not validate_uuid(admin_id):
        return False
    
    from models import User
    user = User.query.filter_by(id=admin_id).first()
    return user is not None and user.is_admin and user.username == 'Victor'


def standard_error_response(error_message: str, error_code: str = None, status_code: int = 400):
    """
    Create standardized error response for API endpoints.
    
    All KYC API endpoints should use this function to ensure consistent
    error response format across the application.
    
    Args:
        error_message: User-friendly error message
        error_code: Optional error code for client-side handling
        status_code: HTTP status code (default: 400)
        
    Returns:
        Tuple of (jsonify response, status_code)
        
    Example:
        return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
    """
    response = {'error': error_message}
    if error_code:
        response['code'] = error_code
    return jsonify(response), status_code

