"""
Wazuh API Routes
Provides endpoints for accessing Wazuh security data
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.services.wazuh import wazuh_service
from backend.services.enrichment import enrichment_service
from backend.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["wazuh"], prefix="/wazuh")

@router.get('/health')
def health_check():
    """Check Wazuh service health and configuration status"""
    try:
        health = wazuh_service.health_check()
        if health['status'] != 'healthy':
            raise HTTPException(status_code=503, detail=health)
        return health
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'status': 'error',
            'message': str(e)
        })


@router.get('/agents')
def get_agents(limit: int = Query(100, ge=1, le=1000)):
    """Get all Wazuh agents"""
    try:
        agents = wazuh_service.get_agents(limit=limit)
        
        return {
            'success': True,
            'data': agents,
            'count': len(agents)
        }
    except Exception as e:
        logger.error(f"Error fetching agents: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })


@router.get('/agents/{agent_id}')
def get_agent_details(agent_id: str):
    """Get detailed information about a specific agent"""
    try:
        agent = wazuh_service.get_agent_details(agent_id)
        
        if agent:
            return {
                'success': True,
                'data': agent
            }
        else:
            raise HTTPException(status_code=404, detail={
                'success': False,
                'error': 'Agent not found'
            })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching agent details: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })


@router.get('/alerts')
def get_alerts(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    severity: Optional[str] = Query(None, regex="^(low|medium|high|critical)$")
):
    """
    Get alerts from Wazuh
    Query params:
        - limit: number of alerts (default: 100)
        - offset: pagination offset (default: 0)
        - severity: filter by severity (low, medium, high, critical)
    """
    try:
        alerts = wazuh_service.get_alerts(
            limit=limit,
            offset=offset,
            severity=severity
        )
        
        return {
            'success': True,
            'data': alerts,
            'count': len(alerts),
            'offset': offset
        }
    except Exception as e:
        logger.error(f"Error fetching alerts: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })


@router.get('/security-events')
def get_security_events(limit: int = Query(100, ge=1, le=1000)):
    """Get recent security events"""
    try:
        events = wazuh_service.get_security_events(limit=limit)
        
        return {
            'success': True,
            'data': events,
            'count': len(events)
        }
    except Exception as e:
        logger.error(f"Error fetching security events: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })


@router.get('/fim')
def get_fim_events(
    agent_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get File Integrity Monitoring events
    Query params:
        - agent_id: specific agent (optional)
        - limit: number of events (default: 100)
    """
    try:
        events = wazuh_service.get_fim_events(agent_id=agent_id, limit=limit)
        
        return {
            'success': True,
            'data': events,
            'count': len(events)
        }
    except Exception as e:
        logger.error(f"Error fetching FIM events: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })


@router.get('/vulnerabilities')
def get_vulnerabilities(agent_id: Optional[str] = Query(None)):
    """
    Get vulnerability information
    Query params:
        - agent_id: specific agent (optional)
    """
    try:
        vulns = wazuh_service.get_vulnerability_detector(agent_id=agent_id)
        
        return {
            'success': True,
            'data': vulns,
            'count': len(vulns)
        }
    except Exception as e:
        logger.error(f"Error fetching vulnerabilities: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })


@router.get('/rule/{rule_id}')
def get_rule_info(rule_id: str):
    """Get information about a specific Wazuh rule"""
    try:
        rule = wazuh_service.get_rule_info(rule_id)
        
        if rule:
            return {
                'success': True,
                'data': rule
            }
        else:
            raise HTTPException(status_code=404, detail={
                'success': False,
                'error': 'Rule not found'
            })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching rule info: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })


@router.get('/mitre')
def get_mitre_attack():
    """Get MITRE ATT&CK framework mappings"""
    try:
        mitre_data = wazuh_service.get_mitre_attack_info()
        
        return {
            'success': True,
            'data': mitre_data,
            'count': len(mitre_data)
        }
    except Exception as e:
        logger.error(f"Error fetching MITRE data: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })


@router.post('/enrich-alerts')
async def enrich_alerts(limit: int = Query(100, ge=1, le=500)):
    """
    Fetch Wazuh alerts and enrich with threat intelligence
    
    This endpoint:
    1. Fetches alerts from Wazuh
    2. Extracts IOCs (IPs, domains, hashes)
    3. Queries threat intel APIs (VirusTotal, AbuseIPDB, OTX)
    4. Calculates threat scores
    5. Stores enriched alerts in MongoDB
    """
    try:
        enriched_alerts = await enrichment_service.process_wazuh_alerts(limit=limit)
        
        malicious_count = sum(1 for alert in enriched_alerts if alert.get('enrichment', {}).get('is_malicious', False))
        
        return {
            'success': True,
            'processed': len(enriched_alerts),
            'malicious_detected': malicious_count,
            'data': enriched_alerts
        }
    except Exception as e:
        logger.error(f"Error enriching alerts: {str(e)}")
        raise HTTPException(status_code=500, detail={
            'success': False,
            'error': str(e)
        })
