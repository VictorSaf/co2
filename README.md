# Nihao Carbon Certificates

A professional simulation of a CO2 emissions certificate trading platform. This application allows users to buy, convert, verify, and surrender carbon certificates.

## Features

- **Professional Trading Interface**: Modern UI for carbon certificate trading
- **Client Onboarding & KYC**: Complete multi-step onboarding process with KYC/AML compliance, document management, and suitability/appropriateness assessments (MiFID II)
- **Dark Mode Support**: Complete dark mode implementation with system preference detection and persistent user preference
- **CER to EUA Conversion**: Convert Chinese (CER) certificates to European (EUA) certificates
- **Certificate Verification**: Verify EUA certificates with external registries
- **Emissions Management**: Surrender certificates to offset CO2 emissions
- **Real-time Market Data**: Live EU ETS (EUA) prices from free sources, updated every 5 minutes (with optional API key for enhanced data)
- **Portfolio Management**: Track your certificates and their status
- **Interactive Dashboard**: Visualize your portfolio, market trends, and emissions compliance with price history charts (defaults to last 3 months)
- **Profile Page**: View your user information, KYC/onboarding status, document uploads, and assessment completion status
- **Enhanced Market Offers**: More market offers (18 CER, 15 EUA) with smaller price variations and varied volume distribution
- **Documentation Section**: Access all company policies, procedures, and compliance documents with search and filtering capabilities
- **Admin Settings**: Comprehensive admin panel for platform management (User Management, Configuration, Price Update Monitoring, Access Requests Management) - accessible only to admin users
  - **User Management**: View, search, filter, edit, delete, and create platform users
  - **Access Requests Management**: Review and manage access requests from the login page with real-time notifications

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Charts**: Chart.js
- **UI Components**: Headless UI & Heroicons
- **Reusable Components**: Tooltip component for accessible information tooltips
- **State Management**: React Context API
- **Backend**: Python Flask
- **PDF Processing**: PyMuPDF for document updates

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Install dependencies
```bash
npm install
```

2. (Optional) Set up API key for enhanced price data
   - Copy `.env.example` to `.env`
   - Get a free API key from [OilPriceAPI](https://oilpriceapi.com) for real-time prices
   - Add your API key to `.env`:
   ```
   VITE_OILPRICE_API_KEY=your_api_key_here
   ```
   - Note: The app works without the API key and uses free price sources with realistic market simulation

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Login Credentials

Use the following credentials to log in:
- Username: `Victor`
- Password: `VictorVic`

## Login Page

The login page features an elegant, immersive design with animated canvas backgrounds:

- **Animated Backgrounds**: Two canvas layers displaying CO2 molecules, trading charts, and ecological animations
- **Action Buttons**: Two primary actions available:
  - **Enter**: Opens login modal for existing user authentication (username/password)
  - **Request Access**: Opens registration modal for new user access requests with enhanced form features
- **Modal Forms**: Both actions open elegant modal forms with smooth transitions
- **Access Request System**: Enhanced access request form with:
  - **Required Fields**: Entity (corporate name), Contact (corporate email), Position (your position in the entity), Reference (who introduces you)
  - **Info Icons**: Helpful tooltips on Entity, Contact, and Reference fields providing guidance (using reusable Tooltip component)
  - **Confirmation Flow**: Two-step submission process - users review entered data before final submission
  - **Validation**: Frontend and backend validation for all fields including email format
  - **Success Feedback**: Clear success message after submission
- **Access Request Storage**: All access requests stored in database for admin review
- **Dark Theme**: Full-screen immersive dark theme design
- **Brand Watermark**: "Nihao Group" watermark with gradient effects
- **Responsive Design**: Optimized for mobile (480px breakpoint) and desktop viewing
- **Accessibility**: Keyboard navigation (Escape to close modals), ARIA labels, and screen reader support
- **Animation Performance**: Uses `requestAnimationFrame` for smooth 60fps animations with proper cleanup

## Usage Guide

### Dashboard
The dashboard provides an overview of your portfolio, market prices, and emissions compliance status. You can view your certificate holdings, current market prices, trading volumes, and emissions data. The price history chart displays the last 3 months of data by default for better trend visualization.

### Market
In the market section, you can browse available certificates for purchase. There are two types of certificates:
- **CER (Chinese)**: Typically cheaper but need conversion before use (18 offers available with varied volumes)
- **EUA (European)**: Ready for verification and surrender (15 offers available with varied volumes)

Market offers are automatically synchronized with live prices, ensuring the best price always matches current market rates. Offers include a variety of volumes (small, medium, and large) to accommodate different trading needs.

### Portfolio
The portfolio section displays all your certificates and their current status:
- **Available**: Certificates ready for use or conversion
- **Converting**: CER certificates being converted to EUA (takes 5 minutes)
- **Verified**: EUA certificates that have been verified and are ready for surrender

Actions you can take:
- Convert CER to EUA (costs €2 per certificate)
- Verify EUA certificates with external registries

### Emissions
The emissions section shows your CO2 emissions compliance status. Here you can:
- View your total emissions, surrendered amount, and remaining obligations
- Surrender verified EUA certificates to offset your emissions
- Track your compliance progress

### About
The About page provides comprehensive information about Italy Nihao Group Limited, including:
- **Company Overview**: Mission, expertise, and unique value proposition
- **Company History**: Timeline from 2006 group foundation to 2015 company founding
- **Leadership Team**: CEO Christian Meier and executive team
- **Contact Information**: Company address and phone number in Hong Kong
- **Digital Transformation**: Information about the platform and services

### Profile
The Profile page displays your account information and onboarding status:
- **User Information**: Username, email, company name, address, contact person, and phone number
- **KYC Status**: Visual status indicators showing your current onboarding/KYC status (pending, in progress, approved, rejected)
- **Workflow Progress**: Progress bar showing your current step in the onboarding process
- **Document Status**: List of all uploaded documents with their verification status
- **Assessment Status**: EU ETS Registry verification, Suitability assessment, and Appropriateness assessment completion status
- **Quick Actions**: Links to continue onboarding or view documents

The Profile page is accessible to all authenticated users, even if onboarding hasn't started yet, allowing you to track your progress and see what's needed to complete the process.

### Client Onboarding & KYC
The onboarding process guides new clients through a comprehensive KYC (Know Your Customer) workflow:
- **Multi-Step Process**: Step-by-step onboarding with visual progress indicator
- **Free Navigation**: Users can navigate freely between all onboarding steps without being blocked by document upload requirements - continue buttons are always visible, and the stepper allows direct navigation to any step
- **Document Upload on All Steps**: Document upload functionality is available on every onboarding step via a collapsible section, allowing users to upload documents at any point in the process
  - Each step maintains its own independent expand/collapse state
  - Document count displayed in section header (e.g., "Upload Documents (3/5 uploaded)")
  - Missing documents warning shown when expanded (non-blocking)
- **Document Upload Features**: Secure document upload with drag-and-drop support, real-time validation, and progress tracking
  - Filename and file size displayed during upload progress
  - Enhanced success confirmation with dismissible messages (auto-dismisses after 5 seconds)
  - Support for multiple simultaneous uploads with queue display
- **Required Documents**: Company registration certificate, financial statements, tax certificate, EU ETS Registry proof, and power of attorney
- **Multiple Uploads**: Users can upload multiple documents per document category, with all uploaded documents displayed in the UI
- **Bulk Upload**: Select and upload multiple files at once (files are validated and uploaded sequentially)
- **Document Sorting**: Documents are automatically sorted by upload date (newest first) for better user experience
- **Image Previews**: Image documents (PNG, JPG, JPEG) display thumbnail previews in the document list
- **File Type Support**: All document types accept PDF, PNG, JPG, and JPEG formats (company registration certificates are no longer restricted to PDF only)
- **Document Management**: View all uploaded documents per category, delete individual documents, and see verification status for each document
- **EU ETS Registry Verification**: Verify client's EU ETS Registry account
- **Suitability Assessment**: MiFID II suitability evaluation based on investment objectives, risk tolerance, and experience
- **Appropriateness Assessment**: Knowledge test and experience declaration for trading authorization
- **Final Submission Validation**: Final submission is the only place where document validation blocks the user - clear error messages show which documents are missing
- **Status Tracking**: Real-time status updates throughout the review process
- **Error Handling**: Improved error handling distinguishes between "not started" (404) and actual errors, providing clear user feedback
- **Admin Review**: Compliance team dashboard for reviewing and approving client dossiers
- **Accessibility**: Full ARIA support, keyboard navigation, and screen reader compatibility

### Documentation
The Documentation section provides access to all company policies, procedures, and compliance documents:
- **19 PDF Documents**: Including client agreements, policies, procedures, forms, and compliance documents
- **Search Functionality**: Search documents by title or description
- **Category Filtering**: Filter by Policy, Procedure, Form, or Compliance categories
- **View & Download**: View PDFs in a new browser tab or download them directly
- **Responsive Design**: Optimized for mobile, tablet, and desktop viewing
- **Dark Mode Support**: Full dark mode compatibility for all document cards and UI elements

### Admin Settings
The Admin Settings page (accessible only to admin users) provides comprehensive platform management:
- **User Management**: View, search, filter, edit, delete, and create platform users
  - Search by username or email
  - Filter by KYC status and risk level
  - View detailed user information
  - Edit user details (email, company name, etc.)
  - Delete users with confirmation
  - Create new users with optional password (if password not provided, user must reset password on first login)
- **Access Requests Management**: Review and manage access requests submitted from the login page
  - View all access requests with pagination (50 per page)
  - Filter by status (Pending, Reviewed, Approved, Rejected)
  - Search by entity name or contact email
  - Real-time polling for new requests (checks every 10 seconds)
  - Badge showing count of new pending requests
  - View detailed request information
  - Update request status and add admin notes
  - Success notifications for status updates
- **Configuration**: Manage platform settings
  - View platform name and contact email
  - Configure cache duration (60-600 seconds)
  - View rate limiting settings
- **Price Update Monitoring**: Monitor price update systems
  - View EUA price update configuration (polling interval, cache duration, data sources, libraries)
  - View last source that provided the price (instead of "Unknown")
  - View last price obtained from each data source in a detailed table
  - Visual highlighting of the current active source
  - View CER price update configuration
  - View historical data collector information
  - Manual price refresh functionality
  - Auto-refresh status every 30 seconds

### Dark Mode
The application supports a complete dark mode theme that can be toggled from the header:
- **Toggle Location**: Click the sun/moon icon in the header (desktop or mobile)
- **Persistence**: Your preference is saved and will persist across sessions
- **System Preference**: On first visit, the app detects your system's color scheme preference
- **Chart Support**: All charts automatically adapt to the selected theme
- **Accessibility**: Dark mode maintains WCAG AA contrast standards for readability

## Production Deployment

The application can be deployed using Docker Compose with an nginx reverse proxy:

- **Frontend**: Production build served by nginx on port 8080
- **Backend**: Flask API service on port 5001 (direct access) or through nginx proxy at `/api`
- **Nginx Proxy**: All `/api/*` requests are proxied to the backend service, eliminating CORS issues by making requests appear same-origin
- **Configuration**: Frontend uses `VITE_BACKEND_API_URL=/api` in production to use relative URLs through the proxy

**Deployment**:
```bash
docker-compose up -d
```

The frontend will be available at `http://localhost:8080`, with API requests automatically routed through the nginx proxy to the backend service. See `app-truth.md` for detailed configuration information.

## Backend Tools

### PDF Document Update Scripts

The backend includes tools for updating PDF documentation files with company-specific information:

- **Location**: `backend/scripts/`
- **Main Script**: `update_pdf_documents.py` - Analyzes and updates PDF documents
- **Report Generator**: `generate_update_report.py` - Generates detailed update reports
- **Configuration**: `pdf_update_config.json` - Single source of truth for company data

**Usage**:
```bash
# Analyze PDFs without making changes
python backend/scripts/update_pdf_documents.py --analyze-only

# Generate detailed update report
python backend/scripts/generate_update_report.py

# Update PDFs with backup
python backend/scripts/update_pdf_documents.py --backup
```

For detailed documentation, see `backend/scripts/README_PDF_UPDATE.md`.