"""
Flask REST API for EU ETS Price Data
Provides endpoint to fetch real-time EU ETS prices scraped from ICE
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timezone, timedelta
import logging
import os
from scraper import ICEScraper, AlternativePriceSource
from historical_data_collector import HistoricalDataCollector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize scraper
scraper = ICEScraper()
alternative_source = AlternativePriceSource()

# Initialize historical data collector
data_dir = os.getenv('HISTORICAL_DATA_DIR', 'backend/data')
historical_collector = HistoricalDataCollector(data_dir=data_dir)

# Cache configuration
CACHE_DURATION = 120  # Cache for 2 minutes
last_fetch_time = None
cached_response = None
last_cer_fetch_time = None
cached_cer_response = None


@app.route('/health', methods=['GET'])
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
    Get current EU ETS (EUA) price
    Returns cached result if available and fresh, otherwise scrapes new data
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
            return jsonify(cached), 200
        else:
            logger.error("No price data available")
            return jsonify({
                'error': 'Unable to fetch price data',
                'message': 'All data sources failed'
            }), 503
    
    # Update cache
    cached_response = price_data
    last_fetch_time = datetime.now(timezone.utc)
    
    # Format response
    response = {
        'price': price_data['price'],
        'timestamp': price_data['timestamp'].isoformat() if isinstance(price_data['timestamp'], datetime) else price_data['timestamp'],
        'currency': price_data['currency'],
        'change24h': price_data.get('change24h')
    }
    
    return jsonify(response), 200


@app.route('/api/eua/price/refresh', methods=['POST'])
def refresh_price():
    """Force refresh of price data (bypasses cache)"""
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
    
    # Update cache
    cached_response = price_data
    last_fetch_time = datetime.now(timezone.utc)
    
    response = {
        'price': price_data['price'],
        'timestamp': price_data['timestamp'].isoformat() if isinstance(price_data['timestamp'], datetime) else price_data['timestamp'],
        'currency': price_data['currency'],
        'change24h': price_data.get('change24h')
    }
    
    return jsonify(response), 200


@app.route('/api/cer/price', methods=['GET'])
def get_cer_price():
    """
    Get current Chinese CER (Certified Emission Reduction) price
    Returns cached result if available and fresh, otherwise generates new data
    """
    global last_cer_fetch_time, cached_cer_response, cached_response
    
    # Check cache
    if cached_cer_response and last_cer_fetch_time:
        time_diff = (datetime.now(timezone.utc) - last_cer_fetch_time).total_seconds()
        if time_diff < CACHE_DURATION:
            logger.info("Returning cached CER price")
            return jsonify(cached_cer_response), 200
    
    # Get EUA price for reference (use cached if available)
    eua_price = None
    if cached_response and cached_response.get('price'):
        eua_price = cached_response['price']
    else:
        # Try to fetch EUA price quickly
        eua_data = scraper.scrape_ice_price()
        if eua_data and eua_data.get('price'):
            eua_price = eua_data['price']
    
    # Generate CER price based on EUA price
    logger.info("Generating CER price")
    cer_price_data = scraper.scrape_cer_price(eua_price)
    
    if not cer_price_data:
        # Fallback: use cached CER price if available
        if cached_cer_response:
            logger.warning("Using cached CER price as fallback")
            return jsonify(cached_cer_response), 200
        else:
            logger.error("No CER price data available")
            return jsonify({
                'error': 'Unable to generate CER price data',
                'message': 'Price generation failed'
            }), 503
    
    # Update cache
    cached_cer_response = cer_price_data
    last_cer_fetch_time = datetime.now(timezone.utc)
    
    # Format response
    response = {
        'price': cer_price_data['price'],
        'timestamp': cer_price_data['timestamp'].isoformat() if isinstance(cer_price_data['timestamp'], datetime) else cer_price_data['timestamp'],
        'currency': cer_price_data['currency'],
        'change24h': cer_price_data.get('change24h')
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


@app.route('/api/cer/history', methods=['GET'])
def get_cer_history():
    """
    Get historical CER price data
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
        
        logger.info(f"Fetching CER history from {start_date.date()} to {end_date.date()}")
        
        # Get EUA data first (CER is calculated from EUA)
        eua_data = historical_collector.collect_eua_history(start_date, end_date)
        
        # Get CER historical data
        cer_data = historical_collector.collect_cer_history(start_date, end_date, eua_data=eua_data)
        
        return jsonify({
            'data': cer_data,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'count': len(cer_data)
        }), 200
        
    except ValueError as e:
        logger.error(f"Invalid date format: {e}")
        return jsonify({
            'error': 'Invalid date format',
            'message': 'Dates must be in YYYY-MM-DD format'
        }), 400
    except Exception as e:
        logger.error(f"Error fetching CER history: {e}")
        return jsonify({
            'error': 'Failed to fetch historical data',
            'message': str(e)
        }), 500


@app.route('/api/history/combined', methods=['GET'])
def get_combined_history():
    """
    Get combined historical EUA and CER price data
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
        # Create a map of dates to combine EUA and CER
        eua_dict = {entry['date']: entry for entry in combined_data['eua']}
        cer_dict = {entry['date']: entry for entry in combined_data['cer']}
        
        # Get all unique dates
        all_dates = sorted(set(list(eua_dict.keys()) + list(cer_dict.keys())))
        
        combined_list = []
        for date_str in all_dates:
            eua_entry = eua_dict.get(date_str)
            cer_entry = cer_dict.get(date_str)
            
            combined_list.append({
                'date': date_str,
                'priceEUA': eua_entry['price'] if eua_entry else None,
                'priceCER': cer_entry['price'] if cer_entry else None,
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


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

