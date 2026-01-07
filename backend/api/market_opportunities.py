"""
Market Opportunities API endpoints

Provides endpoints for market opportunity detection:
- GET /api/market/opportunities - List detected market opportunities
"""

from flask import Blueprint, request, jsonify
from typing import List, Dict, Optional
import logging

from services.market_opportunity_detector import MarketOpportunityDetector
from utils.helpers import standard_error_response

logger = logging.getLogger(__name__)

market_opportunities_bp = Blueprint('market_opportunities', __name__, url_prefix='/api/market')

opportunity_detector = MarketOpportunityDetector()


@market_opportunities_bp.route('/opportunities', methods=['GET'])
def get_opportunities():
    """
    Get detected market opportunities.
    
    Query Parameters:
        - type: Filter by opportunity type ('arbitrage', 'swap_optimization', 'liquidity_crisis')
        - minSavings: Minimum potential savings (optional)
    
    Response:
        {
            "opportunities": [
                {
                    "type": string,
                    "description": string,
                    "potentialSavings": string,
                    "action": string,
                    "expiresAt": string (optional),
                    ...
                }
            ]
        }
    """
    try:
        # Get query parameters
        opportunity_type = request.args.get('type')
        min_savings = request.args.get('minSavings', type=float)
        
        # Get current prices (would normally fetch from cache/API)
        # For now, use default values - in production, fetch from price cache
        eua_price = request.args.get('euaPrice', type=float)
        cea_price = request.args.get('ceaPrice', type=float)
        
        # Detect opportunities
        opportunities = opportunity_detector.detect_all_opportunities(
            eua_price=eua_price,
            cea_price=cea_price
        )
        
        # Filter by type if specified
        if opportunity_type:
            opportunities = [opp for opp in opportunities if opp.get('type') == opportunity_type]
        
        # Filter by min savings if specified (this is a simple filter, actual implementation
        # would parse the potential_savings string)
        if min_savings is not None:
            # Simple filter - in production, would parse potential_savings more intelligently
            opportunities = [opp for opp in opportunities if 'potential_savings' in opp]
        
        return jsonify({
            'opportunities': opportunities
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching opportunities: {e}", exc_info=True)
        return standard_error_response('Failed to fetch opportunities', 'FETCH_ERROR', 500)

