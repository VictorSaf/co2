"""
Admin Configuration API endpoints for platform settings
"""
from flask import Blueprint, request, jsonify
import logging
import os
from utils.helpers import require_admin, standard_error_response

logger = logging.getLogger(__name__)

admin_config_bp = Blueprint('admin_config', __name__, url_prefix='/api/admin/config')

# In-memory config store (in production, use database or config file)
PLATFORM_CONFIG = {
    'platform_name': os.getenv('PLATFORM_NAME', 'Nihao Carbon Certificates'),
    'contact_email': os.getenv('CONTACT_EMAIL', 'contact@nihao.com'),
    'cache_duration': int(os.getenv('CACHE_DURATION', 120)),
    'rate_limit_per_day': int(os.getenv('RATE_LIMIT_PER_DAY', 200)),
    'rate_limit_per_hour': int(os.getenv('RATE_LIMIT_PER_HOUR', 50)),
}


@admin_config_bp.route('', methods=['GET'])
@require_admin
def get_config():
    """
    Get current platform configuration
    """
    try:
        return jsonify({
            'platformName': PLATFORM_CONFIG['platform_name'],
            'contactEmail': PLATFORM_CONFIG['contact_email'],
            'cacheDuration': PLATFORM_CONFIG['cache_duration'],
            'rateLimitPerDay': PLATFORM_CONFIG['rate_limit_per_day'],
            'rateLimitPerHour': PLATFORM_CONFIG['rate_limit_per_hour'],
        }), 200

    except Exception as e:
        logger.error(f"Error getting config: {e}", exc_info=True)
        return standard_error_response('Failed to get configuration', 'GET_CONFIG_ERROR', 500)


@admin_config_bp.route('', methods=['PUT'])
@require_admin
def update_config():
    """
    Update platform configuration
    Body: { platformName?, contactEmail?, cacheDuration?, ... }
    """
    try:
        data = request.get_json() or {}
        
        if 'platformName' in data:
            PLATFORM_CONFIG['platform_name'] = data['platformName']
        
        if 'contactEmail' in data:
            PLATFORM_CONFIG['contact_email'] = data['contactEmail']
        
        if 'cacheDuration' in data:
            cache_duration = int(data['cacheDuration'])
            if cache_duration < 60 or cache_duration > 600:
                return standard_error_response('Cache duration must be between 60 and 600 seconds', 'INVALID_CACHE_DURATION', 400)
            PLATFORM_CONFIG['cache_duration'] = cache_duration
        
        if 'rateLimitPerDay' in data:
            PLATFORM_CONFIG['rate_limit_per_day'] = int(data['rateLimitPerDay'])
        
        if 'rateLimitPerHour' in data:
            PLATFORM_CONFIG['rate_limit_per_hour'] = int(data['rateLimitPerHour'])
        
        return jsonify({
            'platformName': PLATFORM_CONFIG['platform_name'],
            'contactEmail': PLATFORM_CONFIG['contact_email'],
            'cacheDuration': PLATFORM_CONFIG['cache_duration'],
            'rateLimitPerDay': PLATFORM_CONFIG['rate_limit_per_day'],
            'rateLimitPerHour': PLATFORM_CONFIG['rate_limit_per_hour'],
        }), 200

    except ValueError as e:
        logger.error(f"Invalid config value: {e}", exc_info=True)
        return standard_error_response('Invalid configuration value', 'INVALID_CONFIG_VALUE', 400)
    except Exception as e:
        logger.error(f"Error updating config: {e}", exc_info=True)
        return standard_error_response('Failed to update configuration', 'UPDATE_CONFIG_ERROR', 500)


@admin_config_bp.route('/price-updates', methods=['GET'])
@require_admin
def get_price_update_config():
    """
    Get price update configuration
    """
    try:
        return jsonify({
            'pollingInterval': 300000,  # 5 minutes
            'cacheDuration': int(os.getenv('CACHE_DURATION', 120)),
        }), 200

    except Exception as e:
        logger.error(f"Error getting price update config: {e}", exc_info=True)
        return standard_error_response('Failed to get price update configuration', 'GET_PRICE_CONFIG_ERROR', 500)

