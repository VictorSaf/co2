"""
Swap Calculator Service

Calculates EUA:CEA swap ratios and swap-related benefits.
"""

from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class SwapCalculator:
    """
    Calculate EUA:CEA swap ratios and swap-related calculations.
    
    Base ratio: eua_price / cea_price (typically ~11:1)
    Adjustments:
    - Market liquidity premium: +0.1-0.3
    - Compliance timing: +0.2-0.5 during compliance periods
    - Volume discounts: -0.1-0.2 for large volumes
    """
    
    def __init__(self):
        """Initialize swap calculator"""
        pass
    
    def calculate_swap_ratio(
        self,
        eua_price: float,
        cea_price: float,
        market_conditions: Optional[Dict] = None
    ) -> float:
        """
        Calculate EUA:CEA swap ratio.
        
        Args:
            eua_price: Current EUA price in EUR
            cea_price: Current CEA price in EUR
            market_conditions: Optional dict with:
                - liquidity_premium: float (0.0-0.3, default 0.1)
                - compliance_adjustment: float (0.0-0.5, default 0.0)
                - volume_discount: float (0.0-0.2, default 0.0)
        
        Returns:
            Swap ratio (e.g., 10.5 means 1 EUA = 10.5 CEA)
        """
        if cea_price <= 0:
            logger.warning(f"Invalid CEA price: {cea_price}")
            return 0.0
        
        if eua_price <= 0:
            logger.warning(f"Invalid EUA price: {eua_price}")
            return 0.0
        
        # Base ratio: eua_price / cea_price (typically ~11:1)
        base_ratio = eua_price / cea_price
        
        # Default market conditions
        if market_conditions is None:
            market_conditions = {}
        
        # Apply market condition adjustments
        liquidity_adjustment = market_conditions.get('liquidity_premium', 0.1)
        compliance_adjustment = market_conditions.get('compliance_adjustment', 0.0)
        volume_adjustment = market_conditions.get('volume_discount', 0.0)
        
        # Clamp adjustments to reasonable ranges
        liquidity_adjustment = max(0.0, min(0.3, liquidity_adjustment))
        compliance_adjustment = max(0.0, min(0.5, compliance_adjustment))
        volume_adjustment = max(0.0, min(0.2, volume_adjustment))
        
        # Calculate final ratio
        final_ratio = base_ratio + liquidity_adjustment + compliance_adjustment - volume_adjustment
        
        # Ensure ratio is positive and reasonable (typically 8-15)
        final_ratio = max(1.0, min(20.0, final_ratio))
        
        return round(final_ratio, 2)
    
    def calculate_swap_value(
        self,
        eua_volume: float,
        eua_price: float,
        swap_ratio: float
    ) -> Dict:
        """
        Calculate swap value and equivalent CEA volume.
        
        Args:
            eua_volume: Volume of EUA to swap
            eua_price: Current EUA price
            swap_ratio: EUA:CEA swap ratio
        
        Returns:
            Dict with:
                - eua_value: Total EUA value in EUR
                - cea_volume: Equivalent CEA volume
                - cea_value: Equivalent CEA value in EUR
                - value_difference: Difference between EUA and CEA values
        """
        eua_value = eua_volume * eua_price
        cea_volume = eua_volume * swap_ratio
        cea_price = eua_price / swap_ratio
        cea_value = cea_volume * cea_price
        value_difference = eua_value - cea_value
        
        return {
            'eua_value': round(eua_value, 2),
            'cea_volume': round(cea_volume, 2),
            'cea_value': round(cea_value, 2),
            'value_difference': round(value_difference, 2),
            'swap_ratio': swap_ratio
        }

