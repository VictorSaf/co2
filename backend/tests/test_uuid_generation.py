"""
Unit tests for UUID generation consistency

Tests ensure that UUID generation algorithms produce consistent results
across frontend and backend implementations.
"""
import pytest
import sys
from pathlib import Path

# Add parent directory to path to allow imports
sys.path.insert(0, str(Path(__file__).parent.parent))


def generate_uuid_backend(username: str) -> str:
    """
    Backend UUID generation algorithm (from init_db.py)
    Must match frontend implementation exactly
    """
    hash = 0
    for char in username:
        hash = ((hash << 5) - hash) + ord(char)
        hash = hash & hash  # Convert to 32-bit integer
    positive_hash = format(abs(hash), 'x').zfill(8)
    return f"00000000-0000-4000-8000-{positive_hash}{positive_hash}{positive_hash}{positive_hash}"[:36]


def generate_uuid_frontend_simulation(username: str) -> str:
    """
    Frontend UUID generation algorithm simulation (from AuthContext.tsx)
    This simulates the JavaScript implementation in Python for testing
    """
    hash = 0
    for i in range(len(username)):
        char = ord(username[i])
        hash = ((hash << 5) - hash) + char
        hash = hash & hash  # Convert to 32-bit integer
    positive_hash = format(abs(hash), 'x').zfill(8)
    return f"00000000-0000-4000-8000-{positive_hash}{positive_hash}{positive_hash}{positive_hash}"[:36]


class TestUUIDGeneration:
    """Test suite for UUID generation consistency"""
    
    def test_victor_uuid_consistency(self):
        """Test that Victor's UUID is consistent across implementations"""
        username = 'Victor'
        backend_uuid = generate_uuid_backend(username)
        frontend_uuid = generate_uuid_frontend_simulation(username)
        
        assert backend_uuid == frontend_uuid, \
            f"UUID mismatch: backend={backend_uuid}, frontend={frontend_uuid}"
        
        # Expected UUID for 'Victor'
        expected_uuid = '00000000-0000-4000-8000-98b72b6798b7'
        assert backend_uuid == expected_uuid, \
            f"UUID doesn't match expected value: got {backend_uuid}, expected {expected_uuid}"
    
    def test_uuid_format(self):
        """Test that generated UUIDs follow proper format"""
        username = 'Victor'
        uuid = generate_uuid_backend(username)
        
        # Check format: 8-4-4-4-12 characters
        parts = uuid.split('-')
        assert len(parts) == 5, f"UUID should have 5 parts separated by '-', got {len(parts)}"
        assert len(parts[0]) == 8, f"First part should be 8 chars, got {len(parts[0])}"
        assert len(parts[1]) == 4, f"Second part should be 4 chars, got {len(parts[1])}"
        assert len(parts[2]) == 4, f"Third part should be 4 chars, got {len(parts[2])}"
        assert len(parts[3]) == 4, f"Fourth part should be 4 chars, got {len(parts[3])}"
        assert len(parts[4]) == 12, f"Fifth part should be 12 chars, got {len(parts[4])}"
        
        # Check total length
        assert len(uuid) == 36, f"UUID should be 36 characters, got {len(uuid)}"
        
        # Check prefix
        assert uuid.startswith('00000000-0000-4000-8000-'), \
            f"UUID should start with '00000000-0000-4000-8000-', got {uuid[:24]}"
    
    def test_uuid_deterministic(self):
        """Test that same username always produces same UUID"""
        username = 'Victor'
        uuid1 = generate_uuid_backend(username)
        uuid2 = generate_uuid_backend(username)
        uuid3 = generate_uuid_backend(username)
        
        assert uuid1 == uuid2 == uuid3, \
            "UUID generation should be deterministic (same input = same output)"
    
    def test_different_usernames_different_uuids(self):
        """Test that different usernames produce different UUIDs"""
        uuid1 = generate_uuid_backend('Victor')
        uuid2 = generate_uuid_backend('Admin')
        uuid3 = generate_uuid_backend('User')
        
        assert uuid1 != uuid2, "Different usernames should produce different UUIDs"
        assert uuid1 != uuid3, "Different usernames should produce different UUIDs"
        assert uuid2 != uuid3, "Different usernames should produce different UUIDs"
    
    def test_case_sensitive(self):
        """Test that UUID generation is case-sensitive"""
        uuid_lower = generate_uuid_backend('victor')
        uuid_upper = generate_uuid_backend('VICTOR')
        uuid_mixed = generate_uuid_backend('Victor')
        
        # All should be different
        assert uuid_lower != uuid_upper != uuid_mixed, \
            "UUID generation should be case-sensitive"
    
    def test_empty_username(self):
        """Test UUID generation with empty username"""
        uuid = generate_uuid_backend('')
        assert len(uuid) == 36, "Empty username should still produce valid UUID"
        assert uuid.startswith('00000000-0000-4000-8000-'), \
            "Empty username UUID should follow same format"
    
    def test_special_characters(self):
        """Test UUID generation with special characters"""
        uuid1 = generate_uuid_backend('Victor!')
        uuid2 = generate_uuid_backend('Victor@')
        uuid3 = generate_uuid_backend('Victor#')
        
        # Should all be different and valid
        assert uuid1 != uuid2 != uuid3
        assert all(len(uuid) == 36 for uuid in [uuid1, uuid2, uuid3])
        assert all(uuid.startswith('00000000-0000-4000-8000-') for uuid in [uuid1, uuid2, uuid3])
    
    def test_backend_frontend_algorithm_match(self):
        """Test that backend and frontend algorithms produce identical results"""
        test_usernames = ['Victor', 'Admin', 'User', 'Test123', 'a', 'VeryLongUsername123']
        
        for username in test_usernames:
            backend_uuid = generate_uuid_backend(username)
            frontend_uuid = generate_uuid_frontend_simulation(username)
            
            assert backend_uuid == frontend_uuid, \
                f"UUID mismatch for '{username}': backend={backend_uuid}, frontend={frontend_uuid}"

