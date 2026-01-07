"""
Input validation utilities
"""
import uuid
import re
from pathlib import Path


def validate_uuid(uuid_string: str) -> bool:
    """Validate that a string is a valid UUID"""
    try:
        uuid.UUID(uuid_string)
        return True
    except (ValueError, TypeError):
        return False


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal"""
    # Remove any path separators
    filename = filename.replace('/', '').replace('\\', '')
    # Remove any null bytes
    filename = filename.replace('\x00', '')
    # Remove any other dangerous characters
    filename = re.sub(r'[<>:"|?*]', '', filename)
    return filename


def validate_path_safe(path_component: str) -> bool:
    """
    Validate that a path component doesn't contain path traversal attempts.
    
    Checks for:
    - Path separators (/ or \)
    - Parent directory references (..)
    - Null bytes
    
    Used to prevent directory traversal attacks in file uploads.
    
    Args:
        path_component: String to validate
        
    Returns:
        True if safe, False if contains dangerous characters
    """
    if not path_component:
        return False
    # Check for path separators
    if '/' in path_component or '\\' in path_component:
        return False
    # Check for parent directory references
    if '..' in path_component:
        return False
    # Check for null bytes
    if '\x00' in path_component:
        return False
    return True


def sanitize_string(input_string: str, max_length: int = None) -> str:
    """Sanitize string input"""
    if not input_string:
        return ''
    # Remove null bytes
    sanitized = input_string.replace('\x00', '')
    # Trim whitespace
    sanitized = sanitized.strip()
    # Limit length if specified
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    return sanitized


def validate_email(email: str) -> bool:
    """Basic email validation"""
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Basic phone validation"""
    if not phone:
        return False
    # Remove common separators
    cleaned = re.sub(r'[\s\-\(\)\+]', '', phone)
    # Check if remaining are digits
    return cleaned.isdigit() and len(cleaned) >= 7 and len(cleaned) <= 15

