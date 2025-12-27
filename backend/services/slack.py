from backend.utils.logger import get_logger
from backend.utils.config import settings
import requests

log = get_logger(__name__)


def send_message(text: str) -> dict:
    if not settings.SLACK_WEBHOOK_URL:
        log.warning("SLACK_WEBHOOK_URL not set; returning stub response")
        return {"available": False, "message": "Webhook missing"}
    try:
        resp = requests.post(settings.SLACK_WEBHOOK_URL, json={"text": text}, timeout=10)
        if resp.status_code >= 300:
            return {"error": resp.text, "status": resp.status_code}
        return {"ok": True}
    except Exception as e:
        log.exception("Slack message failed")
        return {"error": str(e)}

