from fastapi import APIRouter
from datetime import datetime, timezone
from backend.utils.logger import get_logger

router = APIRouter(prefix="/monitor", tags=["monitor"])
log = get_logger(__name__)

@router.get("/metrics")
async def metrics():
    # Placeholder metrics; replace with agent-collected data or system polling
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "hosts": [
            {"name": "host-1", "cpu": 34, "mem": 62, "connections": 123, "failedLogins": 2},
            {"name": "host-2", "cpu": 78, "mem": 81, "connections": 310, "failedLogins": 14},
        ],
        "topTalkers": [
            {"ip": "10.0.0.5", "bytes": 982344},
            {"ip": "10.0.0.8", "bytes": 743221},
        ],
        "suspiciousConnections": [
            {"src": "10.0.0.5", "dst": "45.77.23.11", "port": 4444, "reason": "Unusual port"},
        ],
    }

