"""
Flask REST API for EU ETS Price Data
Provides endpoint to fetch real-time EU ETS prices scraped from ICE
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timezone, timedelta
import logging
import os
import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from scraper import ICEScraper, AlternativePriceSource
from historical_data_collector import HistoricalDataCollector
from config import config
from database import db
from models.price_history import PriceHistory
from utils.helpers import require_admin

# Try to import flask_limiter, but don't fail if not installed
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    LIMITER_AVAILABLE = True
except ImportError:
    LIMITER_AVAILABLE = False
    logging.warning("Flask-Limiter not installed. Rate limiting disabled.")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load configuration
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config.get(env, config['default']))

# Initialize extensions
# CORS configuration - restrict in production
cors_origins_env = os.getenv('CORS_ORIGINS', '*')
if env == 'production' and cors_origins_env == '*':
    logger.warning('CORS is set to allow all origins in production. Set CORS_ORIGINS environment variable.')
if cors_origins_env == '*':
    CORS(app)  # Allow all origins
else:
    CORS(app, origins=cors_origins_env.split(','))  # Restrict to specific origins

# Rate limiting (optional)
# In development, use more lenient limits to avoid blocking during testing
if LIMITER_AVAILABLE:
    if env == 'development':
        # Development: More lenient limits (1000/hour, 5000/day)
        default_limits = ["5000 per day", "1000 per hour"]
    else:
        # Production: Standard limits
        default_limits = ["200 per day", "50 per hour"]
    
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=default_limits,
        storage_uri=os.getenv('RATELIMIT_STORAGE_URL', 'memory://')
    )
    logger.info(f"Rate limiting enabled: {default_limits}")
else:
    limiter = None

# Initialize database BEFORE importing blueprints (which import models)
db.init_app(app)

# Import blueprints AFTER db is initialized
from api.kyc import kyc_bp
from api.admin_kyc import admin_kyc_bp
from api.access_requests import access_requests_bp
from api.admin_users import admin_users_bp
from api.admin_config import admin_config_bp
from api.seller import seller_bp
from api.buyer import buyer_bp
from api.swap import swap_bp
from api.calculator import calculator_bp
from api.market_opportunities import market_opportunities_bp
from api.market_analysis import market_analysis_bp

# Register blueprints
app.register_blueprint(kyc_bp)
app.register_blueprint(admin_kyc_bp)
app.register_blueprint(access_requests_bp)
app.register_blueprint(admin_users_bp)
app.register_blueprint(admin_config_bp)
app.register_blueprint(seller_bp, url_prefix='/api/seller')
app.register_blueprint(buyer_bp, url_prefix='/api/buyer')
app.register_blueprint(swap_bp, url_prefix='/api/swap')
app.register_blueprint(calculator_bp)
app.register_blueprint(market_opportunities_bp)
app.register_blueprint(market_analysis_bp)

# Create database tables
with app.app_context():
    db.create_all()
    logger.info("Database tables created/verified")

# Initialize scraper
scraper = ICEScraper()
alternative_source = AlternativePriceSource()

# Initialize historical data collector
data_dir = os.getenv('HISTORICAL_DATA_DIR', 'backend/data')
historical_collector = HistoricalDataCollector(data_dir=data_dir)

# Initialize background scheduler for price updates
scheduler = BackgroundScheduler()
scheduler.start()
logger.info("Background scheduler started")

# Cache configuration
CACHE_DURATION = 120  # Cache for 2 minutes
last_fetch_time = None
cached_response = None
last_cea_fetch_time = None
cached_cea_response = None

# Source names constants
SOURCE_ICE = 'ICE (Intercontinental Exchange)'
SOURCE_CARBONCREDITS = 'CarbonCredits.com'
SOURCE_ALPHAVANTAGE = 'Alpha Vantage API'
SOURCE_TRADINGVIEW = 'TradingView'
SOURCE_INVESTING = 'Investing.com'
SOURCE_MARKETWATCH = 'MarketWatch'
SOURCE_ICE_PUBLIC = 'ICE public pages'
SOURCE_OILPRICE_API = 'OilPriceAPI (fallback)'
SOURCE_CACHED = 'Cached'

# Track last price per source
source_price_history = {
    SOURCE_ICE: {'price': None, 'timestamp': None},
    SOURCE_CARBONCREDITS: {'price': None, 'timestamp': None},
    SOURCE_ALPHAVANTAGE: {'price': None, 'timestamp': None},
    SOURCE_TRADINGVIEW: {'price': None, 'timestamp': None},
    SOURCE_INVESTING: {'price': None, 'timestamp': None},
    SOURCE_MARKETWATCH: {'price': None, 'timestamp': None},
    SOURCE_ICE_PUBLIC: {'price': None, 'timestamp': None},
    SOURCE_OILPRICE_API: {'price': None, 'timestamp': None},
    SOURCE_CACHED: {'price': None, 'timestamp': None},
}


def scheduled_price_update():
    """Background job to fetch and store EUA price every 1 minute"""
    with app.app_context():
        try:
            # Fetch price from scraper
            price_data = scraper.scrape_ice_price()
            
            # If scraping fails, try alternative sources
            if not price_data:
                api_key = os.getenv('OILPRICE_API_KEY')
                price_data = alternative_source.fetch_from_oilprice_api(api_key)
            
            # If still no data, skip this update (don't store None)
            if not price_data or not price_data.get('price'):
                logger.warning("Scheduled price update: No price data available")
                return
            
            # Store in database
            price_entry = PriceHistory(
                price=price_data['price'],
                currency=price_data.get('currency', 'EUR'),
                source=price_data.get('source', 'Unknown'),
                timestamp=price_data['timestamp'],
                change24h=price_data.get('change24h')
            )
            db.session.add(price_entry)
            db.session.commit()
            
            # Update cache
            global cached_response, last_fetch_time
            cached_response = price_data
            last_fetch_time = datetime.now(timezone.utc)
            
            # Update source price history
            update_source_price_history(price_data)
            
            logger.info(f"Scheduled price update: Stored price €{price_data['price']} from {price_data.get('source', 'Unknown')}")
        except Exception as e:
            logger.error(f"Scheduled price update failed: {e}", exc_info=True)
            db.session.rollback()


# Schedule price update job (every 1 minute)
update_interval_minutes = int(os.getenv('PRICE_UPDATE_INTERVAL_MINUTES', 1))
scheduler.add_job(
    func=scheduled_price_update,
    trigger='interval',
    minutes=update_interval_minutes,
    id='eua_price_update',
    name='EUA Price Update (1 minute)',
    replace_existing=True
)
logger.info(f"Scheduled price update job: every {update_interval_minutes} minute(s)")

# Register shutdown handler for scheduler
atexit.register(lambda: scheduler.shutdown())


def update_source_price_history(price_data):
    """
    Update source_price_history with price data.
    
    Tracks the last price and timestamp obtained from each data source.
    This enables monitoring which sources are providing prices and their
    reliability over time.
    
    Args:
        price_data: Dictionary containing price data with optional 'source' field.
                    Expected keys: 'price', 'timestamp', 'source'
    
    Side Effects:
        Updates global source_price_history dictionary with:
        - source_price_history[source]['price']: Last price from this source
        - source_price_history[source]['timestamp']: ISO format timestamp
    
    Logs:
        Warning if source is not found in source_price_history dictionary
    """
    if price_data and price_data.get('source'):
        source = price_data['source']
        if source in source_price_history:
            source_price_history[source]['price'] = price_data['price']
            source_price_history[source]['timestamp'] = price_data.get('timestamp')
            if isinstance(source_price_history[source]['timestamp'], datetime):
                source_price_history[source]['timestamp'] = source_price_history[source]['timestamp'].isoformat()
        else:
            logger.warning(f"Source '{source}' not found in source_price_history. Add it to the dictionary.")


@app.route('/api/health', methods=['GET'])
@app.route('/health', methods=['GET'])  # Keep for direct backend access
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'EU ETS Price Scraper',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 200


@app.route('/api/eua/price', methods=['GET'])
def get_eua_price():
    """
    Get current EU ETS (EUA) price.
    
    Returns cached result if available and fresh (within CACHE_DURATION),
    otherwise scrapes new data from multiple sources in order of preference.
    
    Response includes:
        - price: Current EUA price in EUR
        - timestamp: ISO 8601 timestamp
        - currency: Currency code ("EUR")
        - change24h: 24-hour price change percentage (optional)
        - source: Name of data source that provided this price
    
    Source tracking:
        Updates source_price_history when new price is fetched.
        Source information is included in response for monitoring.
    """
    global last_fetch_time, cached_response
    
    # Check cache
    if cached_response and last_fetch_time:
        time_diff = (datetime.now(timezone.utc) - last_fetch_time).total_seconds()
        if time_diff < CACHE_DURATION:
            logger.info("Returning cached price")
            return jsonify(cached_response), 200
    
    # Try to scrape from ICE
    logger.info("Fetching new price from ICE")
    price_data = scraper.scrape_ice_price()
    
    # If ICE scraping fails, try alternative sources
    if not price_data:
        logger.info("ICE scraping failed, trying alternative sources")
        api_key = os.getenv('OILPRICE_API_KEY')
        price_data = alternative_source.fetch_from_oilprice_api(api_key)
    
    # If still no data, use cached price or return error
    if not price_data:
        cached = scraper.get_cached_price()
        if cached:
            logger.warning("Using cached price as fallback")
            price_data = cached
        else:
            logger.error("No price data available")
            return jsonify({
                'error': 'Unable to fetch price data',
                'message': 'All data sources failed'
            }), 503
    
    # Track source price history
    update_source_price_history(price_data)
    
    # Update cache
    cached_response = price_data
    last_fetch_time = datetime.now(timezone.utc)
    
    # Format response
    response = {
        'price': price_data['price'],
        'timestamp': price_data['timestamp'].isoformat() if isinstance(price_data['timestamp'], datetime) else price_data['timestamp'],
        'currency': price_data['currency'],
        'change24h': price_data.get('change24h'),
        'source': price_data.get('source')
    }
    
    return jsonify(response), 200


@app.route('/api/eua/price/refresh', methods=['POST'])
def refresh_price():
    """
    Force refresh of price data (bypasses cache).
    
    Scrapes fresh price data from multiple sources, updating cache and
    source price history. Response format same as GET /api/eua/price,
    including source field.
    """
    global last_fetch_time, cached_response
    
    logger.info("Force refreshing price data")
    
    # Scrape fresh data
    price_data = scraper.scrape_ice_price()
    
    # Try alternative if ICE fails
    if not price_data:
        api_key = os.getenv('OILPRICE_API_KEY')
        price_data = alternative_source.fetch_from_oilprice_api(api_key)
    
    if not price_data:
        cached = scraper.get_cached_price()
        if cached:
            price_data = cached
        else:
            return jsonify({
                'error': 'Unable to fetch price data',
                'message': 'All data sources failed'
            }), 503
    
    # Track source price history
    update_source_price_history(price_data)
    
    # Update cache
    cached_response = price_data
    last_fetch_time = datetime.now(timezone.utc)
    
    response = {
        'price': price_data['price'],
        'timestamp': price_data['timestamp'].isoformat() if isinstance(price_data['timestamp'], datetime) else price_data['timestamp'],
        'currency': price_data['currency'],
        'change24h': price_data.get('change24h'),
        'source': price_data.get('source')
    }
    
    return jsonify(response), 200


@app.route('/api/cea/price', methods=['GET'])
def get_cea_price():
    """
    Get current Chinese CEA (China ETS Allowances) price
    Returns cached result if available and fresh, otherwise generates new data
    """
    global last_cea_fetch_time, cached_cea_response, cached_response
    
    # Check cache
    if cached_cea_response and last_cea_fetch_time:
        time_diff = (datetime.now(timezone.utc) - last_cea_fetch_time).total_seconds()
        if time_diff < CACHE_DURATION:
            logger.info("Returning cached CEA price")
            return jsonify(cached_cea_response), 200
    
    # Get EUA price for reference (use cached if available)
    eua_price = None
    if cached_response and cached_response.get('price'):
        eua_price = cached_response['price']
    else:
        # Try to fetch EUA price quickly
        eua_data = scraper.scrape_ice_price()
        if eua_data and eua_data.get('price'):
            eua_price = eua_data['price']
    
    # Generate CEA price based on EUA price
    logger.info("Generating CEA price")
    cea_price_data = scraper.scrape_cea_price(eua_price)
    
    if not cea_price_data:
        # Fallback: use cached CEA price if available
        if cached_cea_response:
            logger.warning("Using cached CEA price as fallback")
            return jsonify(cached_cea_response), 200
        else:
            logger.error("No CEA price data available")
            return jsonify({
                'error': 'Unable to generate CEA price data',
                'message': 'Price generation failed'
            }), 503
    
    # Update cache
    cached_cea_response = cea_price_data
    last_cea_fetch_time = datetime.now(timezone.utc)
    
    # Format response
    response = {
        'price': cea_price_data['price'],
        'timestamp': cea_price_data['timestamp'].isoformat() if isinstance(cea_price_data['timestamp'], datetime) else cea_price_data['timestamp'],
        'currency': cea_price_data['currency'],
        'change24h': cea_price_data.get('change24h')
    }
    
    return jsonify(response), 200


@app.route('/api/eua/history', methods=['GET'])
def get_eua_history():
    """
    Get historical EUA price data
    Query params: start_date (YYYY-MM-DD), end_date (YYYY-MM-DD)
    Defaults to last 5 years if not specified
    """
    try:
        # Parse query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        # Default to 5 years ago if not specified
        if not end_date_str:
            end_date = datetime.now(timezone.utc)
        else:
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        
        if not start_date_str:
            start_date = end_date - timedelta(days=5*365)  # 5 years
        else:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
        
        # Validate date range
        if start_date > end_date:
            return jsonify({
                'error': 'Invalid date range',
                'message': 'start_date must be before end_date'
            }), 400
        
        # Limit to reasonable range (max 10 years)
        max_range = timedelta(days=10*365)
        if (end_date - start_date) > max_range:
            return jsonify({
                'error': 'Date range too large',
                'message': 'Maximum date range is 10 years'
            }), 400
        
        logger.info(f"Fetching EUA history from {start_date.date()} to {end_date.date()}")
        
        # Get historical data
        eua_data = historical_collector.collect_eua_history(start_date, end_date)
        
        return jsonify({
            'data': eua_data,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'count': len(eua_data)
        }), 200
        
    except ValueError as e:
        logger.error(f"Invalid date format: {e}")
        return jsonify({
            'error': 'Invalid date format',
            'message': 'Dates must be in YYYY-MM-DD format'
        }), 400
    except Exception as e:
        logger.error(f"Error fetching EUA history: {e}")
        return jsonify({
            'error': 'Failed to fetch historical data',
            'message': str(e)
        }), 500


@app.route('/api/eua/price/history', methods=['GET'])
def get_eua_price_history():
    """
    Get historical EUA price data from database.
    
    Query Parameters:
        - start_date (optional): ISO date string (YYYY-MM-DD) or ISO datetime
        - end_date (optional): ISO date string (YYYY-MM-DD) or ISO datetime
        - source (optional): Filter by source name
        - limit (optional): Maximum number of results (default: 1000)
    
    Returns:
        JSON response with price history data in camelCase format
    """
    try:
        # Parse query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        source_filter = request.args.get('source')
        limit = request.args.get('limit', type=int, default=1000)
        
        # Build query
        query = PriceHistory.query
        
        # Apply date filters
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
            query = query.filter(PriceHistory.timestamp >= start_date)
        
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
            query = query.filter(PriceHistory.timestamp <= end_date)
        
        # Apply source filter
        if source_filter:
            query = query.filter(PriceHistory.source == source_filter)
        
        # Order by timestamp descending (newest first) and limit
        query = query.order_by(PriceHistory.timestamp.desc()).limit(limit)
        
        # Execute query
        price_entries = query.all()
        
        # Convert to dictionary format (camelCase for frontend)
        data = [entry.to_dict(camel_case=True) for entry in price_entries]
        
        # Determine date range for response
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
        else:
            start_date = None
        
        if end_date_str:
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        else:
            end_date = datetime.now(timezone.utc)
        
        return jsonify({
            'data': data,
            'count': len(data),
            'startDate': start_date.isoformat() if start_date else None,
            'endDate': end_date.isoformat() if end_date else None
        }), 200
        
    except ValueError as e:
        logger.error(f"Invalid date format: {e}")
        return jsonify({
            'error': 'Invalid date format',
            'message': 'Dates must be in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)'
        }), 400
    except Exception as e:
        logger.error(f"Error fetching price history: {e}")
        return jsonify({
            'error': 'Failed to fetch price history',
            'message': str(e)
        }), 500


@app.route('/api/cea/history', methods=['GET'])
def get_cea_history():
    """
    Get historical CEA price data
    Query params: start_date (YYYY-MM-DD), end_date (YYYY-MM-DD)
    Defaults to last 5 years if not specified
    """
    try:
        # Parse query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        # Default to 5 years ago if not specified
        if not end_date_str:
            end_date = datetime.now(timezone.utc)
        else:
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        
        if not start_date_str:
            start_date = end_date - timedelta(days=5*365)  # 5 years
        else:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
        
        # Validate date range
        if start_date > end_date:
            return jsonify({
                'error': 'Invalid date range',
                'message': 'start_date must be before end_date'
            }), 400
        
        # Limit to reasonable range (max 10 years)
        max_range = timedelta(days=10*365)
        if (end_date - start_date) > max_range:
            return jsonify({
                'error': 'Date range too large',
                'message': 'Maximum date range is 10 years'
            }), 400
        
        logger.info(f"Fetching CEA history from {start_date.date()} to {end_date.date()}")
        
        # Get EUA data first (CEA is calculated from EUA)
        eua_data = historical_collector.collect_eua_history(start_date, end_date)
        
        # Get CEA historical data
        cea_data = historical_collector.collect_cea_history(start_date, end_date, eua_data=eua_data)
        
        return jsonify({
            'data': cea_data,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'count': len(cea_data)
        }), 200
        
    except ValueError as e:
        logger.error(f"Invalid date format: {e}")
        return jsonify({
            'error': 'Invalid date format',
            'message': 'Dates must be in YYYY-MM-DD format'
        }), 400
    except Exception as e:
        logger.error(f"Error fetching CEA history: {e}")
        return jsonify({
            'error': 'Failed to fetch historical data',
            'message': str(e)
        }), 500


@app.route('/api/history/combined', methods=['GET'])
def get_combined_history():
    """
    Get combined historical EUA and CEA price data
    Query params: start_date (YYYY-MM-DD), end_date (YYYY-MM-DD)
    Defaults to last 5 years if not specified
    """
    try:
        # Parse query parameters
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        
        # Default to 5 years ago if not specified
        if not end_date_str:
            end_date = datetime.now(timezone.utc)
        else:
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        
        if not start_date_str:
            start_date = end_date - timedelta(days=5*365)  # 5 years
        else:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
        
        # Validate date range
        if start_date > end_date:
            return jsonify({
                'error': 'Invalid date range',
                'message': 'start_date must be before end_date'
            }), 400
        
        # Limit to reasonable range (max 10 years)
        max_range = timedelta(days=10*365)
        if (end_date - start_date) > max_range:
            return jsonify({
                'error': 'Date range too large',
                'message': 'Maximum date range is 10 years'
            }), 400
        
        logger.info(f"Fetching combined history from {start_date.date()} to {end_date.date()}")
        
        # Get combined historical data
        combined_data = historical_collector.get_historical_data(start_date, end_date)
        
        # Combine into single array format matching frontend expectations
        # Create a map of dates to combine EUA and CEA
        eua_dict = {entry['date']: entry for entry in combined_data['eua']}
        cea_dict = {entry['date']: entry for entry in combined_data['cea']}
        
        # Get all unique dates
        all_dates = sorted(set(list(eua_dict.keys()) + list(cea_dict.keys())))
        
        combined_list = []
        for date_str in all_dates:
            eua_entry = eua_dict.get(date_str)
            cea_entry = cea_dict.get(date_str)
            
            combined_list.append({
                'date': date_str,
                'priceEUA': eua_entry['price'] if eua_entry else None,
                'priceCEA': cea_entry['price'] if cea_entry else None,
                'currency': 'EUR'
            })
        
        return jsonify({
            'data': combined_list,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'count': len(combined_list)
        }), 200
        
    except ValueError as e:
        logger.error(f"Invalid date format: {e}")
        return jsonify({
            'error': 'Invalid date format',
            'message': 'Dates must be in YYYY-MM-DD format'
        }), 400
    except Exception as e:
        logger.error(f"Error fetching combined history: {e}")
        return jsonify({
            'error': 'Failed to fetch historical data',
            'message': str(e)
        }), 500


@app.route('/api/admin/price-updates/status', methods=['GET'])
@require_admin
def get_price_updates_status():
    """
    Get price update status and configuration for admin monitoring.
    
    Returns comprehensive information about EUA and CEA price update systems,
    including polling intervals, cache duration, endpoints, libraries used,
    data sources, last update timestamps, and current status.
    
    Protected with @require_admin decorator - requires X-Admin-ID header.
    
    Returns:
        JSON response with:
        - eua: EUA price update configuration and status
        - cea: CEA price update configuration and status  
        - historical: Historical data collector information
    
    Response format:
        {
            'eua': {
                'pollingInterval': 300000,  # 5 minutes (ms)
                'cacheDuration': 120,  # seconds
                'endpoint': '/api/eua/price',
                'libraries': {'backend': [...], 'frontend': [...]},
                'dataSources': [...],
                'lastUpdate': 'ISO timestamp',
                'lastSource': 'source name',  # Name of source that provided last price
                'lastPrice': 75.50,  # Last price from current cached response
                'sourcePrices': [  # Array of last price per source
                    {
                        'source': 'ICE (Intercontinental Exchange)',
                        'lastPrice': 75.50,
                        'lastUpdate': 'ISO timestamp'
                    },
                    ...
                ],
                'status': 'success' | 'unknown'
            },
            'cea': {...},
            'historical': {...}
        }
    """
    
    # Get last update times from cache
    global last_fetch_time, cached_response, last_cea_fetch_time, cached_cea_response, source_price_history
    
    eua_last_update = None
    eua_last_source = None
    eua_last_price = None
    eua_status = 'success' if cached_response else 'unknown'
    
    if cached_response:
        eua_last_update = cached_response.get('timestamp')
        if isinstance(eua_last_update, datetime):
            eua_last_update = eua_last_update.isoformat()
        elif isinstance(eua_last_update, str):
            pass  # Already a string
        else:
            eua_last_update = last_fetch_time.isoformat() if last_fetch_time else None
        eua_last_source = cached_response.get('source', 'Unknown')
        eua_last_price = cached_response.get('price')
    
    # Build source prices array
    source_prices = []
    for source_name in [
        SOURCE_ICE,
        SOURCE_CARBONCREDITS,
        SOURCE_ALPHAVANTAGE,
        SOURCE_TRADINGVIEW,
        SOURCE_INVESTING,
        SOURCE_MARKETWATCH,
        SOURCE_ICE_PUBLIC,
        SOURCE_OILPRICE_API,
        SOURCE_CACHED,
    ]:
        source_data = source_price_history.get(source_name, {})
        source_prices.append({
            'source': source_name,
            'lastPrice': source_data.get('price'),
            'lastUpdate': source_data.get('timestamp')
        })
    
    cea_last_update = None
    cea_status = 'success' if cached_cea_response else 'unknown'
    
    if cached_cea_response:
        cea_last_update = cached_cea_response.get('timestamp')
        if isinstance(cea_last_update, datetime):
            cea_last_update = cea_last_update.isoformat()
        elif isinstance(cea_last_update, str):
            pass  # Already a string
        else:
            cea_last_update = last_cea_fetch_time.isoformat() if last_cea_fetch_time else None
    
    return jsonify({
        'eua': {
            'pollingInterval': 300000,  # 5 minutes from frontend
            'cacheDuration': CACHE_DURATION,
            'endpoint': '/api/eua/price',
            'libraries': {
                'backend': ['requests', 'beautifulsoup4', 'json', 're'],
                'frontend': ['axios']
            },
            'dataSources': [
                SOURCE_ICE,
                SOURCE_CARBONCREDITS,
                SOURCE_ALPHAVANTAGE,
                SOURCE_TRADINGVIEW,
                SOURCE_INVESTING,
                SOURCE_MARKETWATCH,
                SOURCE_ICE_PUBLIC,
                SOURCE_OILPRICE_API
            ],
            'lastUpdate': eua_last_update,
            'lastSource': eua_last_source,
            'lastPrice': eua_last_price,
            'sourcePrices': source_prices,
            'status': eua_status
        },
        'cea': {
            'pollingInterval': 300000,  # 5 minutes from frontend
            'cacheDuration': CACHE_DURATION,
            'endpoint': '/api/cea/price',
            'libraries': {
                'backend': ['requests', 'beautifulsoup4', 'json', 're'],
                'frontend': ['axios']
            },
            'method': 'Generated based on EUA price (30-50% discount)',
            'lastUpdate': cea_last_update,
            'status': cea_status
        },
        'historical': {
            'libraries': ['requests', 'BeautifulSoup', 'json'],
            'method': 'Realistic generation based on market trends',
            'dataFiles': [
                'backend/data/historical_eua.json',
                'backend/data/historical_cea.json'
            ]
        }
    }), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

