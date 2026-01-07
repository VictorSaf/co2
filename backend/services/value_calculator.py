"""
Value Calculator Service

Calculates benefits for CEA sellers comparing Nihao vs Shanghai Exchange alternatives.
"""

from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class ValueCalculatorService:
    """
    Calculate value and benefits for CEA sellers.
    
    Compares Nihao offer vs Shanghai Exchange alternative with:
    - Price premium/discount analysis
    - Execution time comparison
    - Market impact assessment
    - Confidentiality benefits
    - FX flexibility
    """
    
    def __init__(self):
        """Initialize value calculator"""
        pass
    
    def calculate_market_impact(self, volume: float) -> float:
        """
        Calculate market impact percentage for Shanghai Exchange.
        
        Market impact increases with volume:
        - Small volumes (< 500k): 5-10%
        - Medium volumes (500k-2M): 10-20%
        - Large volumes (> 2M): 20-30%
        
        Args:
            volume: Volume in tons
            
        Returns:
            Market impact as percentage (0.05-0.30)
        """
        if volume < 500000:
            # Small volumes: 5-10% impact
            return 0.075  # Average 7.5%
        elif volume < 2000000:
            # Medium volumes: 10-20% impact
            return 0.15  # Average 15%
        else:
            # Large volumes: 20-30% impact
            return 0.25  # Average 25%
    
    def calculate_execution_time(self, volume: float, urgency: str) -> str:
        """
        Calculate execution time for Shanghai Exchange.
        
        Args:
            volume: Volume in tons
            urgency: 'normal', 'urgent', or 'panic'
            
        Returns:
            Execution time string (e.g., "2-4 weeks")
        """
        base_weeks = 2 if volume < 1000000 else 3
        
        if urgency == 'panic':
            # Panic selling: faster but higher impact
            return f"{base_weeks}-{base_weeks + 1} weeks"
        elif urgency == 'urgent':
            return f"{base_weeks + 1}-{base_weeks + 2} weeks"
        else:
            return f"{base_weeks + 1}-{base_weeks + 3} weeks"
    
    def calculate_seller_benefits(
        self,
        volume: float,
        current_price: float,
        urgency: str = 'normal',
        confidentiality: bool = False,
        fx_preference: Optional[str] = None
    ) -> Dict:
        """
        Calculate benefits for CEA seller comparing Nihao vs Shanghai Exchange.
        
        Args:
            volume: Volume in tons
            current_price: Current CEA market price in EUR
            urgency: 'normal', 'urgent', or 'panic'
            confidentiality: Whether confidentiality is important
            fx_preference: 'RMB', 'EUR', 'USD', or None
            
        Returns:
            Dict with:
                - nihao_offer: Price, execution time, total value
                - shanghai_alternative: Price, execution time, total value, market impact
                - benefits: Liquidity, price premium, time savings, confidentiality, FX flexibility
                - total_savings: Total savings in EUR
                - savings_percentage: Savings as percentage
        """
        # Calculate Shanghai alternative
        market_impact = self.calculate_market_impact(volume)
        shanghai_price = current_price * (1 - market_impact)
        shanghai_execution_time = self.calculate_execution_time(volume, urgency)
        shanghai_total = shanghai_price * volume
        
        # Calculate Nihao offer
        # Nihao discount: 2-3% (better than Shanghai's 10-30% impact)
        nihao_discount = 0.02 if urgency == 'normal' else 0.03
        nihao_price = current_price * (1 - nihao_discount)
        nihao_execution_time = "48 hours"
        nihao_total = nihao_price * volume
        
        # Calculate benefits
        price_premium = nihao_total - shanghai_total
        time_savings_days = 14 if urgency == 'normal' else 7  # Approximate days saved
        
        # Benefits breakdown
        benefits = {
            'liquidity': f"Instant liquidity vs {shanghai_execution_time}",
            'price_premium': round(price_premium, 2),
            'time_savings': f"{time_savings_days} days faster execution",
            'confidentiality': confidentiality,
            'fx_flexibility': fx_preference is not None and fx_preference != 'RMB'
        }
        
        # Total savings
        total_savings = price_premium
        savings_percentage = (total_savings / shanghai_total * 100) if shanghai_total > 0 else 0
        
        return {
            'nihao_offer': {
                'price': round(nihao_price, 2),
                'execution_time': nihao_execution_time,
                'total_value': round(nihao_total, 2)
            },
            'shanghai_alternative': {
                'price': round(shanghai_price, 2),
                'execution_time': shanghai_execution_time,
                'total_value': round(shanghai_total, 2),
                'market_impact': round(market_impact * 100, 1)  # As percentage
            },
            'benefits': benefits,
            'total_savings': round(total_savings, 2),
            'savings_percentage': round(savings_percentage, 2)
        }

