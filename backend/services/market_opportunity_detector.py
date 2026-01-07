"""
Market Opportunity Detector Service

Detects arbitrage opportunities and market conditions for trading.
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

from utils.compliance_detector import ComplianceDetector
from services.swap_calculator import SwapCalculator

logger = logging.getLogger(__name__)


class MarketOpportunityDetector:
    """
    Detect market opportunities for arbitrage and swap optimization.
    
    Detects:
    - Arbitrage opportunities (price gaps)
    - Liquidity crisis periods
    - Swap optimization opportunities
    """
    
    def __init__(self):
        """Initialize market opportunity detector"""
        self.compliance_detector = ComplianceDetector()
        self.swap_calculator = SwapCalculator()
    
    def detect_arbitrage_opportunities(
        self,
        eua_price: float,
        cea_price: float,
        min_price_gap: float = 10.0
    ) -> List[Dict]:
        """
        Detect arbitrage opportunities based on price gap.
        
        Args:
            eua_price: Current EUA price in EUR
            cea_price: Current CEA price in EUR
            min_price_gap: Minimum price gap ratio to consider (default 10.0)
            
        Returns:
            List of opportunity dicts with:
                - type: 'arbitrage'
                - description: Opportunity description
                - potential_savings: Estimated savings
                - swap_ratio: Recommended swap ratio
                - action: Recommended action
        """
        opportunities = []
        
        if cea_price <= 0 or eua_price <= 0:
            return opportunities
        
        price_gap = eua_price / cea_price
        
        if price_gap >= min_price_gap:
            # Calculate swap ratio
            market_conditions = {
                'liquidity_premium': 0.1,
                'compliance_adjustment': 0.2 if self.compliance_detector.is_compliance_period() else 0.0,
                'volume_discount': 0.0
            }
            swap_ratio = self.swap_calculator.calculate_swap_ratio(
                eua_price, cea_price, market_conditions
            )
            
            # Estimate potential savings (5-10% of transaction value)
            potential_savings_pct = 0.075  # 7.5% average
            
            opportunities.append({
                'type': 'arbitrage',
                'description': f'Price gap {price_gap:.1f}x - swap opportunity',
                'potential_savings': f'{potential_savings_pct * 100:.1f}% of transaction value',
                'swap_ratio': swap_ratio,
                'action': 'Swap EUA → CEA for diversification',
                'price_gap': round(price_gap, 2),
                'eua_price': round(eua_price, 2),
                'cea_price': round(cea_price, 2)
            })
        
        return opportunities
    
    def detect_liquidity_crisis(self) -> List[Dict]:
        """
        Detect liquidity crisis periods (compliance deadline approaching).
        
        Returns:
            List of opportunity dicts with:
                - type: 'liquidity_crisis'
                - description: Crisis description
                - potential_savings: Premium for buyers
                - action: Recommended action
                - expires_at: When opportunity expires
        """
        opportunities = []
        
        market_condition = self.compliance_detector.get_market_condition()
        days_until = self.compliance_detector.days_until_deadline()
        
        if market_condition == 'panic' and days_until <= 30:
            # Panic selling period - buyers can get premium
            expires_at = datetime.now() + timedelta(days=days_until)
            
            opportunities.append({
                'type': 'liquidity_crisis',
                'description': 'Banking deadline approaching - panic selling expected',
                'potential_savings': '10-20% premium for buyers',
                'action': 'Buy CEA now before panic',
                'expires_at': expires_at.isoformat(),
                'days_until_deadline': days_until,
                'market_condition': market_condition
            })
        
        return opportunities
    
    def detect_swap_optimization(
        self,
        eua_price: float,
        cea_price: float
    ) -> List[Dict]:
        """
        Detect swap optimization opportunities.
        
        Args:
            eua_price: Current EUA price
            cea_price: Current CEA price
            
        Returns:
            List of opportunity dicts with swap recommendations
        """
        opportunities = []
        
        if cea_price <= 0 or eua_price <= 0:
            return opportunities
        
        # Check if we're in compliance period (better swap ratios)
        is_compliance = self.compliance_detector.is_compliance_period()
        
        if is_compliance:
            market_conditions = {
                'liquidity_premium': 0.15,
                'compliance_adjustment': 0.3,
                'volume_discount': 0.0
            }
            
            swap_ratio = self.swap_calculator.calculate_swap_ratio(
                eua_price, cea_price, market_conditions
            )
            
            opportunities.append({
                'type': 'swap_optimization',
                'description': 'Compliance period - improved swap ratios available',
                'potential_savings': '5-10% better ratio vs off-season',
                'swap_ratio': swap_ratio,
                'action': 'Execute swap during compliance period for better terms',
                'market_condition': 'compliance'
            })
        
        return opportunities
    
    def detect_all_opportunities(
        self,
        eua_price: Optional[float] = None,
        cea_price: Optional[float] = None
    ) -> List[Dict]:
        """
        Detect all market opportunities.
        
        Args:
            eua_price: Current EUA price (optional, will fetch if not provided)
            cea_price: Current CEA price (optional, will fetch if not provided)
            
        Returns:
            Combined list of all detected opportunities
        """
        opportunities = []
        
        # Detect liquidity crisis (doesn't need prices)
        opportunities.extend(self.detect_liquidity_crisis())
        
        # Detect arbitrage and swap optimization (needs prices)
        if eua_price is not None and cea_price is not None:
            opportunities.extend(self.detect_arbitrage_opportunities(eua_price, cea_price))
            opportunities.extend(self.detect_swap_optimization(eua_price, cea_price))
        
        return opportunities

