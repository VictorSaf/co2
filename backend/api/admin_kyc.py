"""
Admin KYC API endpoints for compliance team
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
from database import db
from models import User, KYCDocument, KYCWorkflow
from models.user import KYCStatus, RiskLevel, SanctionsCheckStatus
from models.kyc_document import VerificationStatus
from models.kyc_workflow import WorkflowStep, WorkflowStatus
from services.sanctions_checker import SanctionsChecker
from utils.helpers import generate_uuid, require_auth, require_admin, standard_error_response
from utils.validators import validate_uuid
from utils.serializers import to_camel_case

logger = logging.getLogger(__name__)

admin_kyc_bp = Blueprint('admin_kyc', __name__, url_prefix='/api/admin/kyc')




@admin_kyc_bp.route('/pending', methods=['GET'])
@require_admin
def list_pending():
    """
    List pending KYC dossiers
    Query params: status, risk_level, page, per_page
    """
    try:
        status_filter = request.args.get('status')
        risk_level_filter = request.args.get('risk_level')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        
        query = User.query
        
        if status_filter:
            try:
                status_enum = KYCStatus(status_filter)
                query = query.filter_by(kyc_status=status_enum)
            except ValueError:
                pass
        
        if risk_level_filter:
            try:
                risk_enum = RiskLevel(risk_level_filter)
                query = query.filter_by(risk_level=risk_enum)
            except ValueError:
                pass
        
        # Get pending or in_review users
        query = query.filter(
            User.kyc_status.in_([KYCStatus.PENDING, KYCStatus.IN_REVIEW, KYCStatus.NEEDS_UPDATE])
        )
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'users': [user.to_dict(camel_case=True) for user in pagination.items],
            'pagination': {
                'page': page,
                'perPage': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing pending KYC: {e}", exc_info=True)
        return standard_error_response('Failed to list pending KYC dossiers', 'LIST_ERROR', 500)


@admin_kyc_bp.route('/<user_id>', methods=['GET'])
@require_admin
def get_kyc_details(user_id):
    """Get detailed KYC information for a user"""
    try:
        # Validate UUID format
        if not validate_uuid(user_id):
            return standard_error_response('Invalid user ID format', 'INVALID_USER_ID', 400)
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
        
        documents = KYCDocument.query.filter_by(user_id=user_id).all()
        workflow = KYCWorkflow.query.filter_by(user_id=user_id).first()
        
        return jsonify({
            'user': user.to_dict(camel_case=True),
            'documents': [doc.to_dict(camel_case=True) for doc in documents],
            'workflow': workflow.to_dict(camel_case=True) if workflow else None
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting KYC details: {e}", exc_info=True)
        return standard_error_response('Failed to get KYC details', 'DETAILS_ERROR', 500)


@admin_kyc_bp.route('/<user_id>/approve', methods=['POST'])
@require_admin
def approve_kyc(user_id):
    """Approve KYC dossier"""
    try:
        # Validate UUID format
        if not validate_uuid(user_id):
            return standard_error_response('Invalid user ID format', 'INVALID_USER_ID', 400)
        
        admin_id = request.headers.get('X-Admin-ID')
        if not admin_id or not validate_uuid(admin_id):
            return standard_error_response('Invalid admin ID', 'INVALID_ADMIN_ID', 400)
        
        data = request.get_json() or {}
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
        
        # Update user status
        user.kyc_status = KYCStatus.APPROVED
        user.kyc_approved_at = datetime.utcnow()
        user.kyc_reviewed_by = admin_id
        
        # Update workflow
        workflow = KYCWorkflow.query.filter_by(user_id=user_id).first()
        if workflow:
            workflow.current_step = WorkflowStep.APPROVED
            workflow.status = WorkflowStatus.COMPLETED
            workflow.completed_at = datetime.utcnow()
            workflow.assigned_reviewer = admin_id
        
        db.session.commit()
        
        return jsonify({
            'message': 'KYC dossier approved',
            'user': user.to_dict(camel_case=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error approving KYC: {e}", exc_info=True)
        return standard_error_response('Failed to approve KYC dossier', 'APPROVE_ERROR', 500)


@admin_kyc_bp.route('/<user_id>/reject', methods=['POST'])
@require_admin
def reject_kyc(user_id):
    """Reject KYC dossier with reason"""
    try:
        # Validate UUID format
        if not validate_uuid(user_id):
            return standard_error_response('Invalid user ID format', 'INVALID_USER_ID', 400)
        
        admin_id = request.headers.get('X-Admin-ID')
        if not admin_id or not validate_uuid(admin_id):
            return standard_error_response('Invalid admin ID', 'INVALID_ADMIN_ID', 400)
        
        data = request.get_json()
        
        if not data or 'reason' not in data:
            return standard_error_response('Rejection reason is required', 'MISSING_REASON', 400)
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
        
        # Update user status
        user.kyc_status = KYCStatus.REJECTED
        user.kyc_rejection_reason = data['reason']
        user.kyc_reviewed_by = admin_id
        user.last_kyc_review = datetime.utcnow()
        
        # Update workflow
        workflow = KYCWorkflow.query.filter_by(user_id=user_id).first()
        if workflow:
            workflow.current_step = WorkflowStep.REJECTED
            workflow.status = WorkflowStatus.REJECTED
            workflow.completed_at = datetime.utcnow()
            workflow.assigned_reviewer = admin_id
            workflow.notes = data.get('notes', data['reason'])
        
        db.session.commit()
        
        return jsonify({
            'message': 'KYC dossier rejected',
            'user': user.to_dict(camel_case=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error rejecting KYC: {e}", exc_info=True)
        return standard_error_response('Failed to reject KYC dossier', 'REJECT_ERROR', 500)


@admin_kyc_bp.route('/<user_id>/request-update', methods=['POST'])
@require_admin
def request_update(user_id):
    """Request document updates from user"""
    try:
        # Validate UUID format
        if not validate_uuid(user_id):
            return standard_error_response('Invalid user ID format', 'INVALID_USER_ID', 400)
        
        admin_id = request.headers.get('X-Admin-ID')
        if not admin_id or not validate_uuid(admin_id):
            return standard_error_response('Invalid admin ID', 'INVALID_ADMIN_ID', 400)
        
        data = request.get_json()
        
        if not data or 'required_documents' not in data:
            return standard_error_response('required_documents list is required', 'MISSING_DOCUMENTS', 400)
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
        
        # Update user status
        user.kyc_status = KYCStatus.NEEDS_UPDATE
        user.kyc_reviewed_by = admin_id
        user.last_kyc_review = datetime.utcnow()
        user.kyc_rejection_reason = f"Required documents: {', '.join(data['required_documents'])}"
        
        # Update workflow
        workflow = KYCWorkflow.query.filter_by(user_id=user_id).first()
        if workflow:
            workflow.status = WorkflowStatus.ON_HOLD
            workflow.assigned_reviewer = admin_id
            workflow.notes = data.get('notes', '')
            workflow.workflow_data['required_documents'] = data['required_documents']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Update requested from user',
            'requiredDocuments': data['required_documents'],
            'user': user.to_dict(camel_case=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error requesting update: {e}", exc_info=True)
        return standard_error_response('Failed to request update', 'UPDATE_REQUEST_ERROR', 500)


@admin_kyc_bp.route('/<user_id>/verify-document/<document_id>', methods=['POST'])
@require_admin
def verify_document(user_id, document_id):
    """Verify or reject a specific document"""
    try:
        admin_id = request.headers.get('X-Admin-ID')
        data = request.get_json() or {}
        
        document = KYCDocument.query.filter_by(id=document_id, user_id=user_id).first()
        if not document:
            return standard_error_response('Document not found', 'DOCUMENT_NOT_FOUND', 404)
        
        action = data.get('action', 'verify')  # 'verify' or 'reject'
        
        if action == 'verify':
            document.verification_status = VerificationStatus.VERIFIED
            document.verified_at = datetime.utcnow()
            document.verified_by = admin_id
            document.verification_notes = data.get('notes', 'Document verified')
        elif action == 'reject':
            document.verification_status = VerificationStatus.REJECTED
            document.verified_by = admin_id
            document.verification_notes = data.get('notes', 'Document rejected')
        else:
            return standard_error_response('Invalid action. Use "verify" or "reject"', 'INVALID_ACTION', 400)
        
        db.session.commit()
        
        return jsonify({
            'message': f'Document {action}ed',
            'document': document.to_dict(camel_case=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error verifying document: {e}", exc_info=True)
        return standard_error_response('Failed to verify document. Please try again.', 'VERIFY_DOCUMENT_ERROR', 500)


@admin_kyc_bp.route('/<user_id>/sanctions-check', methods=['POST'])
@require_admin
def run_sanctions_check(user_id):
    """Run sanctions and PEP screening for a user"""
    try:
        # Validate UUID format
        if not validate_uuid(user_id):
            return standard_error_response('Invalid user ID format', 'INVALID_USER_ID', 400)
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
        
        # Run sanctions check
        sanctions_result = SanctionsChecker.check_sanctions(
            name=user.company_name or user.username,
            nationality=user.eu_ets_registry_country
        )
        
        # Update user
        user.sanctions_check_status = SanctionsCheckStatus.CLEARED if not sanctions_result['sanctions_match'] else SanctionsCheckStatus.FLAGGED
        user.sanctions_check_date = datetime.utcnow()
        user.pep_status = sanctions_result['pep_match']
        user.risk_level = RiskLevel(sanctions_result['risk_level'])
        
        # Check beneficial owners if available
        if user.beneficial_owners:
            beneficial_owners_result = SanctionsChecker.check_beneficial_owners(user.beneficial_owners)
            if beneficial_owners_result['risk_level'] == 'high':
                user.risk_level = RiskLevel.HIGH
            elif beneficial_owners_result['risk_level'] == 'medium' and user.risk_level == RiskLevel.LOW:
                user.risk_level = RiskLevel.MEDIUM
        
        db.session.commit()
        
        return jsonify({
            'message': 'Sanctions check completed',
            'result': to_camel_case(sanctions_result),
            'user': user.to_dict(camel_case=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error running sanctions check: {e}", exc_info=True)
        return standard_error_response('Failed to run sanctions check', 'SANCTIONS_CHECK_ERROR', 500)


@admin_kyc_bp.route('/<user_id>/set-risk-level', methods=['POST'])
@require_admin
def set_risk_level(user_id):
    """Set risk level for a user"""
    try:
        # Validate UUID format
        if not validate_uuid(user_id):
            return standard_error_response('Invalid user ID format', 'INVALID_USER_ID', 400)
        
        data = request.get_json()
        risk_level_str = data.get('risk_level')
        
        if not risk_level_str:
            return standard_error_response('risk_level is required', 'MISSING_RISK_LEVEL', 400)
        
        try:
            risk_level = RiskLevel(risk_level_str)
        except ValueError:
            return standard_error_response(f'Invalid risk_level: {risk_level_str}', 'INVALID_RISK_LEVEL', 400)
        
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return standard_error_response('User not found', 'USER_NOT_FOUND', 404)
        
        user.risk_level = risk_level
        db.session.commit()
        
        return jsonify({
            'message': 'Risk level updated',
            'user': user.to_dict(camel_case=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error setting risk level: {e}", exc_info=True)
        return standard_error_response('Failed to set risk level', 'SET_RISK_LEVEL_ERROR', 500)

