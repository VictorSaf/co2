#!/usr/bin/env python3
"""
Standalone script to populate historical price data
Can be run manually or scheduled to update historical data
"""

import sys
import os
from datetime import datetime, timedelta, timezone

# Add parent directory to path to import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from historical_data_collector import HistoricalDataCollector
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Main function to populate historical data"""
    # Default to 5 years of data
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=5*365)
    
    # Allow override via environment variables
    start_date_str = os.getenv('START_DATE')
    end_date_str = os.getenv('END_DATE')
    
    if start_date_str:
        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
        if start_date.tzinfo is None:
            start_date = start_date.replace(tzinfo=timezone.utc)
    
    if end_date_str:
        end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        if end_date.tzinfo is None:
            end_date = end_date.replace(tzinfo=timezone.utc)
    
    # Data directory
    data_dir = os.getenv('HISTORICAL_DATA_DIR', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data'))
    
    logger.info(f"Starting historical data population")
    logger.info(f"Date range: {start_date.date()} to {end_date.date()}")
    logger.info(f"Data directory: {data_dir}")
    
    try:
        # Create collector
        collector = HistoricalDataCollector(data_dir=data_dir)
        
        # Collect data
        logger.info("Collecting EUA historical data...")
        eua_data = collector.collect_eua_history(start_date, end_date)
        logger.info(f"Collected {len(eua_data)} EUA entries")
        
        logger.info("Collecting CER historical data...")
        cer_data = collector.collect_cer_history(start_date, end_date, eua_data=eua_data)
        logger.info(f"Collected {len(cer_data)} CER entries")
        
        logger.info("Historical data population completed successfully!")
        logger.info(f"EUA data saved to: {collector.eua_file}")
        logger.info(f"CER data saved to: {collector.cer_file}")
        
        return 0
        
    except Exception as e:
        logger.error(f"Error populating historical data: {e}", exc_info=True)
        return 1


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)

