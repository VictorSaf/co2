"""
Appropriateness Assessment Service
Evaluates client appropriateness for trading carbon certificates
"""
from typing import Dict, Any
from datetime import datetime


class AppropriatenessAssessor:
    """
    Service for assessing client appropriateness for trading financial instruments
    Implements MiFID II appropriateness assessment requirements
    """
    
    # Minimum knowledge score required for approval (70%)
    MIN_KNOWLEDGE_SCORE = 70
    
    # Minimum knowledge score for approval with education (50%)
    MIN_KNOWLEDGE_SCORE_WITH_EDUCATION = 50
    
    @staticmethod
    def assess_appropriateness(
        user_data: Dict[str, Any],
        knowledge_test: Dict[str, Any],
        experience_declaration: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Assess appropriateness based on knowledge test and experience
        Returns: {
            'status': 'approved' | 'approved_with_education' | 'needs_education' | 'rejected',
            'level': 'full_access' | 'limited_access' | 'no_access',
            'knowledge_score': float (0-100),
            'has_experience': bool,
            'recommendations': List[str],
            'assessed_at': datetime
        }
        """
        # Calculate knowledge score
        correct_answers = knowledge_test.get('correct_answers', 0)
        total_questions = knowledge_test.get('total_questions', 1)
        knowledge_score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        
        # Check experience
        has_experience = (
            experience_declaration.get('has_traded_carbon_certificates', False) or
            experience_declaration.get('has_traded_similar_products', False) or
            experience_declaration.get('has_financial_experience', False)
        )
        
        recommendations = []
        status = 'rejected'
        level = 'no_access'
        
        # Evaluate based on knowledge and experience
        if knowledge_score >= AppropriatenessAssessor.MIN_KNOWLEDGE_SCORE:
            if has_experience:
                status = 'approved'
                level = 'full_access'
                recommendations.append('You have been approved for full access to carbon certificate trading')
            else:
                status = 'approved_with_education'
                level = 'limited_access'
                recommendations.append('You have been approved but with limited access. Please complete educational materials.')
                recommendations.append('Consider starting with smaller positions until you gain more experience')
        elif knowledge_score >= AppropriatenessAssessor.MIN_KNOWLEDGE_SCORE_WITH_EDUCATION:
            status = 'needs_education'
            level = 'no_access'
            recommendations.append('Your knowledge score is below the minimum threshold')
            recommendations.append('Please complete our educational resources on carbon certificate trading')
            recommendations.append('You can retake the knowledge test after completing the education')
        else:
            status = 'rejected'
            level = 'no_access'
            recommendations.append('Your knowledge score is too low for trading carbon certificates')
            recommendations.append('Please complete comprehensive education on carbon markets and EU ETS')
            recommendations.append('Contact our support team for guidance on improving your knowledge')
        
        return {
            'status': status,
            'level': level,
            'knowledge_score': round(knowledge_score, 2),
            'has_experience': has_experience,
            'correct_answers': correct_answers,
            'total_questions': total_questions,
            'recommendations': recommendations,
            'assessed_at': datetime.utcnow().isoformat()
        }
    
    @staticmethod
    def generate_knowledge_questions() -> list:
        """
        Generate knowledge test questions for appropriateness assessment
        Returns: List of question dictionaries
        """
        return [
            {
                'id': 1,
                'question': 'What is the difference between EUA and CEA certificates?',
                'options': [
                    'EUA are European certificates ready for surrender, CEA are Chinese certificates that need conversion',
                    'EUA and CEA are the same thing',
                    'CEA are European certificates, EUA are Chinese',
                    'There is no difference'
                ],
                'correct_answer': 0,
                'explanation': 'EUA (European Union Allowances) are European certificates ready for surrender. CEA (China ETS Allowances) are Chinese certificates that need conversion to EUA before surrender.'
            },
            {
                'id': 2,
                'question': 'What is the EU ETS Registry?',
                'options': [
                    'A trading platform for carbon certificates',
                    'A national registry where carbon certificates are held and tracked',
                    'A government agency',
                    'A type of certificate'
                ],
                'correct_answer': 1,
                'explanation': 'The EU ETS Registry is a national registry system where carbon certificates are held and tracked. Each EU member state has its own registry.'
            },
            {
                'id': 3,
                'question': 'What is the main risk associated with carbon certificate trading?',
                'options': [
                    'Price volatility',
                    'Certificate loss',
                    'Regulatory changes',
                    'All of the above'
                ],
                'correct_answer': 3,
                'explanation': 'Carbon certificate trading involves multiple risks including price volatility, certificate management, and regulatory changes.'
            },
            {
                'id': 4,
                'question': 'When must companies surrender carbon certificates?',
                'options': [
                    'At the end of each calendar year',
                    'At the end of each compliance period (typically 3 years)',
                    'Only when they want to',
                    'Never'
                ],
                'correct_answer': 1,
                'explanation': 'Companies must surrender carbon certificates at the end of each compliance period, which is typically 3 years in the EU ETS.'
            },
            {
                'id': 5,
                'question': 'What happens if a company does not surrender enough certificates?',
                'options': [
                    'Nothing',
                    'They receive a warning',
                    'They face financial penalties and must still surrender certificates',
                    'They get a discount'
                ],
                'correct_answer': 2,
                'explanation': 'Companies that fail to surrender enough certificates face significant financial penalties and must still surrender the required amount.'
            },
            {
                'id': 6,
                'question': 'Can CEA certificates be directly surrendered for compliance?',
                'options': [
                    'Yes, always',
                    'No, they must be converted to EUA first',
                    'Only in some countries',
                    'Only for small amounts'
                ],
                'correct_answer': 1,
                'explanation': 'CEA certificates must be converted to EUA certificates before they can be surrendered for compliance in the EU ETS.'
            },
            {
                'id': 7,
                'question': 'What factors influence carbon certificate prices?',
                'options': [
                    'Supply and demand',
                    'Regulatory changes',
                    'Economic conditions',
                    'All of the above'
                ],
                'correct_answer': 3,
                'explanation': 'Carbon certificate prices are influenced by multiple factors including supply and demand, regulatory changes, and economic conditions.'
            },
            {
                'id': 8,
                'question': 'What is the purpose of the EU ETS?',
                'options': [
                    'To generate revenue for governments',
                    'To reduce greenhouse gas emissions by creating a market for carbon allowances',
                    'To promote renewable energy',
                    'To tax companies'
                ],
                'correct_answer': 1,
                'explanation': 'The EU ETS is a cap-and-trade system designed to reduce greenhouse gas emissions by creating a market for carbon allowances.'
            },
            {
                'id': 9,
                'question': 'What is the minimum knowledge score required for trading approval?',
                'options': [
                    '50%',
                    '60%',
                    '70%',
                    '80%'
                ],
                'correct_answer': 2,
                'explanation': 'A minimum knowledge score of 70% is required for full trading approval.'
            },
            {
                'id': 10,
                'question': 'Can you trade carbon certificates without an EU ETS Registry account?',
                'options': [
                    'Yes, always',
                    'No, you need a registry account to hold and transfer certificates',
                    'Only for small amounts',
                    'Only for CEA certificates'
                ],
                'correct_answer': 1,
                'explanation': 'An EU ETS Registry account is required to hold and transfer carbon certificates. Trading without a registry account is not possible.'
            }
        ]

