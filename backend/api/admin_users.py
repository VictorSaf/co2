"""
Admin Users API endpoints for user management
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
from werkzeug.security import generate_password_hash
from database import db
from models import User
from models.user import KYCStatus, RiskLevel
from utils.helpers import require_admin, standard_error_response, generate_uuid
from utils.validators import validate_email
from utils.serializers import to_camel_case

logger = logging.getLogger(__name__)

admin_users_bp = Blueprint('admin_users', __name__, url_prefix='/api/admin/users')


@admin_users_bp.route('', methods=['POST'])
@require_admin
def create_user():
    """
    Create a new user (admin only)
    
    This endpoint allows administrators to create new platform users. If a password
    is not provided, a random UUID is hashed and used as the password hash, which
    prevents the user from logging in without first resetting their password.
    
    Request Body:
        {
            "username": string (required, must be unique),
            "email": string (required, must be valid email format, must be unique),
            "password": string (optional),
            "companyName": string (optional),
            "address": string (optional),
            "contactPerson": string (optional),
            "phone": string (optional)
        }
    
    Default Values Set:
        - is_admin: False
        - kyc_status: PENDING
        - risk_level: LOW
    
    Returns:
        201: Created user object (camelCase format)
        400: Validation error (MISSING_USERNAME, MISSING_EMAIL, INVALID_EMAIL, EMAIL_EXISTS, USERNAME_EXISTS)
        500: Internal server error (CREATE_USER_ERROR)
    
    Security:
        - Requires admin authentication via @require_admin decorator
        - Password hashed using werkzeug.security.generate_password_hash
        - If password not provided, random UUID is hashed to prevent login without password reset
        - All actions are logged for audit purposes
    """
    try:
        data = request.get_json() or {}
        
        # Validate required fields
        username = data.get('username')
        email = data.get('email')
        
        if not username:
            return standard_error_response('Username is required', 'MISSING_USERNAME', 400)
        
        if not email:
            return standard_error_response('Email is required', 'MISSING_EMAIL', 400)
        
        # Validate email format
        if not validate_email(email):
            return standard_error_response('Invalid email format', 'INVALID_EMAIL', 400)
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return standard_error_response('Email already in use', 'EMAIL_EXISTS', 400)
        
        # Check if username already exists
        existing_username = User.query.filter_by(username=username).first()
        if existing_username:
            return standard_error_response('Username already in use', 'USERNAME_EXISTS', 400)
        
        # Hash password if provided
        # Note: If password is not provided, a random UUID is hashed and used as password.
        # This prevents the user from logging in without setting a password first (requires password reset).
        password = data.get('password')
        password_hash = None
        if password:
            password_hash = generate_password_hash(password)
        else:
            # Generate a random password hash if not provided (user will need to reset)
            # This is more secure than leaving password_hash as NULL, as it prevents
            # accidental login attempts with empty passwords.
            password_hash = generate_password_hash(generate_uuid())
        
        # Create user
        user = User(
            id=generate_uuid(),
            username=username,
            email=email,
            password_hash=password_hash,
            company_name=data.get('companyName'),
            address=data.get('address'),
            contact_person=data.get('contactPerson'),
            phone=data.get('phone'),
            is_admin=False,
            kyc_status=KYCStatus.PENDING,
            risk_level=RiskLevel.LOW
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Audit log: User creation
        admin_id = request.admin_id
        logger.info(
            f"ADMIN_ACTION: User created | "
            f"Admin ID: {admin_id} | "
            f"User ID: {user.id} | "
            f"Username: {username} | "
            f"Email: {email} | "
            f"Password provided: {bool(password)}"
        )
        
        return jsonify(user.to_dict(camel_case=True)), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating user: {e}", exc_info=True)
        return standard_error_response('Failed to create user', 'CREATE_USER_ERROR', 500)


@admin_users_bp.route('', methods=['GET'])
@require_admin
def list_users():
    """
    List all users with pagination and filtering
    Query params: page, per_page, kyc_status, risk_level, search
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        kyc_status = request.args.get('kyc_status')
        risk_level = request.args.get('risk_level')
        search = request.args.get('search', '').strip()

        # Build query
        query = User.query

        # Apply filters
        if kyc_status:
            query = query.filter(User.kyc_status == kyc_status)
        
        if risk_level:
            query = query.filter(User.risk_level == risk_level)
        
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                db.or_(
                    User.username.ilike(search_pattern),
                    User.email.ilike(search_pattern)
                )
            )

        # Get total count
        total = query.count()

        # Apply pagination
        users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

        # Serialize users
        users_data = [user.to_dict(camel_case=True) for user in users]

        return jsonify({
            'users': users_data,
            'total': total,
            'page': page,
            'perPage': per_page
        }), 200

    except Exception as e:
        logger.error(f"Error listing users: {e}", exc_info=True)
        return standard_error_response('Failed to list users', 'LIST_USERS_ERROR', 500)


@admin_users_bp.route('/<user_id>', methods=['GET'])
@require_admin
def get_user(user_id: str):
    """
    Get user details by ID
    """
    try:
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
        
        return jsonify(user.to_dict(camel_case=True)), 200

    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}", exc_info=True)
        return standard_error_response('Failed to get user', 'GET_USER_ERROR', 500)


@admin_users_bp.route('/<user_id>', methods=['PUT'])
@require_admin
def update_user(user_id: str):
    """
    Update user information
    Body: { email?, company_name?, ... }
    """
    try:
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
        
        data = request.get_json() or {}
        
        # Update allowed fields
        if 'email' in data:
            # Check if email is already taken by another user
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return standard_error_response('Email already in use', 'EMAIL_EXISTS', 400)
            user.email = data['email']
        
        if 'companyName' in data or 'company_name' in data:
            user.company_name = data.get('companyName') or data.get('company_name')
        
        if 'address' in data:
            user.address = data['address']
        
        if 'contactPerson' in data or 'contact_person' in data:
            user.contact_person = data.get('contactPerson') or data.get('contact_person')
        
        if 'phone' in data:
            user.phone = data['phone']
        
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Audit log: User update
        admin_id = request.admin_id
        updated_fields = [k for k in ['email', 'companyName', 'company_name', 'address', 'contactPerson', 'contact_person', 'phone'] if k in data]
        logger.info(
            f"ADMIN_ACTION: User updated | "
            f"Admin ID: {admin_id} | "
            f"User ID: {user_id} | "
            f"Updated fields: {', '.join(updated_fields)}"
        )
        
        return jsonify(user.to_dict(camel_case=True)), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating user {user_id}: {e}", exc_info=True)
        return standard_error_response('Failed to update user', 'UPDATE_USER_ERROR', 500)


@admin_users_bp.route('/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id: str):
    """
    Delete a user
    """
    try:
        user = User.query.filter_by(id=user_id).first()
        
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
        
        # Store user info for audit log before deletion
        deleted_username = user.username
        deleted_email = user.email
        
        db.session.delete(user)
        db.session.commit()
        
        # Audit log: User deletion
        admin_id = request.admin_id
        logger.info(
            f"ADMIN_ACTION: User deleted | "
            f"Admin ID: {admin_id} | "
            f"User ID: {user_id} | "
            f"Username: {deleted_username} | "
            f"Email: {deleted_email}"
        )
        
        return jsonify({'message': 'User deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting user {user_id}: {e}", exc_info=True)
        return standard_error_response('Failed to delete user', 'DELETE_USER_ERROR', 500)

