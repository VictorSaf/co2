# KYC & Client Onboarding Feature Documentation

## Overview

The KYC (Know Your Customer) and Client Onboarding system provides a comprehensive multi-step process for onboarding new clients to the Nihao Carbon Certificates trading platform. The system ensures compliance with EU ETS regulations, MiFID II requirements, and AML/KYC standards.

## Feature Components

### User-Facing Components

1. **Onboarding Page** (`src/pages/Onboarding.tsx`)
   - Multi-step onboarding workflow
   - Initial company information form
   - Document upload interface
   - EU ETS Registry verification
   - Suitability and Appropriateness assessments
   - Final review and submission

2. **Onboarding Stepper** (`src/components/onboarding/OnboardingStepper.tsx`)
   - Visual progress indicator
   - Step navigation
   - Accessibility support (ARIA labels, keyboard navigation)

3. **Document Upload** (`src/components/onboarding/DocumentUpload.tsx`)
   - Drag-and-drop file upload
   - Real-time validation
   - Upload progress tracking
   - Multiple documents per category support
   - Display all uploaded documents per category
   - Individual document deletion with loading states
   - Verification status display for each document
   - Upload area remains visible after documents are uploaded

4. **EU ETS Registry Form** (`src/components/onboarding/EUETSRegistryForm.tsx`)
   - Account verification form
   - Country selection
   - Verification status display

5. **Suitability Assessment** (`src/components/onboarding/SuitabilityAssessment.tsx`)
   - Investment objectives questionnaire
   - Risk tolerance assessment
   - Experience evaluation
   - Knowledge test

6. **Appropriateness Assessment** (`src/components/onboarding/AppropriatenessAssessment.tsx`)
   - Knowledge test for CO2 certificates
   - Experience declaration
   - Trading authorization evaluation

### Backend Components

1. **API Endpoints** (`backend/api/kyc.py`, `backend/api/admin_kyc.py`)
   - User endpoints for onboarding workflow
   - Admin endpoints for compliance review

2. **Data Models** (`backend/models/`)
   - `User` - Extended with KYC fields
   - `KYCDocument` - Document storage and verification
   - `KYCWorkflow` - Workflow progress tracking

3. **Services** (`backend/services/`)
   - `DocumentValidator` - File validation and verification
   - `SanctionsChecker` - Sanctions and PEP screening (mock)
   - `EUETSVerifier` - EU ETS Registry verification (mock)
   - `SuitabilityAssessor` - Suitability evaluation
   - `AppropriatenessAssessor` - Appropriateness evaluation

## Onboarding Workflow

### Navigation and Document Upload Behavior

**Free Navigation**:
- Users can navigate freely between all onboarding steps without being blocked by document upload requirements
- Continue buttons are always visible on all steps, allowing progression regardless of completion status
- The onboarding stepper allows direct navigation to any step by clicking on it (no sequential restriction)
- Document uploads can be performed at any point in the onboarding process
- **Implementation**: `src/pages/Onboarding.tsx` - Continue buttons always rendered (lines 701-706, 719-724, 740-745, 761-765), stepper uses `onStepClick` prop for navigation (`src/components/onboarding/OnboardingStepper.tsx` lines 48-49, 63-64, 80-81)

**Document Upload on All Steps**:
- Each onboarding step includes a collapsible "Upload Documents" section (`DocumentUploadSection` component)
- Each step maintains its own independent expand/collapse state using `Map<WorkflowStep, boolean>`
  - **State Management**: `src/pages/Onboarding.tsx` line 71 - `useState<Map<WorkflowStep, boolean>>(new Map())`
  - **Toggle Function**: `toggleExpand()` function (lines 389-391) updates state for current step only, preserving other steps' states
- The section header displays current document count (e.g., "Upload Documents (3/5 uploaded)")
- When expanded, shows all document upload components and a warning listing missing documents (non-blocking)
- Users can upload documents from any step without navigating back to the document collection step
- **Component Location**: `DocumentUploadSection` component defined at lines 377-492, rendered on all steps:
  - `eu_ets_verification` step (line 718)
  - `suitability_assessment` step (line 739)
  - `appropriateness_assessment` step (line 758)
  - `final_review` step (line 820)

**Final Submission Validation**:
- Final submission is the only place where document validation blocks the user
- Submission requires all required documents to be uploaded
- Submission requires EU ETS Registry verification to be completed
- Clear error messages display which documents are missing or what verification is pending
- Users can upload missing documents directly from the final review step before submitting
- **Implementation**: `src/pages/Onboarding.tsx` lines 793-808 - Submit button disabled with `disabled={!hasAllRequiredDocuments() || !kycData.eu_ets_registry_verified}` condition

### Step 1: Initial Registration
- User provides company information:
  - Company name
  - Address
  - Contact person
  - Phone number
- System creates KYC workflow with status `pending`

### Step 2: Document Collection
User uploads required documents:
- **Company Registration Certificate** (max 90 days old, accepts PDF, PNG, JPG, JPEG)
- **Financial Statement** (latest balance sheet)
- **Tax Certificate** (tax registration certificate)
- **EU ETS Registry Proof** (proof of registry account)
- **Power of Attorney** (authorization for legal representative)

**Note**: While this is the dedicated document collection step, users can also upload documents from any other step using the collapsible document upload section available on all steps.

**Document Upload Features**:
- **Multiple Uploads**: Users can upload multiple documents per document category
- **Bulk Upload**: Frontend supports selecting and uploading multiple files at once (files are validated and uploaded sequentially)
- **All Documents Displayed**: UI shows all uploaded documents for each category, not just the most recent one
- **Document Sorting**: Documents are automatically sorted by upload date (newest first) for better user experience
- **Individual Management**: Each document can be viewed, verified, and deleted independently
- **Upload Area Always Visible**: Upload area remains visible even after documents are uploaded, allowing additional uploads
- **Image Previews**: Image documents (PNG, JPG, JPEG) display thumbnail previews in the document list
- **Drag & Drop**: Supports drag and drop of single or multiple files

**Document Validation**:
- File type validation (PDF, PNG, JPG, JPEG)
- File size validation (max 16MB)
- Content-type matching
- Document expiry checking (for company registration)
- **No PDF Restriction**: Company registration certificates accept all allowed file types, not restricted to PDF only

### Step 3: EU ETS Registry Verification
- User provides EU ETS Registry account number and country
- System verifies account (currently mock implementation)
- Status updated upon successful verification
- **Note**: Users can continue to next steps even if verification is not complete, but final submission requires verification

### Step 4: Suitability Assessment
User completes suitability questionnaire:
- **Investment Objectives**: Compliance, Hedging, or Investment
- **Risk Tolerance**: Conservative, Moderate, or Aggressive
- **Experience Level**: Beginner, Intermediate, or Advanced
- **Knowledge Score**: Test score (0-100)

**Scoring Algorithm**:
- Objectives: 0-30 points
- Risk Tolerance: 0-25 points
- Experience: 0-25 points
- Knowledge: 0-20 points
- **Total**: 0-100 points

**Result Levels**:
- ≥70 points: Suitable
- 50-69 points: Suitable with warnings
- <50 points: Not suitable

### Step 5: Appropriateness Assessment
User completes appropriateness evaluation:
- **Knowledge Test**: 10 questions about CO2 certificates, risks, market, regulations
- **Experience Declaration**: Previous trading experience

**Evaluation Criteria**:
- Knowledge score ≥70% AND experience: Full access approved
- Knowledge score ≥70% BUT no experience: Limited access (requires education)
- Knowledge score 50-69%: Needs education before trading
- Knowledge score <50%: Rejected

### Step 6: Review and Submission
- User reviews all submitted information
- Document upload section available for uploading any missing documents
- System validates all required documents are uploaded (blocks submission if missing)
- System validates EU ETS Registry is verified (blocks submission if not verified)
- Clear error messages display what's missing or pending
- User submits dossier for compliance review
- Status changes to `in_review`

### Step 7: Compliance Review (Admin)
Compliance team reviews dossier:
- Document completeness and validity
- Sanctions screening results
- PEP status
- EU ETS Registry verification
- Suitability/Appropriateness assessments

**Admin Actions**:
- **Approve**: Status → `approved`, account activated
- **Reject**: Status → `rejected`, reason provided to user
- **Request Update**: Status → `needs_update`, specific documents requested

## API Documentation

### Authentication

All endpoints require authentication via `X-User-ID` header (development) or JWT token (production).

**Current Implementation** (Development):
```http
X-User-ID: <uuid>
```

**Admin Endpoints** require `X-Admin-ID` header:
```http
X-Admin-ID: <uuid>
```

### Error Response Format

All errors follow standardized format:
```json
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE"
}
```

**Error Handling Improvements**:
- **404 Errors**: When user hasn't started onboarding, `/api/kyc/status` returns 404 (not 500 or other error codes)
- **Frontend Handling**: 404 errors are handled gracefully as "not started" state, not displayed as errors to users
- **Error Differentiation**: Clear distinction between "user hasn't started onboarding" (404) and actual errors (401, 403, 500, network errors)
- **User-Friendly Messages**: Different error types show appropriate messages:
  - Authentication errors: "Authentication required. Please sign in again."
  - Server errors: "Server error. Please try again later."
  - Network errors: Generic error message with retry suggestion

### User Endpoints

#### POST `/api/kyc/register`
Start onboarding process.

**Request Body**:
```json
{
  "user_id": "uuid",
  "company_name": "Company Name",
  "address": "Full Address",
  "contact_person": "Contact Name",
  "phone": "+1234567890"
}
```

**Response**:
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

#### POST `/api/kyc/documents/upload`
Upload a KYC document.

**Headers**:
- `X-User-ID: <uuid>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `file`: File (PDF, PNG, JPG, JPEG, max 16MB)
- `document_type`: One of: `company_registration`, `financial_statement`, `tax_certificate`, `eu_ets_proof`, `power_of_attorney`, `id_document`, `address_proof`, `beneficial_ownership`

**Notes**:
- Multiple documents can be uploaded per document type
- All document types accept PDF, PNG, JPG, and JPEG formats
- Company registration certificates accept all allowed file types (not restricted to PDF only)

**Response**:
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
List all documents for authenticated user.

**Response**:
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

**Notes**:
- Returns all documents for the user, including multiple documents per document type
- Each document has its own verification status
- Documents can be filtered by `document_type` on the frontend

#### GET `/api/kyc/documents/<document_id>/preview`
Preview an image document (for displaying thumbnails in UI).

**Headers**:
- `X-User-ID: <uuid>`

**Response**:
- Image file stream (PNG, JPG, JPEG only)
- Content-Type: `image/png`, `image/jpeg`, or `image/jpg`

**Errors**:
- `400`: Document is not an image file (preview only available for image files)
- `404`: Document not found or file not found on disk
- `400`: Invalid file path (security check failed)

**Notes**:
- Only serves image files (PNG, JPG, JPEG) for security
- Validates file path to prevent directory traversal attacks
- Used by frontend to display thumbnail previews of uploaded image documents
- PDF files are not served through this endpoint (use direct file access if needed)

#### POST `/api/kyc/submit`
Submit KYC dossier for review.

**Response**:
```json
{
  "message": "KYC dossier submitted for review",
  "status": "in_review"
}
```

**Errors**:
- `MISSING_DOCUMENTS`: Not all required documents uploaded

#### GET `/api/kyc/status`
Get current KYC status.

**Response** (when KYC exists):
```json
{
  "user": {
    "id": "uuid",
    "kycStatus": "in_review",
    "riskLevel": "low",
    "euEtsRegistryVerified": true,
    ...
  },
  "workflow": {
    "currentStep": "final_review",
    "status": "in_progress",
    ...
  }
}
```

**Error Response** (when user hasn't started onboarding):
- **Status Code**: 404
- **Response**: Standard error format with code `USER_NOT_FOUND` or `KYC_NOT_FOUND`

**Note**: Frontend should handle 404 gracefully as "not started" state, not as an error. This allows users to see the onboarding form and start the process.

### Admin Endpoints

#### GET `/api/admin/kyc/pending`
List pending KYC dossiers.

**Query Parameters**:
- `status`: Filter by status (`pending`, `in_review`, `needs_update`)
- `risk_level`: Filter by risk level (`low`, `medium`, `high`)
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20)

**Response**:
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### POST `/api/admin/kyc/<user_id>/approve`
Approve KYC dossier.

**Response**:
```json
{
  "message": "KYC dossier approved",
  "user": {...}
}
```

#### POST `/api/admin/kyc/<user_id>/reject`
Reject KYC dossier.

**Request Body**:
```json
{
  "reason": "Rejection reason",
  "notes": "Additional notes"
}
```

## Security Features

### File Upload Security
- Path traversal prevention via `validate_path_safe()` and absolute path checks
- UUID-based filenames prevent predictable file access
- Content-type validation matches file extension
- File size limits enforced server-side (16MB max)
- Transaction safety: files saved only after DB record creation

### Authentication
- UUID format validation for all user/admin IDs
- Standardized error responses
- Rate limiting enabled (200/day, 50/hour default)

### Error Handling
- Internal errors logged with full stack traces
- User-friendly error messages returned
- No internal system details exposed

### CORS Configuration
- Development: allows all origins
- Production: must configure `CORS_ORIGINS` environment variable

## Configuration

### Environment Variables

**Required in Production**:
- `SECRET_KEY`: Flask secret key (no default allowed)
- `CORS_ORIGINS`: Comma-separated allowed origins

**Optional**:
- `DATABASE_URL`: Database connection string
- `FLASK_ENV`: Environment (development/production)
- `RATELIMIT_STORAGE_URL`: Rate limiter storage (defaults to memory)
- `SANCTIONS_CHECK_ENABLED`: Enable sanctions checking (default: true)
- `EU_ETS_VERIFICATION_ENABLED`: Enable EU ETS verification (default: true)

### Design Tokens

File upload and API configuration centralized in `src/design-system/tokens.ts`:
- `FILE_UPLOAD_CONFIG`: Max file size, allowed types
- `API_CONFIG`: Retry logic, timeout settings
- `UI_CONFIG`: UI constants

## Accessibility

### ARIA Support
- `aria-label` on drag-and-drop zones
- `aria-current="step"` on stepper component
- `aria-live="polite"` for status updates
- `aria-describedby` linking errors to inputs
- `aria-invalid` on form inputs with errors

### Keyboard Navigation
- All interactive elements keyboard accessible
- Focus management between steps
- Proper tab order

## Testing

### Backend Testing
- Unit tests for models and services (to be implemented)
- Integration tests for API endpoints (to be implemented)
- File upload security tests (to be implemented)

### Frontend Testing
- Component rendering tests (to be implemented)
- Form validation tests (to be implemented)
- API integration tests (to be implemented)

## Future Enhancements

### Phase 3: Admin Dashboard UI
- Frontend admin dashboard for compliance review
- Document viewer
- Bulk actions

### Phase 4: Real Integrations
- Real sanctions checking API (World-Check, Dow Jones)
- Real EU ETS Registry API integration
- Email notifications
- Background job processing

## Troubleshooting

### File Upload Fails
- Check file size (max 16MB)
- Verify file type (PDF, PNG, JPG, JPEG)
- Check upload directory permissions
- Review server logs for detailed errors
- Note: Company registration certificates accept all allowed file types (PDF, PNG, JPG, JPEG), not restricted to PDF only

### Authentication Errors
- Verify `X-User-ID` header is present
- Check UUID format is valid
- Ensure user exists in database

### Document Validation Fails
- Verify file extension matches content-type
- Check company registration certificate is not older than 90 days
- Ensure files are in valid format (PDF, PNG, JPG, JPEG)
- Note: Company registration certificates accept all allowed file types, not restricted to PDF only

### API Rate Limiting
- Default limits: 200 requests/day, 50 requests/hour
- Configure `RATELIMIT_STORAGE_URL` for distributed systems
- Review rate limit headers in responses

## Technical Implementation Details

### Document Upload on All Steps Feature

**Component Structure**:
- **Main Component**: `DocumentUploadSection` - Collapsible section component defined in `src/pages/Onboarding.tsx` (lines 377-492)
- **State Management**: Per-step expand/collapse state using `Map<WorkflowStep, boolean>` (line 71)
- **State Update**: `toggleExpand()` function creates new Map instance with updated state for current step only (lines 389-391)

**Document Reloading**:
- **Optimized Loading**: Documents reload only when `kycData` changes, not on step navigation (lines 108-120)
- **Callback-Based Updates**: Documents reload via callbacks:
  - `handleDocumentUpload`: Reloads after 5 seconds delay (line 250)
  - `handleDocumentDelete`: Reloads after 1 second delay (line 280)

**Navigation Implementation**:
- **Stepper Component**: `src/components/onboarding/OnboardingStepper.tsx` - All steps clickable via `onStepClick` prop
- **Continue Buttons**: Always visible on all steps, no conditional rendering based on document status
- **EU ETS Step**: Continue button always visible (line 719), removed conditional wrapper that blocked navigation

**Final Validation**:
- **Submit Button**: Disabled condition includes `!hasAllRequiredDocuments()` check (line 793)
- **Error Display**: Missing documents list shown with specific document types (lines 797-808)
- **EU ETS Check**: Also validates `!kycData.eu_ets_registry_verified` (line 793)

## Related Documentation

- `backend/README_KYC.md` - Backend API documentation
- `docs/features/0008_PLAN.md` - Implementation plan
- `docs/features/0008_REVIEW.md` - Code review notes
- `docs/features/0021_PLAN.md` - Document upload on all steps plan
- `docs/features/0021_REVIEW.md` - Document upload on all steps review
- `app-truth.md` - Application configuration and requirements

