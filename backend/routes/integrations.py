from fastapi import APIRouter
from backend.utils.config import settings
from backend.utils.logger import get_logger

router = APIRouter(prefix="/integrations", tags=["integrations"])
log = get_logger(__name__)

@router.get("/status")
async def status():
    return {
        "virustotal": bool(settings.VIRUSTOTAL_API_KEY),
        "abuseipdb": bool(settings.ABUSEIPDB_API_KEY),
        "otx": bool(settings.OTX_API_KEY),
        "slack": bool(settings.SLACK_WEBHOOK_URL),
        "splunk": bool(settings.__dict__.get("SPLUNK_TOKEN")),
        "elk": bool(settings.__dict__.get("ELK_ENDPOINT")),
        "okta": bool(settings.__dict__.get("OKTA_API_TOKEN")),
        "ad": bool(settings.__dict__.get("AD_SERVER")),
    }

