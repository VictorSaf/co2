# KYC System API Documentation

## Overview

The KYC (Know Your Customer) system provides endpoints for client onboarding, document management, and compliance review.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Initialize the database:
```bash
python init_db.py
```

3. Create upload directory:
```bash
mkdir -p backend/uploads/kyc_documents
```

## API Endpoints

### User Endpoints (`/api/kyc`)

#### POST `/api/kyc/register`
Start KYC onboarding process.

**Note**: This endpoint does **not** require authentication via `X-User-ID` header. It's the initial step in the onboarding process and accepts `user_id` in the request body.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "user_id": "string (UUID format, required)",
  "company_name": "string (required, max 200 chars)",
  "address": "string (required, max 1000 chars)",
  "contact_person": "string (required, max 100 chars)",
  "phone": "string (required, max 20 chars)"
}
```

**Response (200 OK):**
```json
{
  "message": "Onboarding started",
  "workflow": {
    "id": "uuid",
    "userId": "uuid",
    "currentStep": "document_collection",
    "status": "in_progress",
    ...
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid `user_id`, missing required fields, invalid UUID format
  ```json
  {
    "error": "user_id is required",
    "code": "MISSING_USER_ID"
  }
  ```
- `404 Not Found`: User not found (production mode only)
  ```json
  {
    "error": "User not found",
    "code": "USER_NOT_FOUND"
  }
  ```
- `500 Internal Server Error`: Internal server error
  ```json
  {
    "error": "Failed to start onboarding. Please try again.",
    "code": "REGISTER_ERROR"
  }
  ```

**Behavior:**
- **Development Mode** (`DEBUG=True`): If the user doesn't exist, the endpoint will auto-create a user with minimal required fields (generated username, generated email, empty password hash) and set `risk_level` to `LOW`, `kyc_status` to `PENDING`. A warning is logged when auto-creating users.
- **Production Mode** (`DEBUG=False`): The user must already exist; if not found, returns 404 error
- **Mode Detection**: Uses `current_app.config.get('DEBUG', False)` to check development mode (not `FLASK_ENV` which may not be in config)
- Creates or updates a `KYCWorkflow` with `current_step` set to `document_collection`
- All input fields are sanitized and validated before processing

#### POST `/api/kyc/documents/upload`
Upload a KYC document.

**Headers:**
- `X-User-ID: string` (required)
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: File to upload (PDF, PNG, JPG, JPEG, DOC, DOCX, max 16MB)
- `document_type`: One of: `company_registration`, `financial_statement`, `tax_certificate`, `eu_ets_proof`, `power_of_attorney`, `id_document`, `address_proof`, `beneficial_ownership`

**Notes:**
- Multiple documents can be uploaded per document type (no unique constraint)
- All document types accept PDF, PNG, JPG, and JPEG formats
- Company registration certificates accept all allowed file types (not restricted to PDF only)
- Frontend supports bulk upload (multiple files selected at once, uploaded sequentially)
- Documents are automatically sorted by upload date (newest first) in the UI

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": "uuid",
    "userId": "uuid",
    "documentType": "company_registration",
    "fileName": "document.pdf",
    "fileSize": 123456,
    "verificationStatus": "pending",
    "uploadedAt": "2025-01-27T12:00:00Z"
  }
}
```

#### GET `/api/kyc/documents`
List all documents for the authenticated user.

**Headers:**
- `X-User-ID: string` (required)

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "documentType": "company_registration",
      "fileName": "document.pdf",
      "verificationStatus": "verified",
      ...
    }
  ]
}
```

**Notes:**
- Returns all documents for the user, including multiple documents per document type
- Each document has its own verification status
- Frontend automatically sorts documents by upload date (newest first) for better user experience

#### GET `/api/kyc/documents/<document_id>/preview`
Preview an image document (for displaying thumbnails in UI).

**Headers:**
- `X-User-ID: string` (required)

**Response:**
- Image file stream (PNG, JPG, JPEG only)
- Content-Type: `image/png`, `image/jpeg`, or `image/jpg`

**Errors:**
- `400`: Document is not an image file (preview only available for image files)
- `404`: Document not found or file not found on disk
- `400`: Invalid file path (security check failed)

**Notes:**
- Only serves image files (PNG, JPG, JPEG) for security
- Validates file path to prevent directory traversal attacks
- Used by frontend to display thumbnail previews of uploaded image documents

#### DELETE `/api/kyc/documents/<document_id>`
Delete a document.

**Headers:**
- `X-User-ID: string` (required)

#### POST `/api/kyc/submit`
Submit KYC dossier for review.

**Headers:**
- `X-User-ID: string` (required)

#### GET `/api/kyc/status`
Get current KYC status.

**Headers:**
- `X-User-ID: string` (required)

#### POST `/api/kyc/eu-ets-verify`
Verify EU ETS Registry account.

**Headers:**
- `X-User-ID: string` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "account_number": "string",
  "country": "string"  // ISO country code (e.g., "RO", "DE")
}
```

#### POST `/api/kyc/suitability-assessment`
Submit suitability assessment.

**Headers:**
- `X-User-ID: string` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "objectives": "compliance|hedging|investment",
  "risk_tolerance": "conservative|moderate|aggressive",
  "experience": "beginner|intermediate|advanced",
  "knowledge_score": 0-100
}
```

#### POST `/api/kyc/appropriateness-assessment`
Submit appropriateness assessment.

**Headers:**
- `X-User-ID: string` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "knowledge_test": {
    "correct_answers": 7,
    "total_questions": 10
  },
  "experience_declaration": {
    "has_traded_carbon_certificates": true,
    "has_traded_similar_products": false,
    "has_financial_experience": true
  }
}
```

#### GET `/api/kyc/workflow`
Get current workflow status.

**Headers:**
- `X-User-ID: string` (required)

### Admin Endpoints (`/api/admin/kyc`)

#### GET `/api/admin/kyc/pending`
List pending KYC dossiers.

**Headers:**
- `X-Admin-ID: string` (required)

**Query Parameters:**
- `status`: Filter by status (`pending`, `in_review`, `needs_update`)
- `risk_level`: Filter by risk level (`low`, `medium`, `high`)
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)

#### GET `/api/admin/kyc/<user_id>`
Get detailed KYC information for a user.

**Headers:**
- `X-Admin-ID: string` (required)

#### POST `/api/admin/kyc/<user_id>/approve`
Approve KYC dossier.

**Headers:**
- `X-Admin-ID: string` (required)
- `Content-Type: application/json`

#### POST `/api/admin/kyc/<user_id>/reject`
Reject KYC dossier with reason.

**Headers:**
- `X-Admin-ID: string` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "reason": "string",
  "notes": "string"  // optional
}
```

#### POST `/api/admin/kyc/<user_id>/request-update`
Request document updates from user.

**Headers:**
- `X-Admin-ID: string` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "required_documents": ["company_registration", "financial_statement"],
  "notes": "string"  // optional
}
```

#### POST `/api/admin/kyc/<user_id>/verify-document/<document_id>`
Verify or reject a specific document.

**Headers:**
- `X-Admin-ID: string` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "action": "verify|reject",
  "notes": "string"  // optional
}
```

#### POST `/api/admin/kyc/<user_id>/sanctions-check`
Run sanctions and PEP screening for a user.

**Headers:**
- `X-Admin-ID: string` (required)

#### POST `/api/admin/kyc/<user_id>/set-risk-level`
Set risk level for a user.

**Headers:**
- `X-Admin-ID: string` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "risk_level": "low|medium|high"
}
```

## Database Models

### User
- Extended with KYC fields: status, risk level, documents, assessments, etc.

### KYCDocument
- Stores uploaded documents with verification status.
- **Multiple Documents Per Type**: No unique constraint on `(user_id, document_type)`, allowing multiple documents per category
- **File Type Support**: All document types accept PDF, PNG, JPG, and JPEG formats
- **Company Registration**: Company registration certificates accept all allowed file types (not restricted to PDF only)

### KYCWorkflow
- Tracks workflow progress through onboarding steps.

## Services

### DocumentValidator
- Validates file types, sizes, and document expiry.
- **File Type Support**: All document types accept PDF, PNG, JPG, and JPEG formats
- **Company Registration**: Company registration certificates accept all allowed file types (not restricted to PDF only)
- **Multiple Documents**: No unique constraint prevents multiple documents per document type

### SanctionsChecker
- Mock implementation for sanctions and PEP screening.
- To be replaced with real API integration (World-Check, Dow Jones, etc.).

### EUETSVerifier
- Mock implementation for EU ETS Registry verification.
- To be replaced with real registry API integration.

## Security Features

### Authentication
- **Current Implementation**: Header-based authentication using `X-User-ID` and `X-Admin-ID` headers
- **UUID Validation**: All user/admin IDs are validated for proper UUID format
- **Error Handling**: Standardized error responses with error codes
- **Production Note**: This is a placeholder implementation. Production should implement JWT tokens or session-based authentication.

### File Upload Security
- **Path Traversal Prevention**: All file paths validated using `validate_path_safe()` and absolute path checks
- **UUID Filenames**: Files stored with UUID-based names to prevent predictable access
- **Content Validation**: File extension must match content-type
- **Size Limits**: 16MB maximum file size (configurable)
- **Transaction Safety**: Files saved only after database record creation; cleanup on commit failure

### Error Handling
- **Standardized Format**: All errors use `standard_error_response()` helper
- **Error Codes**: Consistent error codes for client-side handling
- **Logging**: Internal errors logged with full stack traces; user-friendly messages returned

## Testing

### Running Tests

The KYC system includes unit tests for critical endpoints. To run tests:

```bash
# Install test dependencies (if not already installed)
pip install -r requirements.txt

# Run all KYC tests
pytest tests/test_kyc_register.py -v

# Run all tests with coverage
pytest tests/ -v --cov=api --cov=models
```

### Test Coverage

Current test coverage includes:
- **Registration Endpoint** (`/api/kyc/register`):
  - Successful registration with new user (development mode)
  - Successful registration with existing user
  - Input validation (missing fields, invalid UUID format)
  - RiskLevel enum import verification (catches import errors)
  - Workflow creation and updates
  - Error handling and response codes

### Test Structure

Tests are located in `backend/tests/`:
- `test_kyc_register.py` - Tests for registration endpoint
- `README.md` - Test documentation and usage guide

### Writing New Tests

When adding new endpoints or features:
1. Create test file: `test_<feature_name>.py`
2. Use pytest fixtures for app and client setup
3. Test both success and error cases
4. Verify database state changes
5. Test edge cases and boundary conditions

See `backend/tests/README.md` for detailed testing guidelines.
- **Sanitization**: Error messages don't expose internal system details

### Rate Limiting
- **Default Limits**: 200 requests per day, 50 requests per hour
- **Storage**: Memory-based by default; can use Redis for distributed systems
- **Configuration**: Set via `RATELIMIT_STORAGE_URL` environment variable

### CORS Configuration
- **Development**: Allows all origins
- **Production**: Must set `CORS_ORIGINS` environment variable
- **Warning**: System logs warning if CORS allows all origins in production

## Data Serialization

- **Backend**: Python models use snake_case internally
- **API**: All responses converted to camelCase for frontend compatibility
- **Method**: Models use `to_dict(camel_case=True)` method
- **Utility**: `backend/utils/serializers.py` provides conversion utilities

## Environment Variables

### Required in Production
- **SECRET_KEY**: Flask secret key (no default allowed in production)
- **CORS_ORIGINS**: Comma-separated list of allowed origins

### Optional
- **DATABASE_URL**: Database connection string (defaults to SQLite)
- **FLASK_ENV**: Environment (development/production)
- **RATELIMIT_STORAGE_URL**: Rate limiter storage (defaults to memory)
- **SANCTIONS_CHECK_ENABLED**: Enable/disable sanctions checking (default: true)
- **EU_ETS_VERIFICATION_ENABLED**: Enable/disable EU ETS verification (default: true)

## Notes

- Authentication is currently placeholder (using headers). Real authentication should be implemented for production.
- Sanctions checking and EU ETS verification are mock implementations. Integrate with real services (World-Check, Dow Jones, EU ETS Registry APIs) for production.
- File uploads are stored in `backend/uploads/kyc_documents/`.
- Database uses SQLite by default (can be changed to PostgreSQL in production via `DATABASE_URL`).
- All API endpoints use standardized error responses with error codes.
- Rate limiting is enabled by default to prevent API abuse.
- CORS must be configured for production deployments.

