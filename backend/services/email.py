from backend.utils.logger import get_logger

log = get_logger(__name__)


def quarantine_email(message_id: str) -> dict:
    # Stub: Integrate with mail provider (e.g., Microsoft Graph, Gmail API)
    log.info(f"Quarantining email {message_id} (stub)")
    return {"action": "quarantine_email", "message_id": message_id, "status": "requested"}

