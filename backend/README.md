# EU ETS Price Scraper Backend

Python Flask backend service that scrapes real-time EU ETS (EUA) carbon allowance prices from ICE (Intercontinental Exchange) and provides a REST API for the frontend.

## Features

- Web scraping from ICE (Intercontinental Exchange) for EU ETS prices
- Fallback to OilPriceAPI if ICE scraping fails
- Caching mechanism (2-minute cache) to reduce scraping frequency
- Historical data collection and storage (5+ years of daily prices)
- RESTful API with CORS support
- Health check endpoint

## Setup

### Docker (Recommended)

The application is designed to run in Docker containers. Build and run with docker-compose:

```bash
docker-compose up backend
```

The backend service will be available at `http://localhost:5001` (external port).

### Local Development (Without Docker)

If you need to run the backend locally without Docker:

1. Install dependencies directly (no venv needed):
```bash
pip install -r requirements.txt
```

2. Set environment variables (optional):
```bash
export OILPRICE_API_KEY=your_api_key_here
export ALPHAVANTAGE_API_KEY=your_alphavantage_key_here  # Optional (free tier available)
export PORT=5000
export FLASK_ENV=development
```

3. Run the server:
```bash
python app.py
```

Or with gunicorn:
```bash
gunicorn --bind 0.0.0.0:5000 --workers 2 app:app
```

**Note**: This project uses Docker containers for development and production. Virtual environments (venv) are not required or used.

## API Endpoints

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "EU ETS Price Scraper",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### GET `/api/eua/price`
Get current EU ETS (EUA) price. Returns cached result if available and fresh (within 2 minutes), otherwise scrapes new data.

**Response:**
```json
{
  "price": 75.50,
  "timestamp": "2024-01-01T12:00:00Z",
  "currency": "EUR",
  "change24h": 1.25,
  "source": "ICE (Intercontinental Exchange)"
}
```

**Response Fields:**
- `price`: Current EUA price in EUR
- `timestamp`: ISO 8601 timestamp of when price was fetched
- `currency`: Currency code (always "EUR")
- `change24h`: 24-hour price change percentage (optional)
- `source`: Name of the data source that provided this price (e.g., "ICE (Intercontinental Exchange)", "Alpha Vantage API", "TradingView", "Investing.com", "MarketWatch", "ICE public pages", "OilPriceAPI (fallback)", or "Cached")

### POST `/api/eua/price/refresh`
Force refresh of price data (bypasses cache).

**Response:** Same format as GET `/api/eua/price`, including `source` field

### GET `/api/cea/price`
Get current Chinese CEA (China ETS Allowances) price.

**Response:**
```json
{
  "price": 45.30,
  "timestamp": "2024-01-01T12:00:00Z",
  "currency": "EUR",
  "change24h": -0.75
}
```

### GET `/api/eua/history`
Get historical EUA price data.

**Query Parameters:**
- `start_date` (optional): Start date in YYYY-MM-DD format (defaults to 5 years ago)
- `end_date` (optional): End date in YYYY-MM-DD format (defaults to today)

**Response:**
```json
{
  "data": [
    {
      "date": "2020-01-01T00:00:00+00:00",
      "price": 28.50,
      "currency": "EUR"
    },
    ...
  ],
  "start_date": "2020-01-01T00:00:00+00:00",
  "end_date": "2025-01-01T00:00:00+00:00",
  "count": 1826
}
```

**Note**: All dates in the response are in ISO 8601 format with UTC timezone (`+00:00`). The system handles timezone normalization automatically, so dates are always comparable regardless of their original format.

### GET `/api/cea/history`
Get historical CEA price data.

**Query Parameters:** Same as `/api/eua/history`

**Response:** Same format as `/api/eua/history`

### GET `/api/history/combined`
Get combined historical EUA and CEA price data.

**Query Parameters:** Same as `/api/eua/history`

**Response:**
```json
{
  "data": [
    {
      "date": "2020-01-01T00:00:00+00:00",
      "priceEUA": 28.50,
      "priceCEA": 17.10,
      "currency": "EUR"
    },
    ...
  ],
  "start_date": "2020-01-01T00:00:00+00:00",
  "end_date": "2025-01-01T00:00:00+00:00",
  "count": 1826
}
```

**Note**: All dates in the response are in ISO 8601 format with UTC timezone (`+00:00`).

## Historical Data

The backend includes functionality to collect and store historical price data (5+ years). Historical data is stored in JSON files in the `backend/data/` directory.

### Date Format and Timezone Handling

All historical data APIs handle dates with proper timezone normalization:

- **Input Format**: Dates can be provided in `YYYY-MM-DD` format (e.g., `2024-12-29`)
- **Output Format**: Dates are returned in ISO 8601 format with UTC timezone (e.g., `2024-12-29T00:00:00+00:00`)
- **Timezone Handling**: The system automatically normalizes timezone-aware and timezone-naive dates for consistent comparisons
- **Supported Formats**: The system handles various ISO date formats:
  - `2024-12-29T00:00:00+00:00` (with timezone offset)
  - `2024-12-29T00:00:00Z` (with Z suffix)
  - `2024-12-29T00:00:00` (naive, no timezone)

All date comparisons are performed with proper timezone awareness to prevent errors when comparing dates from different sources.

### Populating Historical Data

To populate historical data, run the population script:

```bash
python backend/scripts/populate_historical_data.py
```

Or with custom date range:

```bash
export START_DATE=2020-01-01
export END_DATE=2025-01-01
python backend/scripts/populate_historical_data.py
```

The script will:
- Generate realistic historical EUA prices based on market trends
- Calculate CEA prices as a discount to EUA prices
- Save data to `backend/data/historical_eua.json` and `backend/data/historical_cea.json`
- All dates are stored in ISO format with UTC timezone

Historical data is automatically loaded when the backend starts and served through the API endpoints.

### Historical Data Collector Implementation

The `HistoricalDataCollector` class provides robust date handling:

- **Timezone Normalization**: Helper methods ensure consistent timezone handling across all date operations
- **Error Handling**: Invalid or missing dates are gracefully skipped with logging
- **Date Filtering**: Efficient filtering by date range with proper timezone-aware comparisons
- **Format Support**: Handles multiple ISO date formats automatically

Key methods:
- `_normalize_date_for_comparison()`: Normalizes date strings to match reference date timezone awareness
- `_filter_data_by_date_range()`: Filters data entries by date range with proper timezone handling

## Database Initialization

### Initializing the Database

To initialize the database and create the default admin user:

```bash
cd backend
python init_db.py
```

This script:
- Creates all database tables (users, kyc_documents, kyc_workflows)
- Creates the default admin user "Victor" with password "VictorVic"
- Generates a consistent UUID for Victor using the same algorithm as the frontend

### UUID Consistency

**Critical**: The admin user UUID must match between frontend and backend. The UUID generation algorithm is implemented identically in:
- `backend/init_db.py` - Database initialization
- `src/context/AuthContext.tsx` - Frontend admin detection
- `src/services/adminService.ts` - Frontend admin API calls

**UUID Mismatch Detection**: If `init_db.py` detects an existing user with a mismatched UUID, it will display a clear warning with instructions to fix the issue. The recommended fix is to reinitialize the database.

**Victor's Expected UUID**: `00000000-0000-4000-8000-98b72b6798b7`

### Development Mode User Auto-Creation

The `/api/kyc/register` endpoint can auto-create users in development mode:
- **Development Mode** (`DEBUG=True`): Users are auto-created if they don't exist
- **Production Mode** (`DEBUG=False`): Returns 404 if user doesn't exist
- **Implementation**: Uses `current_app.config.get('DEBUG', False)` to check mode

## Configuration

- `PORT`: Server port (default: 5000)
- `FLASK_ENV`: Flask environment (development/production)
- `DEBUG`: Flask debug flag (affects user auto-creation behavior)
- `OILPRICE_API_KEY`: Optional API key for OilPriceAPI fallback
- `ALPHAVANTAGE_API_KEY`: Optional API key for Alpha Vantage API (free tier: 500 calls/day)
- `POLYGON_API_KEY`: Optional API key for Polygon.io API (paid service, not currently implemented)
- `EEX_API_KEY`: Optional API key for EEX (European Energy Exchange) API (commercial access required, not currently implemented)
- `CARBONCREDITS_API_KEY`: Optional API key for CarbonCredits.com API (not currently implemented)
- `HISTORICAL_DATA_DIR`: Directory for historical data files (default: `backend/data`)

### API Key Setup

The system supports optional API keys for enhanced price data reliability. If API keys are not provided, the system will automatically fall back to web scraping sources.

#### Alpha Vantage API (Recommended for Free Tier)

**Getting Started:**
1. Sign up for a free account at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Request a free API key (no credit card required)
3. Set the `ALPHAVANTAGE_API_KEY` environment variable

**Free Tier Limitations:**
- 500 API calls per day
- 5 API calls per minute
- The system automatically handles rate limits and falls back to web scraping if limits are reached

**What Happens Without API Key:**
- The Alpha Vantage source is automatically skipped
- System falls back to web scraping sources (ICE, TradingView, Investing.com, etc.)
- No errors or warnings - graceful degradation

**Rate Limiting:**
- The system includes built-in rate limit detection
- When rate limits are detected, the source is skipped and the next source in the chain is tried
- No manual intervention required

#### OilPriceAPI (Fallback)

**Getting Started:**
1. Sign up at [OilPriceAPI](https://oilpriceapi.com)
2. Obtain your API key
3. Set the `OILPRICE_API_KEY` environment variable

**Note:** OilPriceAPI is used as a last-resort fallback if all other sources fail.

## Error Handling

The service includes multiple fallback mechanisms (tried in order):
1. **ICE (Intercontinental Exchange)** - Web scraping from ICE website
2. **Alpha Vantage API** - Market data API (if `ALPHAVANTAGE_API_KEY` provided, free tier: 500 calls/day)
3. **TradingView** - Web scraping fallback
4. **Investing.com** - Web scraping
5. **MarketWatch** - Web scraping
6. **ICE public pages** - Web scraping fallback
7. **OilPriceAPI** - API fallback (if `OILPRICE_API_KEY` provided)
8. **Cached price** - Return last known price if available
9. **Error response** - Return error if all sources fail and no cache available

**Note**: API sources (Alpha Vantage) are optional and will be skipped if API keys are not provided. The system will automatically fall back to web scraping sources. Rate limits are automatically detected and handled gracefully.

### Historical Data Error Handling

The historical data collector includes robust error handling:

- **Invalid Dates**: Entries with invalid or unparseable dates are automatically skipped with warning logs
- **Missing Dates**: Entries without a 'date' field are skipped
- **Timezone Mismatches**: Dates are automatically normalized to match the reference timezone
- **Date Range Validation**: Invalid date ranges (start > end) return 400 error
- **Range Limits**: Date ranges exceeding 10 years return 400 error

If you encounter issues with historical data:

1. **Check Logs**: Look for warnings about skipped entries or date parsing errors
2. **Verify Date Format**: Ensure dates in JSON files are in ISO format
3. **Check Timezone**: All dates should use UTC timezone (`+00:00`) for consistency
4. **Validate Range**: Ensure requested date ranges are valid and within limits

## Rate Limiting

The service implements a 2-minute cache to avoid excessive scraping and respect website rate limits. Use the `/refresh` endpoint if you need immediate updates.

## Access Request API

### POST `/api/access-requests`

Create a new access request from the login page (no authentication required).

**Request Body:**
```json
{
  "entity": "Company Name",
  "contact": "user@example.com",
  "position": "Chief Financial Officer",
  "reference": "REF-12345"
}
```

**Fields:**
- `entity` (required): Company or organization name (max 200 characters)
- `contact` (required): Email address (max 120 characters, must be valid email format)
- `position` (required): User's position in the entity (max 100 characters)
- `reference` (required): Reference number or code (max 100 characters)

**Response (Success - 201):**
```json
{
  "message": "Access request submitted successfully",
  "requestId": "uuid-string"
}
```

**Response (Error - 400):**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Error Codes:**
- `MISSING_BODY` - Request body is required
- `MISSING_ENTITY` - Entity field is required
- `MISSING_CONTACT` - Contact field is required
- `MISSING_POSITION` - Position field is required
- `MISSING_REFERENCE` - Reference field is required
- `INVALID_EMAIL` - Contact must be a valid email address
- `ENTITY_TOO_LONG` - Entity exceeds maximum length
- `CONTACT_TOO_LONG` - Contact exceeds maximum length
- `POSITION_TOO_LONG` - Position exceeds maximum length
- `REFERENCE_TOO_LONG` - Reference exceeds maximum length

**Validation:**
- Email format validation using regex pattern
- String sanitization to prevent XSS attacks
- Length limits enforced on all fields
- Input sanitization via `sanitize_string()` utility

**Database:**
- Access requests stored in `access_requests` table
- Fields: `id` (UUID), `entity`, `contact`, `position`, `reference`, `status`, `created_at`, `reviewed_at`, `reviewed_by`, `notes`
- Status defaults to `pending`
- Timestamp recorded in `created_at` field
- UUID generated for each request
- **Migration Required**: Run `backend/scripts/migrate_access_requests_0022.py` to add `position` column and make `reference` NOT NULL

### Admin Endpoints

#### GET `/api/admin/access-requests`

List all access requests (requires admin authentication).

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `reviewed`, `approved`, `rejected`)
- `limit` (optional): Number of results per page (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `search` (optional): Search by entity name or contact email (case-insensitive)

**Response:**
```json
{
  "requests": [
    {
      "id": "uuid",
      "entity": "Company Name",
      "contact": "user@example.com",
      "position": "Chief Financial Officer",
      "reference": "REF-12345",
      "status": "pending",
      "createdAt": "2024-01-01T12:00:00Z",
      "reviewedAt": null,
      "reviewedBy": null,
      "notes": null
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

**Sorting:** Results are sorted by `created_at` descending (newest first).

#### GET `/api/admin/access-requests/<request_id>`

Get specific access request details (requires admin authentication).

**Response:** Same format as single request object above.

#### POST `/api/admin/access-requests/<request_id>/review`

Update access request status (requires admin authentication).

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Approved after review"
}
```

**Status Values:** `pending`, `reviewed`, `approved`, `rejected`

**Updates:**
- Sets `reviewed_at` to current UTC timestamp
- Sets `reviewed_by` to admin ID from `X-Admin-ID` header
- Updates `status` and `notes` fields

**Response:**
```json
{
  "id": "uuid",
  "entity": "Company Name",
  "contact": "user@example.com",
  "position": "Chief Financial Officer",
  "reference": "REF-12345",
  "status": "approved",
  "createdAt": "2024-01-01T12:00:00Z",
  "reviewedAt": "2024-01-02T10:30:00Z",
  "reviewedBy": "admin-user-id",
  "notes": "Approved after review"
}
```

### User Creation Endpoint

#### POST `/api/admin/users`

Create a new user (requires admin authentication).

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "optional-password",
  "companyName": "Company Name",
  "address": "123 Main St",
  "contactPerson": "John Doe",
  "phone": "+1234567890"
}
```

**Fields:**
- `username` (required): Unique username
- `email` (required): Valid email format, must be unique
- `password` (optional): User password. If not provided, a random UUID is hashed and used (user must reset password on first login)
- `companyName` (optional): Company name
- `address` (optional): Company address
- `contactPerson` (optional): Contact person name
- `phone` (optional): Phone number

**Default Values:**
- `is_admin`: `false`
- `kyc_status`: `PENDING`
- `risk_level`: `LOW`

**Response (Success - 201):**
```json
{
  "id": "uuid",
  "username": "newuser",
  "email": "user@example.com",
  "companyName": "Company Name",
  "address": "123 Main St",
  "contactPerson": "John Doe",
  "phone": "+1234567890",
  "isAdmin": false,
  "kycStatus": "PENDING",
  "riskLevel": "LOW",
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

**Response (Error - 400):**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Error Codes:**
- `MISSING_USERNAME` - Username is required
- `MISSING_EMAIL` - Email is required
- `INVALID_EMAIL` - Email format is invalid
- `EMAIL_EXISTS` - Email already in use
- `USERNAME_EXISTS` - Username already in use
- `CREATE_USER_ERROR` - Internal server error

**Validation:**
- Email format validation using regex pattern
- Email uniqueness check (database query)
- Username uniqueness check (database query)
- Password hashing using `werkzeug.security.generate_password_hash`
- If password not provided, random UUID is generated and hashed to prevent login without password reset

**Audit Logging:**
All user creation actions are logged with admin ID, user ID, username, email, and whether password was provided.

### Admin Price Updates Status Endpoint

#### GET `/api/admin/price-updates/status`

Get comprehensive price update status and configuration for admin monitoring (requires admin authentication).

**Authentication:**
- Requires `X-Admin-ID` header with valid admin UUID

**Response:**
```json
{
  "eua": {
    "pollingInterval": 300000,
    "cacheDuration": 120,
    "endpoint": "/api/eua/price",
    "libraries": {
      "backend": ["requests", "beautifulsoup4", "json", "re"],
      "frontend": ["axios"]
    },
    "dataSources": [
      "ICE (Intercontinental Exchange)",
      "Alpha Vantage API",
      "TradingView",
      "Investing.com",
      "MarketWatch",
      "ICE public pages",
      "OilPriceAPI (fallback)"
    ],
    "lastUpdate": "2024-01-01T12:00:00Z",
    "lastSource": "ICE (Intercontinental Exchange)",
    "lastPrice": 79.50,
    "sourcePrices": [
      {
        "source": "ICE (Intercontinental Exchange)",
        "lastPrice": 79.50,
        "lastUpdate": "2024-01-01T12:00:00Z"
      },
      {
        "source": "Alpha Vantage API",
        "lastPrice": null,
        "lastUpdate": null
      },
      ...
    ],
    "status": "success"
  },
  "cea": {
    "pollingInterval": 300000,
    "cacheDuration": 120,
    "endpoint": "/api/cea/price",
    "libraries": {
      "backend": ["requests", "beautifulsoup4", "json", "re"],
      "frontend": ["axios"]
    },
    "method": "Generated based on EUA price (30-50% discount)",
    "lastUpdate": "2024-01-01T12:00:00Z",
    "status": "success"
  },
  "historical": {
    "libraries": ["requests", "BeautifulSoup", "json"],
    "method": "Realistic generation based on market trends",
    "dataFiles": [
      "backend/data/historical_eua.json",
      "backend/data/historical_cea.json"
    ]
  }
}
```

**EUA Section Fields:**
- `lastSource`: Name of the data source that provided the last price (e.g., "ICE (Intercontinental Exchange)", "Cached")
- `lastPrice`: Last price obtained from the current cached response
- `sourcePrices`: Array of objects showing last price and timestamp for each data source
  - `source`: Source name
  - `lastPrice`: Last price from this source (null if never used)
  - `lastUpdate`: ISO timestamp of last update from this source (null if never used)

**Source Tracking:**
The system tracks which source provided each price update, enabling administrators to monitor source reliability. Sources are tracked in memory via `source_price_history` dictionary, which persists across requests within the same server instance.

