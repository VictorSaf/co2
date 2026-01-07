"""
Calculator API endpoints

Provides endpoints for value calculation scenarios:
- POST /api/calculator/seller-scenario - Calculate benefits for CEA sellers
- POST /api/calculator/buyer-swap-scenario - Calculate benefits for swap buyers
- POST /api/calculator/scenarios - Save calculated scenario
- GET /api/calculator/scenarios - List saved scenarios
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from typing import Dict, Any
import json
import logging

from database import db
from models.user import User
from models.value_scenario import ValueScenario
from services.value_calculator import ValueCalculatorService
from services.swap_calculator import SwapCalculator
from utils.helpers import require_auth, standard_error_response, generate_uuid
from utils.validators import validate_uuid

logger = logging.getLogger(__name__)

calculator_bp = Blueprint('calculator', __name__, url_prefix='/api/calculator')

value_calculator_service = ValueCalculatorService()
swap_calculator = SwapCalculator()


@calculator_bp.route('/seller-scenario', methods=['POST'])
@require_auth
def calculate_seller_scenario():
    """
    Calculate benefits for CEA seller comparing Nihao vs Shanghai Exchange.
    
    Request Body:
        {
            "volume": number (required),
            "currentPrice": number (required),
            "urgency": "normal" | "urgent" | "panic" (optional, default: "normal"),
            "confidentiality": boolean (optional, default: false),
            "fxPreference": "RMB" | "EUR" | "USD" (optional)
        }
    
    Response:
        {
            "nihaoOffer": {
                "price": number,
                "executionTime": string,
                "totalValue": number
            },
            "shanghaiAlternative": {
                "price": number,
                "executionTime": string,
                "totalValue": number,
                "marketImpact": number
            },
            "benefits": {
                "liquidity": string,
                "pricePremium": number,
                "timeSavings": string,
                "confidentiality": boolean,
                "fxFlexibility": boolean
            },
            "totalSavings": number,
            "savingsPercentage": number
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return standard_error_response('Request body is required', 'MISSING_BODY', 400)
        
        # Validate required fields
        volume = data.get('volume')
        current_price = data.get('currentPrice')
        
        if volume is None:
            return standard_error_response('volume is required', 'MISSING_VOLUME', 400)
        if current_price is None:
            return standard_error_response('currentPrice is required', 'MISSING_CURRENT_PRICE', 400)
        
        # Validate types
        try:
            volume = float(volume)
            current_price = float(current_price)
        except (ValueError, TypeError):
            return standard_error_response('volume and currentPrice must be numbers', 'INVALID_TYPE', 400)
        
        if volume <= 0:
            return standard_error_response('volume must be positive', 'INVALID_VOLUME', 400)
        if current_price <= 0:
            return standard_error_response('currentPrice must be positive', 'INVALID_PRICE', 400)
        
        # Get optional parameters
        urgency = data.get('urgency', 'normal')
        if urgency not in ['normal', 'urgent', 'panic']:
            urgency = 'normal'
        
        confidentiality = data.get('confidentiality', False)
        fx_preference = data.get('fxPreference')
        
        # Calculate benefits
        result = value_calculator_service.calculate_seller_benefits(
            volume=volume,
            current_price=current_price,
            urgency=urgency,
            confidentiality=confidentiality,
            fx_preference=fx_preference
        )
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error calculating seller scenario: {e}", exc_info=True)
        return standard_error_response('Failed to calculate scenario', 'CALCULATION_ERROR', 500)


@calculator_bp.route('/buyer-swap-scenario', methods=['POST'])
@require_auth
def calculate_buyer_swap_scenario():
    """
    Calculate benefits for buyer swap scenario (EUA → CEA).
    
    Request Body:
        {
            "euaVolume": number (required),
            "euaPrice": number (required),
            "ceaPrice": number (optional, will fetch if not provided),
            "swapRatio": number (optional, will calculate if not provided),
            "useCase": "compliance" | "cbam" | "investment" | "divestment" (optional),
            "hasChinaOperations": boolean (optional, default: false)
        }
    
    Response:
        {
            "directSwapCosts": {
                "wfoeSetup": number,
                "timeToMarket": string,
                "capitalControlsRisk": boolean,
                "fxExposure": number
            },
            "nihaoSwap": {
                "fee": number,
                "executionTime": string,
                "noWfoeNeeded": boolean,
                "noCapitalControls": boolean
            },
            "benefits": {
                "wfoeSavings": number,
                "timeSavings": string,
                "riskReduction": string,
                "cbamOptimization": number (optional)
            },
            "totalSavings": number,
            "savingsPercentage": number
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return standard_error_response('Request body is required', 'MISSING_BODY', 400)
        
        # Validate required fields
        eua_volume = data.get('euaVolume')
        eua_price = data.get('euaPrice')
        
        if eua_volume is None:
            return standard_error_response('euaVolume is required', 'MISSING_EUA_VOLUME', 400)
        if eua_price is None:
            return standard_error_response('euaPrice is required', 'MISSING_EUA_PRICE', 400)
        
        # Validate types
        try:
            eua_volume = float(eua_volume)
            eua_price = float(eua_price)
        except (ValueError, TypeError):
            return standard_error_response('euaVolume and euaPrice must be numbers', 'INVALID_TYPE', 400)
        
        if eua_volume <= 0:
            return standard_error_response('euaVolume must be positive', 'INVALID_VOLUME', 400)
        if eua_price <= 0:
            return standard_error_response('euaPrice must be positive', 'INVALID_PRICE', 400)
        
        # Get optional parameters
        cea_price = data.get('ceaPrice')
        swap_ratio = data.get('swapRatio')
        use_case = data.get('useCase', 'compliance')
        has_china_ops = data.get('hasChinaOperations', False)
        
        # Calculate CEA price if not provided (estimate as 40% discount from EUA)
        if cea_price is None:
            cea_price = eua_price * 0.6
        else:
            cea_price = float(cea_price)
        
        # Calculate swap ratio if not provided
        if swap_ratio is None:
            from utils.compliance_detector import ComplianceDetector
            compliance_detector = ComplianceDetector()
            
            market_conditions = {
                'liquidity_premium': 0.1,
                'compliance_adjustment': 0.2 if compliance_detector.is_compliance_period() else 0.0,
                'volume_discount': 0.1 if eua_volume > 1000000 else 0.0
            }
            swap_ratio = swap_calculator.calculate_swap_ratio(eua_price, cea_price, market_conditions)
        else:
            swap_ratio = float(swap_ratio)
        
        # Calculate direct swap costs
        wfoe_setup = 75000 if not has_china_ops else 0  # €50k-100k average
        time_to_market = "6-12 months" if not has_china_ops else "2-4 weeks"
        capital_controls_risk = True
        fx_exposure = eua_volume * eua_price * 0.015  # 1.5% FX spread
        
        # Calculate Nihao swap
        transaction_value = eua_volume * eua_price
        nihao_fee = transaction_value * 0.015  # 1.5% intermediation fee
        nihao_execution = "48 hours"
        
        # Calculate benefits
        wfoe_savings = wfoe_setup
        time_value = 0.05 * transaction_value if not has_china_ops else 0.01 * transaction_value  # Time value of money
        cbam_optimization = 0
        
        if use_case == 'cbam':
            # CBAM optimization: estimate €40/ton savings
            cea_volume = eua_volume * swap_ratio
            cbam_optimization = cea_volume * 40  # €40 per ton
        
        total_savings = wfoe_savings + time_value - nihao_fee + cbam_optimization
        savings_percentage = (total_savings / transaction_value * 100) if transaction_value > 0 else 0
        
        result = {
            'directSwapCosts': {
                'wfoeSetup': round(wfoe_setup, 2),
                'timeToMarket': time_to_market,
                'capitalControlsRisk': capital_controls_risk,
                'fxExposure': round(fx_exposure, 2)
            },
            'nihaoSwap': {
                'fee': round(nihao_fee, 2),
                'executionTime': nihao_execution,
                'noWfoeNeeded': True,
                'noCapitalControls': True
            },
            'benefits': {
                'wfoeSavings': round(wfoe_savings, 2),
                'timeSavings': f"{'5-11 months' if not has_china_ops else '2-4 weeks'} faster",
                'riskReduction': 'Eliminated capital controls and FX exposure',
                'cbamOptimization': round(cbam_optimization, 2) if use_case == 'cbam' else None
            },
            'totalSavings': round(total_savings, 2),
            'savingsPercentage': round(savings_percentage, 2)
        }
        
        # Remove None values from benefits
        result['benefits'] = {k: v for k, v in result['benefits'].items() if v is not None}
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error calculating buyer swap scenario: {e}", exc_info=True)
        return standard_error_response('Failed to calculate scenario', 'CALCULATION_ERROR', 500)


@calculator_bp.route('/scenarios', methods=['POST'])
@require_auth
def save_scenario():
    """
    Save a calculated scenario for the user.
    
    Request Body:
        {
            "scenarioType": "seller_cea" | "buyer_swap" (required),
            "inputData": object (required),
            "results": object (required)
        }
    
    Response:
        {
            "scenarioId": string,
            "savedAt": string
        }
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        if not data:
            return standard_error_response('Request body is required', 'MISSING_BODY', 400)
        
        scenario_type = data.get('scenarioType')
        input_data = data.get('inputData')
        results = data.get('results')
        
        if not scenario_type:
            return standard_error_response('scenarioType is required', 'MISSING_SCENARIO_TYPE', 400)
        if scenario_type not in ['seller_cea', 'buyer_swap']:
            return standard_error_response('Invalid scenarioType', 'INVALID_SCENARIO_TYPE', 400)
        if input_data is None:
            return standard_error_response('inputData is required', 'MISSING_INPUT_DATA', 400)
        if results is None:
            return standard_error_response('results is required', 'MISSING_RESULTS', 400)
        
        # Calculate savings from results
        savings = 0.0
        if isinstance(results, dict):
            savings = results.get('totalSavings', 0.0) or 0.0
        
        # Extract benefits and costs from results
        nihao_benefits = results.get('nihaoOffer', {}) if isinstance(results, dict) else {}
        alternative_costs = results.get('shanghaiAlternative', {}) if isinstance(results, dict) else {}
        if not isinstance(results, dict):
            nihao_benefits = {}
            alternative_costs = {}
        
        # Create scenario record
        scenario_id = generate_uuid()
        created_at = datetime.now()
        
        scenario = ValueScenario(
            id=scenario_id,
            user_id=user_id,
            scenario_type=scenario_type,
            input_data=json.dumps(input_data),
            nihao_benefits=json.dumps(nihao_benefits),
            alternative_costs=json.dumps(alternative_costs),
            savings=float(savings),
            created_at=created_at
        )
        
        db.session.add(scenario)
        db.session.commit()
        
        return jsonify({
            'scenarioId': scenario_id,
            'savedAt': created_at.isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error saving scenario: {e}", exc_info=True)
        return standard_error_response('Failed to save scenario', 'SAVE_ERROR', 500)


@calculator_bp.route('/scenarios', methods=['GET'])
@require_auth
def list_scenarios():
    """
    List saved scenarios for the user.
    
    Response:
        {
            "scenarios": [
                {
                    "id": string,
                    "scenarioType": string,
                    "inputData": object,
                    "nihaoBenefits": object,
                    "alternativeCosts": object,
                    "savings": number,
                    "createdAt": string
                }
            ]
        }
    """
    try:
        user_id = request.user_id
        
        # Query scenarios for this user
        scenarios = ValueScenario.query.filter_by(user_id=user_id).order_by(ValueScenario.created_at.desc()).all()
        
        scenarios_data = []
        for scenario in scenarios:
            try:
                scenarios_data.append({
                    'id': scenario.id,
                    'scenarioType': scenario.scenario_type,
                    'inputData': json.loads(scenario.input_data),
                    'nihaoBenefits': json.loads(scenario.nihao_benefits),
                    'alternativeCosts': json.loads(scenario.alternative_costs),
                    'savings': scenario.savings,
                    'createdAt': scenario.created_at.isoformat() if scenario.created_at else None
                })
            except (json.JSONDecodeError, AttributeError) as e:
                logger.warning(f"Error parsing scenario {scenario.id}: {e}")
                continue
        
        return jsonify({
            'scenarios': scenarios_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing scenarios: {e}", exc_info=True)
        return standard_error_response('Failed to list scenarios', 'LIST_ERROR', 500)

