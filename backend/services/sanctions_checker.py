"""
Sanctions and PEP screening service
Mock implementation - to be replaced with real API integration
"""
from datetime import datetime
from typing import Dict, List, Optional


class SanctionsChecker:
    """
    Service for checking sanctions lists and PEP status
    Currently a mock implementation
    """
    
    # Mock sanctions lists (in production, these would be from external APIs)
    MOCK_SANCTIONS_LIST = [
        # Example entries - in production, this would be from World-Check, Dow Jones, etc.
    ]
    
    # Mock PEP database (in production, this would be from external APIs)
    MOCK_PEP_LIST = [
        # Example entries - in production, this would be from external PEP databases
    ]
    
    @staticmethod
    def check_sanctions(name: str, date_of_birth: Optional[str] = None, 
                       nationality: Optional[str] = None) -> Dict:
        """
        Check if name appears in sanctions lists
        Returns: {
            'sanctions_match': bool,
            'pep_match': bool,
            'risk_level': 'low' | 'medium' | 'high',
            'matches': List[Dict],
            'checked_at': datetime
        }
        """
        results = {
            'sanctions_match': False,
            'pep_match': False,
            'risk_level': 'low',
            'matches': [],
            'checked_at': datetime.utcnow().isoformat()
        }
        
        # Mock implementation - in production, this would call external APIs
        # Examples: World-Check, Dow Jones Risk & Compliance, etc.
        
        # Normalize name for comparison
        normalized_name = name.lower().strip()
        
        # Check against mock sanctions list
        for entry in SanctionsChecker.MOCK_SANCTIONS_LIST:
            if normalized_name in entry.get('name', '').lower():
                results['sanctions_match'] = True
                results['risk_level'] = 'high'
                results['matches'].append({
                    'type': 'sanctions',
                    'source': entry.get('source', 'unknown'),
                    'name': entry.get('name'),
                    'details': entry.get('details')
                })
        
        # Check PEP status
        pep_result = SanctionsChecker.check_pep(name, date_of_birth, nationality)
        if pep_result['is_pep']:
            results['pep_match'] = True
            if results['risk_level'] == 'low':
                results['risk_level'] = 'medium'
            results['matches'].append({
                'type': 'pep',
                'source': pep_result.get('source', 'unknown'),
                'details': pep_result.get('details')
            })
        
        return results
    
    @staticmethod
    def check_pep(name: str, date_of_birth: Optional[str] = None, 
                 nationality: Optional[str] = None) -> Dict:
        """
        Check if person is a Politically Exposed Person (PEP)
        Returns: {
            'is_pep': bool,
            'source': str,
            'details': Dict,
            'checked_at': datetime
        }
        """
        results = {
            'is_pep': False,
            'source': None,
            'details': {},
            'checked_at': datetime.utcnow().isoformat()
        }
        
        # Mock implementation - in production, this would call external PEP databases
        # Examples: World-Check PEP database, Dow Jones PEP database, etc.
        
        normalized_name = name.lower().strip()
        
        # Check against mock PEP list
        for entry in SanctionsChecker.MOCK_PEP_LIST:
            if normalized_name in entry.get('name', '').lower():
                results['is_pep'] = True
                results['source'] = entry.get('source', 'mock_database')
                results['details'] = {
                    'position': entry.get('position'),
                    'country': entry.get('country'),
                    'status': entry.get('status')
                }
                break
        
        return results
    
    @staticmethod
    def check_beneficial_owners(beneficial_owners: List[Dict]) -> Dict:
        """
        Check sanctions and PEP status for beneficial owners
        Returns: {
            'total_checked': int,
            'sanctions_matches': int,
            'pep_matches': int,
            'risk_level': 'low' | 'medium' | 'high',
            'results': List[Dict]
        }
        """
        overall_results = {
            'total_checked': len(beneficial_owners),
            'sanctions_matches': 0,
            'pep_matches': 0,
            'risk_level': 'low',
            'results': []
        }
        
        for owner in beneficial_owners:
            name = owner.get('name', '')
            date_of_birth = owner.get('date_of_birth')
            nationality = owner.get('nationality')
            
            sanctions_result = SanctionsChecker.check_sanctions(
                name, date_of_birth, nationality
            )
            
            owner_result = {
                'name': name,
                'sanctions_match': sanctions_result['sanctions_match'],
                'pep_match': sanctions_result['pep_match'],
                'risk_level': sanctions_result['risk_level']
            }
            
            if sanctions_result['sanctions_match']:
                overall_results['sanctions_matches'] += 1
                overall_results['risk_level'] = 'high'
            
            if sanctions_result['pep_match']:
                overall_results['pep_matches'] += 1
                if overall_results['risk_level'] != 'high':
                    overall_results['risk_level'] = 'medium'
            
            overall_results['results'].append(owner_result)
        
        return overall_results

