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

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables (optional):
```bash
export OILPRICE_API_KEY=your_api_key_here
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

### Docker

Build and run with docker-compose:
```bash
docker-compose up backend
```

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
  "change24h": 1.25
}
```

### POST `/api/eua/price/refresh`
Force refresh of price data (bypasses cache).

**Response:** Same as GET `/api/eua/price`

### GET `/api/cer/price`
Get current Chinese CER (Certified Emission Reduction) price.

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
      "date": "2020-01-01T00:00:00Z",
      "price": 28.50,
      "currency": "EUR"
    },
    ...
  ],
  "start_date": "2020-01-01T00:00:00Z",
  "end_date": "2025-01-01T00:00:00Z",
  "count": 1826
}
```

### GET `/api/cer/history`
Get historical CER price data.

**Query Parameters:** Same as `/api/eua/history`

**Response:** Same format as `/api/eua/history`

### GET `/api/history/combined`
Get combined historical EUA and CER price data.

**Query Parameters:** Same as `/api/eua/history`

**Response:**
```json
{
  "data": [
    {
      "date": "2020-01-01T00:00:00Z",
      "priceEUA": 28.50,
      "priceCER": 17.10,
      "currency": "EUR"
    },
    ...
  ],
  "start_date": "2020-01-01T00:00:00Z",
  "end_date": "2025-01-01T00:00:00Z",
  "count": 1826
}
```

## Historical Data

The backend includes functionality to collect and store historical price data (5+ years). Historical data is stored in JSON files in the `backend/data/` directory.

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
- Calculate CER prices as a discount to EUA prices
- Save data to `backend/data/historical_eua.json` and `backend/data/historical_cer.json`

Historical data is automatically loaded when the backend starts and served through the API endpoints.

## Configuration

- `PORT`: Server port (default: 5000)
- `FLASK_ENV`: Flask environment (development/production)
- `OILPRICE_API_KEY`: Optional API key for OilPriceAPI fallback
- `HISTORICAL_DATA_DIR`: Directory for historical data files (default: `backend/data`)

## Error Handling

The service includes multiple fallback mechanisms:
1. Primary: Scrape from ICE website
2. Fallback 1: Use OilPriceAPI (if API key provided)
3. Fallback 2: Return cached price if available
4. Fallback 3: Return error response

## Rate Limiting

The service implements a 2-minute cache to avoid excessive scraping and respect website rate limits. Use the `/refresh` endpoint if you need immediate updates.

