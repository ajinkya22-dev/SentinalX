from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId

from backend.utils.logger import get_logger
from backend.database import get_db
from backend.models.incidentModel import Incident, IncidentOut

router = APIRouter(prefix="/incidents", tags=["incidents"])
log = get_logger(__name__)


def _to_incident_out(doc: dict) -> IncidentOut:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return IncidentOut(**doc)


@router.post("", response_model=IncidentOut)
async def create_incident(body: Incident):
    try:
        db = get_db()
        data = body.model_dump()
        data["createdAt"] = datetime.utcnow().isoformat() + "Z"
        res = await db.incidents.insert_one(data)
        data["id"] = str(res.inserted_id)
        return IncidentOut(**data)
    except Exception as e:
        log.exception("Failed to create incident")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=list[IncidentOut])
async def list_incidents(limit: int = 50):
    try:
        db = get_db()
        cursor = db.incidents.find().sort("createdAt", -1).limit(limit)
        items = [
            _to_incident_out(doc)
            async for doc in cursor
        ]
        return items
    except Exception as e:
        log.exception("Failed to list incidents")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{incident_id}", response_model=IncidentOut)
async def get_incident(incident_id: str):
    try:
        db = get_db()
        doc = await db.incidents.find_one({"_id": ObjectId(incident_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Incident not found")
        return _to_incident_out(doc)
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Failed to get incident")
        raise HTTPException(status_code=500, detail=str(e))


class UpdateStatus(BaseModel):
    status: str


@router.patch("/{incident_id}/status")
async def update_status(incident_id: str, body: UpdateStatus):
    try:
        db = get_db()
        res = await db.incidents.update_one(
            {"_id": ObjectId(incident_id)}, {"$set": {"status": body.status}}
        )
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail="Incident not found")
        return {"ok": True, "updated": res.modified_count}
    except HTTPException:
        raise
    except Exception as e:
        log.exception("Failed to update status")
        raise HTTPException(status_code=500, detail=str(e))

