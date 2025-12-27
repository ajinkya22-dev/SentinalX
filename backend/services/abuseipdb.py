from backend.utils.config import settings
from backend.utils.logger import get_logger
import requests

log = get_logger(__name__)


def lookup_ip(ip: str) -> dict:
    if not settings.ABUSEIPDB_API_KEY:
        log.warning("ABUSEIPDB_API_KEY not set; returning stub response")
        return {"available": False, "message": "API key missing"}
    try:
        url = "https://api.abuseipdb.com/api/v2/check"
        params = {"ipAddress": ip, "maxAgeInDays": 90}
        headers = {
            "Key": settings.ABUSEIPDB_API_KEY,
            "Accept": "application/json",
        }
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        if resp.status_code != 200:
            return {"error": resp.text, "status": resp.status_code}
        data = resp.json()
        return {
            "abuseConfidenceScore": data.get("data", {}).get("abuseConfidenceScore"),
            "totalReports": data.get("data", {}).get("totalReports"),
        }
    except Exception as e:
        log.exception("AbuseIPDB lookup failed")
        return {"error": str(e)}

