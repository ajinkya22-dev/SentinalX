from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from backend.database import get_db
from backend.utils.logger import get_logger

router = APIRouter(prefix="/cases", tags=["cases"])
log = get_logger(__name__)

class CaseCreate(BaseModel):
    title: str
    description: str | None = None
    alerts: list[str] | None = None

@router.post("", status_code=201)
async def create_case(body: CaseCreate):
    try:
        db = get_db()
        doc = body.model_dump()
        doc["status"] = "open"
        doc["createdAt"] = datetime.now(timezone.utc).isoformat()
        res = await db.cases.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        return doc
    except Exception as e:
        log.exception("create_case failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", summary="List cases")
async def list_cases(limit: int = 50):
    try:
        db = get_db()
        cursor = db.cases.find().sort("createdAt", -1).limit(limit)
        out = []
        async for c in cursor:
            c["id"] = str(c.pop("_id"))
            out.append(c)
        return out
    except Exception as e:
        log.exception("list_cases failed")
        raise HTTPException(status_code=500, detail=str(e))

