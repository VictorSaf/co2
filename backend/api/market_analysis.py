"""
Market Analysis API endpoints

Provides comprehensive market analysis:
- GET /api/market/analysis - Get comprehensive market analysis
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional
import logging

from services.market_opportunity_detector import MarketOpportunityDetector
from services.swap_calculator import SwapCalculator
from utils.compliance_detector import ComplianceDetector
from utils.helpers import standard_error_response

logger = logging.getLogger(__name__)

market_analysis_bp = Blueprint('market_analysis', __name__, url_prefix='/api/market')

opportunity_detector = MarketOpportunityDetector()
swap_calculator = SwapCalculator()
compliance_detector = ComplianceDetector()


@market_analysis_bp.route('/analysis', methods=['GET'])
def get_market_analysis():
    """
    Get comprehensive market analysis including:
    - Current EUA and CEA prices
    - Price spreads and arbitrage opportunities
    - Swap recommendations
    - Historical trends
    
    Query Parameters:
        - euaPrice: Current EUA price (optional, will use default if not provided)
        - ceaPrice: Current CEA price (optional, will use default if not provided)
    
    Response:
        {
            "currentPrices": {
                "eua": { "price": number, "currency": "EUR", "change24h": number },
                "cea": { "price": number, "currency": "EUR", "change24h": number }
            },
            "spread": {
                "absolute": number,
                "percentage": number,
                "arbitrageOpportunity": boolean
            },
            "arbitrageOpportunities": [...],
            "swapRecommendations": [...],
            "historicalTrends": {...}
        }
    """
    try:
        # Get prices from query params or use defaults
        eua_price = request.args.get('euaPrice', type=float)
        cea_price = request.args.get('ceaPrice', type=float)
        
        # In production, these would be fetched from price cache
        # For now, use defaults if not provided
        if eua_price is None:
            eua_price = 88.31  # Default EUA price
        if cea_price is None:
            cea_price = 8.08  # Default CEA price (40% discount)
        
        # Calculate spread
        spread_absolute = eua_price - cea_price
        spread_percentage = (spread_absolute / cea_price * 100) if cea_price > 0 else 0
        arbitrage_opportunity = (eua_price / cea_price) >= 10.0 if cea_price > 0 else False
        
        # Detect arbitrage opportunities
        arbitrage_opportunities = opportunity_detector.detect_arbitrage_opportunities(
            eua_price, cea_price
        )
        
        # Generate swap recommendations
        swap_recommendations = []
        if arbitrage_opportunity:
            market_conditions = {
                'liquidity_premium': 0.1,
                'compliance_adjustment': 0.2 if compliance_detector.is_compliance_period() else 0.0,
                'volume_discount': 0.0
            }
            swap_ratio = swap_calculator.calculate_swap_ratio(
                eua_price, cea_price, market_conditions
            )
            
            swap_recommendations.append({
                'type': 'arbitrage_swap',
                'description': f'Price gap {eua_price / cea_price:.1f}x - swap EUA → CEA',
                'swapRatio': swap_ratio,
                'potentialBenefit': '5-10% value creation',
                'recommendedAction': 'Execute swap for diversification'
            })
        
        # Get market condition
        market_condition = compliance_detector.get_market_condition()
        days_until_deadline = compliance_detector.days_until_deadline()
        
        # Build response
        response = {
            'currentPrices': {
                'eua': {
                    'price': round(eua_price, 2),
                    'currency': 'EUR',
                    'change24h': None  # Would be fetched from price cache
                },
                'cea': {
                    'price': round(cea_price, 2),
                    'currency': 'EUR',
                    'change24h': None  # Would be fetched from price cache
                }
            },
            'spread': {
                'absolute': round(spread_absolute, 2),
                'percentage': round(spread_percentage, 2),
                'arbitrageOpportunity': arbitrage_opportunity
            },
            'arbitrageOpportunities': arbitrage_opportunities,
            'swapRecommendations': swap_recommendations,
            'marketCondition': {
                'condition': market_condition,
                'daysUntilDeadline': days_until_deadline,
                'isCompliancePeriod': compliance_detector.is_compliance_period()
            },
            'historicalTrends': {
                # Would include historical data in production
                'note': 'Historical trends would be included here'
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error fetching market analysis: {e}", exc_info=True)
        return standard_error_response('Failed to fetch market analysis', 'FETCH_ERROR', 500)

