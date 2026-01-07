# Backend Tests

This directory contains unit tests for the backend API endpoints.

## Test Structure

- `test_kyc_register.py` - Tests for the KYC registration endpoint (`/api/kyc/register`)
- `test_uuid_generation.py` - Tests for UUID generation consistency between frontend and backend
- `test_user_creation_dev_mode.py` - Tests for user auto-creation in development mode

## Running Tests

### Prerequisites

Install test dependencies:
```bash
pip install pytest pytest-flask
```

Or add to `requirements.txt`:
```
pytest==7.4.3
pytest-flask==1.3.0
```

### Run All Tests

```bash
pytest tests/ -v
```

### Run Specific Test File

```bash
pytest tests/test_kyc_register.py -v
pytest tests/test_uuid_generation.py -v
pytest tests/test_user_creation_dev_mode.py -v
```

### Run Specific Test

```bash
pytest tests/test_kyc_register.py::TestKYCRegisterEndpoint::test_register_success_new_user_development -v
```

## Test Coverage

The tests verify:
- ✅ Input validation (missing fields, invalid UUID format)
- ✅ User creation in development mode
- ✅ Workflow creation and updates
- ✅ RiskLevel enum import and usage (bug fix verification)
- ✅ Error handling and response codes
- ✅ Data persistence
- ✅ UUID generation consistency (frontend/backend algorithm matching)
- ✅ UUID format validation (proper UUID v4 structure)
- ✅ UUID determinism (same input = same output)
- ✅ User auto-creation blocked in production mode
- ✅ Existing user updates (not recreation) in development mode

## Adding New Tests

When adding new endpoints or features:

1. Create a new test file: `test_<feature_name>.py`
2. Follow the existing test structure using pytest fixtures
3. Test both success and error cases
4. Verify database state changes
5. Test edge cases and boundary conditions

## Test Database

Tests use an in-memory SQLite database (`sqlite:///:memory:`) that is created fresh for each test run. No production data is affected.

