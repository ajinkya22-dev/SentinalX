from fastapi import APIRouter, HTTPException
from backend.utils.logger import get_logger
from backend.database import get_db
from backend.models.alertModel import AlertIn, AlertOut
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter(prefix="/alerts", tags=["alerts"])
log = get_logger(__name__)


def _to_alert_out(doc: dict) -> AlertOut:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return AlertOut(**doc)


class UpdateAlertStatus(BaseModel):
    status: str


@router.post("", response_model=AlertOut)
async def ingest_alert(alert: AlertIn):
    try:
        db = get_db()
        doc = alert.model_dump()
        doc["createdAt"] = datetime.utcnow().isoformat() + "Z"
        res = await db.alerts.insert_one(doc)
        return AlertOut(id=str(res.inserted_id), **doc)
    except Exception as e:
        log.exception("Failed to ingest alert")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=list[AlertOut])
async def list_alerts(limit: int = 100, severity: str | None = None):
    try:
        db = get_db()
        query = {}
        if severity:
            query["severity"] = severity
        cursor = db.alerts.find(query).sort("createdAt", -1).limit(limit)
        items = [
            _to_alert_out(doc)
            async for doc in cursor
        ]
        return items
    except Exception as e:
        log.exception("Failed to list alerts")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{alert_id}", response_model=AlertOut)
async def get_alert(alert_id: str):
    try:
        db = get_db()
        doc = await db.alerts.find_one({"_id": ObjectId(alert_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Alert not found")
        return _to_alert_out(doc)
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Failed to get alert")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{alert_id}/status")
async def update_status(alert_id: str, body: UpdateAlertStatus):
    try:
        if body.status not in {"new", "investigating", "false_positive", "resolved"}:
            raise HTTPException(status_code=400, detail="Invalid status")
        db = get_db()
        res = await db.alerts.update_one({"_id": ObjectId(alert_id)}, {"$set": {"status": body.status}})
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Alert not found")
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Failed to update alert status")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/csv")
async def export_csv(limit: int = 1000):
    try:
        db = get_db()
        cursor = db.alerts.find().sort("createdAt", -1).limit(limit)
        rows = ["id,source,severity,type,status,createdAt"]
        async for doc in cursor:
            rows.append(
                f"{doc['_id']},{doc.get('source', '')},{doc.get('severity', '')},{doc.get('type', '')},{doc.get('status', '')},{doc.get('createdAt', '')}"
            )
        return {"content": "\n".join(rows)}
    except Exception as e:
        log.exception("CSV export failed")
        raise HTTPException(status_code=500, detail=str(e))
