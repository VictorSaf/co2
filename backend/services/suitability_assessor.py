"""
Suitability Assessment Service
Evaluates client suitability for carbon certificate trading products
"""
from typing import Dict, Any
from datetime import datetime


class SuitabilityAssessor:
    """
    Service for assessing client suitability for investment products
    Implements MiFID II suitability assessment requirements
    """
    
    @staticmethod
    def assess_suitability(
        user_data: Dict[str, Any],
        objectives: str,
        risk_tolerance: str,
        experience: str,
        knowledge_score: float
    ) -> Dict[str, Any]:
        """
        Assess suitability based on client profile
        Returns: {
            'suitable': bool,
            'level': 'suitable' | 'suitable_with_warnings' | 'not_suitable',
            'score': int (0-100),
            'recommendations': List[str],
            'warnings': List[str],
            'assessed_at': datetime
        }
        """
        score = 0
        recommendations = []
        warnings = []
        
        # Evaluate objectives (0-30 points)
        if objectives == 'compliance':
            score += 30
            recommendations.append('Carbon certificates are ideal for compliance purposes')
        elif objectives == 'hedging':
            score += 25
            recommendations.append('Carbon certificates can be used for hedging emissions risk')
        elif objectives == 'investment':
            score += 20
            warnings.append('Carbon certificates are primarily compliance instruments, not investment products')
        
        # Evaluate risk tolerance (0-25 points)
        if risk_tolerance == 'conservative':
            score += 15
            warnings.append('Carbon certificate prices can be volatile. Consider your risk tolerance.')
        elif risk_tolerance == 'moderate':
            score += 25
        elif risk_tolerance == 'aggressive':
            score += 20
            warnings.append('High risk tolerance may lead to significant losses')
        
        # Evaluate experience (0-25 points)
        if experience == 'advanced':
            score += 25
        elif experience == 'intermediate':
            score += 20
            recommendations.append('Consider starting with smaller positions until you gain more experience')
        elif experience == 'beginner':
            score += 10
            warnings.append('Limited trading experience. Please ensure you understand the risks.')
            recommendations.append('We recommend starting with small positions and gradually increasing exposure')
        
        # Evaluate knowledge (0-20 points)
        knowledge_points = int(knowledge_score * 0.2)
        score += knowledge_points
        
        if knowledge_score < 50:
            warnings.append('Low knowledge score. Please review educational materials before trading.')
            recommendations.append('Complete our educational resources on carbon certificate trading')
        elif knowledge_score < 70:
            warnings.append('Moderate knowledge score. Consider additional education.')
        
        # Determine suitability level
        if score >= 70:
            level = 'suitable'
            suitable = True
        elif score >= 50:
            level = 'suitable_with_warnings'
            suitable = True
        else:
            level = 'not_suitable'
            suitable = False
            warnings.append('Overall suitability score is below minimum threshold')
            recommendations.append('Please improve your knowledge and experience before trading')
        
        return {
            'suitable': suitable,
            'level': level,
            'score': score,
            'recommendations': recommendations,
            'warnings': warnings,
            'objectives_score': 30 if objectives == 'compliance' else (25 if objectives == 'hedging' else 20),
            'risk_tolerance_score': 15 if risk_tolerance == 'conservative' else (25 if risk_tolerance == 'moderate' else 20),
            'experience_score': 25 if experience == 'advanced' else (20 if experience == 'intermediate' else 10),
            'knowledge_score': knowledge_points,
            'assessed_at': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def get_product_recommendations(suitability_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get product recommendations based on suitability assessment
        Returns: {
            'recommended_products': List[str],
            'not_recommended_products': List[str],
            'reasoning': str
        }
        """
        level = suitability_result.get('level', 'not_suitable')
        score = suitability_result.get('score', 0)
        
        recommended = []
        not_recommended = []
        
        if level == 'suitable':
            recommended = ['EUA', 'CEA']
            reasoning = 'Client is suitable for all carbon certificate products'
        elif level == 'suitable_with_warnings':
            recommended = ['EUA']  # EUA is more straightforward
            not_recommended = ['CEA']  # CEA requires conversion, more complex
            reasoning = 'Client is suitable for EUA certificates. CEA certificates require additional understanding of conversion process.'
        else:
            not_recommended = ['EUA', 'CEA']
            reasoning = 'Client is not suitable for carbon certificate trading at this time. Additional education and experience required.'
        
        return {
            'recommended_products': recommended,
            'not_recommended_products': not_recommended,
            'reasoning': reasoning
        }

