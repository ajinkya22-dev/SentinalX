"""
Wazuh Integration Service
Handles communication with Wazuh API for security event monitoring,
agent management, and alert retrieval.
"""

import os
import requests
import logging
from typing import Dict, List, Optional
from requests.auth import HTTPBasicAuth
import urllib3

# Suppress SSL warnings if SSL verification is disabled
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)


class WazuhService:
    """Service class for interacting with Wazuh API"""
    
    def __init__(self):
        self.api_url = os.getenv('WAZUH_API_URL', 'https://localhost:55000')
        self.api_user = os.getenv('WAZUH_API_USER', 'wazuh')
        self.api_password = os.getenv('WAZUH_API_PASSWORD', '')
        # Check both possible typo variants
        verify_ssl_str = os.getenv('WAZUH_VERIFY_SSL') or os.getenv('WAZUH_VERIFY_SSL', 'false')
        self.verify_ssl = verify_ssl_str.lower() == 'true'
        self.token = None
        
        logger.info(f"Wazuh Service initialized: URL={self.api_url}, User={self.api_user}, SSL={self.verify_ssl}")
        
        if not self.api_password:
            logger.warning("Wazuh API password not configured. Service will not function.")
            logger.warning("Wazuh API password not configured. Service will not function.")
    
    def _get_token(self) -> Optional[str]:
        """Authenticate and retrieve JWT token from Wazuh API"""
        if not self.api_password:
            logger.error("Wazuh API password not configured")
            return None
            
        try:
            auth_url = f"{self.api_url}/security/user/authenticate"
            response = requests.post(
                auth_url,
                auth=HTTPBasicAuth(self.api_user, self.api_password),
                verify=self.verify_ssl,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            self.token = data.get('data', {}).get('token')
            logger.info("Successfully authenticated with Wazuh API")
            return self.token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to authenticate with Wazuh API: {str(e)}")
            return None
    
    def _make_request(self, endpoint: str, method: str = 'GET', params: Optional[Dict] = None) -> Optional[Dict]:
        """Make authenticated request to Wazuh API"""
        if not self.token:
            self.token = self._get_token()
            
        if not self.token:
            return {"error": "Authentication failed", "data": []}
        
        try:
            headers = {
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
            
            url = f"{self.api_url}{endpoint}"
            response = requests.request(
                method,
                url,
                headers=headers,
                params=params,
                verify=self.verify_ssl,
                timeout=15
            )
            
            # Token expired, retry with new token
            if response.status_code == 401:
                logger.info("Token expired, re-authenticating...")
                self.token = self._get_token()
                if self.token:
                    headers['Authorization'] = f'Bearer {self.token}'
                    response = requests.request(
                        method,
                        url,
                        headers=headers,
                        params=params,
                        verify=self.verify_ssl,
                        timeout=15
                    )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Wazuh API request failed: {str(e)}")
            return {"error": str(e), "data": []}
    
    def get_agents(self, limit: int = 100) -> List[Dict]:
        """Get list of Wazuh agents"""
        result = self._make_request('/agents', params={'limit': limit})
        if result and 'data' in result:
            data = result['data']
            # Handle case where data might be a list or dict
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return data.get('affected_items', [])
        return []
    
    def get_agent_details(self, agent_id: str) -> Optional[Dict]:
        """Get detailed information about a specific agent"""
        result = self._make_request(f'/agents/{agent_id}')
        if result and 'data' in result:
            data = result['data']
            if isinstance(data, list):
                return data[0] if data else None
            elif isinstance(data, dict):
                items = data.get('affected_items', [])
                return items[0] if items else None
        return None
    
    def get_alerts(self, limit: int = 100, offset: int = 0, severity: Optional[str] = None) -> List[Dict]:
        """
        Get alerts from Wazuh
        
        Args:
            limit: Maximum number of alerts to retrieve
            offset: Offset for pagination
            severity: Filter by severity level (low, medium, high, critical)
        """
        params = {
            'limit': limit,
            'offset': offset,
            'sort': '-timestamp'
        }
        
        if severity:
            # Map severity to Wazuh rule levels
            severity_map = {
                'low': '0-4',
                'medium': '5-7',
                'high': '8-11',
                'critical': '12-15'
            }
            params['rule.level'] = severity_map.get(severity.lower(), '0-15')
        
        result = self._make_request('/alerts', params=params)
        if result and 'data' in result:
            return result['data'].get('affected_items', [])
        return []
    
    def get_security_events(self, limit: int = 100) -> List[Dict]:
        """Get recent security events from Wazuh"""
        result = self._make_request('/security/events', params={'limit': limit})
        if result and 'data' in result:
            return result['data'].get('affected_items', [])
        return []
    
    def get_fim_events(self, agent_id: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """
        Get File Integrity Monitoring events
        
        Args:
            agent_id: Specific agent ID (optional)
            limit: Maximum number of events
        """
        params = {'limit': limit}
        
        endpoint = '/syscheck' if not agent_id else f'/syscheck/{agent_id}'
        result = self._make_request(endpoint, params=params)
        
        if result and 'data' in result:
            return result['data'].get('affected_items', [])
        return []
    
    def get_vulnerability_detector(self, agent_id: Optional[str] = None) -> List[Dict]:
        """Get vulnerability information from agents"""
        endpoint = '/vulnerability' if not agent_id else f'/vulnerability/{agent_id}'
        result = self._make_request(endpoint)
        
        if result and 'data' in result:
            return result['data'].get('affected_items', [])
        return []
    
    def get_rule_info(self, rule_id: str) -> Optional[Dict]:
        """Get information about a specific Wazuh rule"""
        result = self._make_request(f'/rules/{rule_id}')
        if result and 'data' in result:
            items = result['data'].get('affected_items', [])
            return items[0] if items else None
        return None
    
    def get_mitre_attack_info(self) -> List[Dict]:
        """Get MITRE ATT&CK framework mappings from Wazuh"""
        result = self._make_request('/mitre')
        if result and 'data' in result:
            return result['data'].get('affected_items', [])
        return []
    
    def health_check(self) -> Dict:
        """Check Wazuh service health"""
        try:
            result = self._make_request('/')
            if result and not result.get('error'):
                return {
                    'status': 'healthy',
                    'message': 'Wazuh API is responsive',
                    'configured': bool(self.api_password)
                }
            else:
                return {
                    'status': 'unhealthy',
                    'message': result.get('error', 'Unknown error') if result else 'Unknown error',
                    'configured': bool(self.api_password)
                }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
                'configured': bool(self.api_password)
            }


# Singleton instance
wazuh_service = WazuhService()
