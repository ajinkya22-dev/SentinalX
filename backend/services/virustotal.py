from backend.utils.config import settings
from backend.utils.logger import get_logger
import requests

log = get_logger(__name__)


def lookup_ip(ip: str) -> dict:
    if not settings.VIRUSTOTAL_API_KEY:
        log.warning("VIRUSTOTAL_API_KEY not set; returning stub response")
        return {"available": False, "message": "API key missing"}
    try:
        url = f"https://www.virustotal.com/api/v3/ip_addresses/{ip}"
        headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return {"error": resp.text, "status": resp.status_code}
        data = resp.json()
        return {"reputation": data.get("data", {}).get("attributes", {}).get("reputation")}
    except Exception as e:
        log.exception("VirusTotal IP lookup failed")
        return {"error": str(e)}


def lookup_domain(domain: str) -> dict:
    if not settings.VIRUSTOTAL_API_KEY:
        log.warning("VIRUSTOTAL_API_KEY not set; returning stub response")
        return {"available": False, "message": "API key missing"}
    try:
        url = f"https://www.virustotal.com/api/v3/domains/{domain}"
        headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return {"error": resp.text, "status": resp.status_code}
        data = resp.json()
        attrs = data.get("data", {}).get("attributes", {})
        return {
            "reputation": attrs.get("reputation"),
            "last_analysis_stats": attrs.get("last_analysis_stats"),
        }
    except Exception as e:
        log.exception("VirusTotal domain lookup failed")
        return {"error": str(e)}
