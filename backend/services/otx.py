from backend.utils.config import settings
from backend.utils.logger import get_logger
import requests

log = get_logger(__name__)
BASE_URL = "https://otx.alienvault.com/api/v1"


def _headers():
    return {"X-OTX-API-KEY": settings.OTX_API_KEY} if settings.OTX_API_KEY else {}


def lookup_ip(ip: str) -> dict:
    if not settings.OTX_API_KEY:
        log.warning("OTX_API_KEY not set; returning stub response")
        return {"available": False, "message": "API key missing"}
    try:
        url = f"{BASE_URL}/indicators/IPv4/{ip}/general"
        resp = requests.get(url, headers=_headers(), timeout=10)
        if resp.status_code != 200:
            return {"error": resp.text, "status": resp.status_code}
        data = resp.json()
        pulse_count = len(data.get("pulse_info", {}).get("pulses", []))
        return {"pulseCount": pulse_count}
    except Exception as e:
        log.exception("OTX IP lookup failed")
        return {"error": str(e)}


def lookup_domain(domain: str) -> dict:
    if not settings.OTX_API_KEY:
        log.warning("OTX_API_KEY not set; returning stub response")
        return {"available": False, "message": "API key missing"}
    try:
        url = f"{BASE_URL}/indicators/domain/{domain}/general"
        resp = requests.get(url, headers=_headers(), timeout=10)
        if resp.status_code != 200:
            return {"error": resp.text, "status": resp.status_code}
        data = resp.json()
        pulse_count = len(data.get("pulse_info", {}).get("pulses", []))
        return {"pulseCount": pulse_count}
    except Exception as e:
        log.exception("OTX domain lookup failed")
        return {"error": str(e)}

