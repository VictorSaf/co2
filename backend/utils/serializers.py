"""
Serialization utilities for converting snake_case to camelCase
"""
import re
from typing import Any, Dict, List


def snake_to_camel(snake_str: str) -> str:
    """Convert snake_case string to camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.capitalize() for x in components[1:])


def to_camel_case(data: Any) -> Any:
    """
    Recursively convert dictionary keys from snake_case to camelCase.
    
    Used to convert Python backend responses to JavaScript-friendly format.
    Handles nested dictionaries and lists.
    
    Args:
        data: Dictionary, list, or primitive value to convert
        
    Returns:
        Converted data with camelCase keys (or original value if not dict/list)
        
    Example:
        {'user_id': '123', 'kyc_status': 'pending'} 
        -> {'userId': '123', 'kycStatus': 'pending'}
    """
    if isinstance(data, dict):
        return {
            snake_to_camel(k) if isinstance(k, str) else k: to_camel_case(v)
            for k, v in data.items()
        }
    elif isinstance(data, list):
        return [to_camel_case(item) for item in data]
    else:
        return data


def to_snake_case(data: Any) -> Any:
    """
    Recursively convert dictionary keys from camelCase to snake_case
    """
    if isinstance(data, dict):
        result = {}
        for k, v in data.items():
            if isinstance(k, str):
                # Convert camelCase to snake_case
                snake_key = re.sub(r'(?<!^)(?=[A-Z])', '_', k).lower()
                result[snake_key] = to_snake_case(v)
            else:
                result[k] = to_snake_case(v)
        return result
    elif isinstance(data, list):
        return [to_snake_case(item) for item in data]
    else:
        return data

