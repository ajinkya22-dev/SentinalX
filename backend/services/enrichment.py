"""
Alert Enrichment Service
Enriches Wazuh alerts with threat intelligence data from multiple sources
"""

import logging
import re
from typing import Dict, List, Optional, Set
from backend.services.wazuh import wazuh_service
from backend.services import virustotal, abuseipdb, otx
from backend.database import get_db

logger = logging.getLogger(__name__)


class AlertEnrichmentService:
    """Service for enriching security alerts with threat intelligence"""
    
    def __init__(self):
        self.ip_pattern = re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b')
        self.hash_pattern = re.compile(r'\b[a-fA-F0-9]{32,64}\b')
        self.domain_pattern = re.compile(r'\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b', re.IGNORECASE)
    
    def extract_iocs(self, alert_data: Dict) -> Dict[str, Set[str]]:
        """
        Extract Indicators of Compromise (IOCs) from alert data
        
        Returns:
            Dict with keys: 'ips', 'hashes', 'domains'
        """
        iocs = {
            'ips': set(),
            'hashes': set(),
            'domains': set()
        }
        
        # Convert alert to string for pattern matching
        alert_str = str(alert_data)
        
        # Extract IPs
        ips = self.ip_pattern.findall(alert_str)
        iocs['ips'] = set(ip for ip in ips if self._is_valid_ip(ip))
        
        # Extract file hashes (MD5, SHA1, SHA256)
        hashes = self.hash_pattern.findall(alert_str)
        iocs['hashes'] = set(hashes)
        
        # Extract domains
        domains = self.domain_pattern.findall(alert_str)
        iocs['domains'] = set(d.lower() for d in domains if self._is_valid_domain(d))
        
        # Check specific fields
        if 'data' in alert_data:
            data = alert_data['data']
            if 'srcip' in data:
                iocs['ips'].add(data['srcip'])
            if 'dstip' in data:
                iocs['ips'].add(data['dstip'])
            if 'md5' in data:
                iocs['hashes'].add(data['md5'])
            if 'sha256' in data:
                iocs['hashes'].add(data['sha256'])
        
        return iocs
    
    def _is_valid_ip(self, ip: str) -> bool:
        """Validate IP address and filter private ranges"""
        try:
            octets = [int(x) for x in ip.split('.')]
            if not all(0 <= x <= 255 for x in octets):
                return False
            
            # Filter private and reserved IPs
            if octets[0] in [0, 10, 127, 255]:
                return False
            if octets[0] == 172 and 16 <= octets[1] <= 31:
                return False
            if octets[0] == 192 and octets[1] == 168:
                return False
            
            return True
        except (ValueError, IndexError):
            return False
    
    def _is_valid_domain(self, domain: str) -> bool:
        """Validate domain name"""
        if len(domain) < 4 or len(domain) > 253:
            return False
        if domain.startswith('.') or domain.endswith('.'):
            return False
        # Filter localhost and common false positives
        if domain in ['localhost', 'example.com', 'test.com']:
            return False
        return True
    
    async def enrich_ip(self, ip: str) -> Dict:
        """Enrich IP with threat intelligence"""
        enrichment = {
            'ip': ip,
            'malicious': False,
            'threat_score': 0,
            'sources': {}
        }
        
        try:
            # Check AbuseIPDB
            abuse_data = abuseipdb.lookup_ip(ip)
            if abuse_data and not abuse_data.get('error'):
                enrichment['sources']['abuseipdb'] = {
                    'confidence_score': abuse_data.get('abuseConfidenceScore', 0),
                    'total_reports': abuse_data.get('totalReports', 0)
                }
                
                score = abuse_data.get('abuseConfidenceScore', 0)
                if score and score > 50:
                    enrichment['malicious'] = True
                enrichment['threat_score'] = max(enrichment['threat_score'], score or 0)
        except Exception as e:
            logger.error(f"AbuseIPDB check failed for {ip}: {str(e)}")
        
        try:
            # Check OTX
            otx_data = otx.lookup_ip(ip)
            if otx_data and not otx_data.get('error'):
                pulse_count = otx_data.get('pulseCount', 0)
                enrichment['sources']['otx'] = {
                    'pulse_count': pulse_count
                }
                
                if pulse_count and pulse_count > 0:
                    enrichment['malicious'] = True
                    enrichment['threat_score'] = max(enrichment['threat_score'], 75)
        except Exception as e:
            logger.error(f"OTX check failed for {ip}: {str(e)}")
        
        try:
            # Check VirusTotal
            vt_data = virustotal.lookup_ip(ip)
            if vt_data and not vt_data.get('error'):
                enrichment['sources']['virustotal'] = {
                    'reputation': vt_data.get('reputation', 0)
                }
        except Exception as e:
            logger.error(f"VirusTotal check failed for {ip}: {str(e)}")
        
        return enrichment
    
    async def enrich_hash(self, file_hash: str) -> Dict:
        """Enrich file hash with threat intelligence"""
        enrichment = {
            'hash': file_hash,
            'malicious': False,
            'threat_score': 0,
            'sources': {}
        }
        
        # Note: File hash checking requires VirusTotal premium API
        # For now, return basic structure
        logger.info(f"File hash enrichment not fully implemented for {file_hash}")
        
        return enrichment
    
    async def enrich_domain(self, domain: str) -> Dict:
        """Enrich domain with threat intelligence"""
        enrichment = {
            'domain': domain,
            'malicious': False,
            'threat_score': 0,
            'sources': {}
        }
        
        try:
            # Check VirusTotal
            vt_data = virustotal.lookup_domain(domain)
            if vt_data and not vt_data.get('error'):
                stats = vt_data.get('last_analysis_stats', {})
                if stats:
                    malicious_count = stats.get('malicious', 0)
                    total_engines = sum(stats.values()) if stats.values() else 0
                    
                    enrichment['sources']['virustotal'] = {
                        'malicious': malicious_count,
                        'suspicious': stats.get('suspicious', 0),
                        'total_engines': total_engines,
                        'detection_rate': f"{malicious_count}/{total_engines}" if total_engines > 0 else "0/0"
                    }
                    
                    if malicious_count > 0:
                        enrichment['malicious'] = True
                        if total_engines > 0:
                            detection_percentage = (malicious_count / total_engines) * 100
                            enrichment['threat_score'] = min(100, detection_percentage)
        except Exception as e:
            logger.error(f"VirusTotal check failed for {domain}: {str(e)}")
        
        try:
            # Check OTX
            otx_data = otx.lookup_domain(domain)
            if otx_data and not otx_data.get('error'):
                pulse_count = otx_data.get('pulseCount', 0)
                enrichment['sources']['otx'] = {
                    'pulse_count': pulse_count
                }
                
                if pulse_count and pulse_count > 0:
                    enrichment['malicious'] = True
                    enrichment['threat_score'] = max(enrichment['threat_score'], 70)
        except Exception as e:
            logger.error(f"OTX check failed for {domain}: {str(e)}")
        
        return enrichment
    
    async def enrich_alert(self, alert: Dict) -> Dict:
        """
        Enrich a Wazuh alert with threat intelligence
        
        Args:
            alert: Wazuh alert data
            
        Returns:
            Enriched alert with threat intelligence
        """
        enriched_alert = alert.copy()
        enriched_alert['enrichment'] = {
            'iocs': {},
            'threat_score': 0,
            'is_malicious': False,
            'recommendations': []
        }
        
        # Extract IOCs
        iocs = self.extract_iocs(alert)
        
        # Enrich IPs
        for ip in iocs['ips']:
            ip_enrichment = await self.enrich_ip(ip)
            enriched_alert['enrichment']['iocs'][ip] = ip_enrichment
            
            if ip_enrichment['malicious']:
                enriched_alert['enrichment']['is_malicious'] = True
                enriched_alert['enrichment']['threat_score'] = max(
                    enriched_alert['enrichment']['threat_score'],
                    ip_enrichment['threat_score']
                )
                enriched_alert['enrichment']['recommendations'].append(
                    f"Block malicious IP: {ip} (Threat Score: {ip_enrichment['threat_score']})"
                )
        
        # Enrich hashes
        for file_hash in iocs['hashes']:
            hash_enrichment = await self.enrich_hash(file_hash)
            enriched_alert['enrichment']['iocs'][file_hash] = hash_enrichment
            
            if hash_enrichment['malicious']:
                enriched_alert['enrichment']['is_malicious'] = True
                enriched_alert['enrichment']['threat_score'] = max(
                    enriched_alert['enrichment']['threat_score'],
                    hash_enrichment['threat_score']
                )
                enriched_alert['enrichment']['recommendations'].append(
                    f"Quarantine malicious file: {file_hash}"
                )
        
        # Enrich domains
        for domain in iocs['domains']:
            domain_enrichment = await self.enrich_domain(domain)
            enriched_alert['enrichment']['iocs'][domain] = domain_enrichment
            
            if domain_enrichment['malicious']:
                enriched_alert['enrichment']['is_malicious'] = True
                enriched_alert['enrichment']['threat_score'] = max(
                    enriched_alert['enrichment']['threat_score'],
                    domain_enrichment['threat_score']
                )
                enriched_alert['enrichment']['recommendations'].append(
                    f"Block malicious domain: {domain}"
                )
        
        # Store enriched alert in MongoDB
        try:
            db = get_db()
            await db.enriched_alerts.insert_one(enriched_alert)
        except Exception as e:
            logger.error(f"Failed to store enriched alert: {str(e)}")
        
        return enriched_alert
    
    async def process_wazuh_alerts(self, limit: int = 100) -> List[Dict]:
        """
        Fetch and enrich latest Wazuh alerts
        
        Args:
            limit: Number of alerts to process
            
        Returns:
            List of enriched alerts
        """
        try:
            # Fetch alerts from Wazuh
            alerts = wazuh_service.get_alerts(limit=limit)
            
            enriched_alerts = []
            for alert in alerts:
                enriched = await self.enrich_alert(alert)
                enriched_alerts.append(enriched)
            
            logger.info(f"Processed and enriched {len(enriched_alerts)} alerts")
            return enriched_alerts
            
        except Exception as e:
            logger.error(f"Failed to process Wazuh alerts: {str(e)}")
            return []


# Singleton instance
enrichment_service = AlertEnrichmentService()
