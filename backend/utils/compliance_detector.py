"""
Compliance Period Detection Utility for China ETS

Detects compliance periods and market conditions for China ETS trading.
China ETS compliance deadline: December 31 each year
"""

from datetime import datetime, date
from typing import Optional


class ComplianceDetector:
    """
    Detects compliance periods for China ETS.
    
    China ETS compliance deadline: December 31 each year
    Panic period: October-December (high volume, price volatility)
    Off-season: January-September (low volume, stable prices)
    """
    
    @staticmethod
    def is_compliance_period(check_date: Optional[date] = None) -> bool:
        """
        Check if current date is within compliance period (Oct-Dec)
        
        Args:
            check_date: Date to check (defaults to today)
            
        Returns:
            True if date is in compliance period (Oct-Dec), False otherwise
        """
        if check_date is None:
            check_date = datetime.now().date()
        return check_date.month >= 10
    
    @staticmethod
    def days_until_deadline(check_date: Optional[date] = None) -> int:
        """
        Calculate days until December 31 compliance deadline
        
        Args:
            check_date: Date to check from (defaults to today)
            
        Returns:
            Number of days until December 31 deadline
        """
        if check_date is None:
            check_date = datetime.now().date()
        current_year = check_date.year
        deadline = date(current_year, 12, 31)
        days_until = (deadline - check_date).days
        
        # If deadline has passed this year, calculate for next year
        if days_until < 0:
            deadline = date(current_year + 1, 12, 31)
            days_until = (deadline - check_date).days
        
        return days_until
    
    @staticmethod
    def get_market_condition(check_date: Optional[date] = None) -> str:
        """
        Get market condition based on compliance timing
        
        Args:
            check_date: Date to check (defaults to today)
            
        Returns:
            Market condition: 'panic', 'compliance', or 'normal'
        """
        if check_date is None:
            check_date = datetime.now().date()
        
        days_until = ComplianceDetector.days_until_deadline(check_date)
        
        if days_until <= 30:
            return 'panic'  # Last month before deadline
        elif days_until <= 90:
            return 'compliance'  # Q4 compliance period
        else:
            return 'normal'  # Off-season

