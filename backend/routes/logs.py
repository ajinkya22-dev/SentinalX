from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
from backend.database import get_db
from backend.utils.logger import get_logger

router = APIRouter(prefix="/logs", tags=["logs"])
log = get_logger(__name__)

class LogIngest(BaseModel):
    source: str
    message: str
    ip: str | None = None
    type: str | None = None
    ts: str | None = None

@router.post("/ingest")
async def ingest(body: LogIngest):
    try:
        db = get_db()
        doc = body.model_dump()
        doc["ts"] = doc.get("ts") or datetime.now(timezone.utc).isoformat()
        res = await db.logs.insert_one(doc)
        return {"id": str(res.inserted_id)}
    except Exception as e:
        log.exception("log ingest failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search(q: str | None = None, ip: str | None = None, type: str | None = None, limit: int = 100):
    try:
        db = get_db()
        query: dict = {}
        if ip:
            query["ip"] = ip
        if type:
            query["type"] = type
        if q:
            query["message"] = {"$regex": q, "$options": "i"}
        cursor = db.logs.find(query).sort("ts", -1).limit(limit)
        out = []
        async for d in cursor:
            d["id"] = str(d.pop("_id"))
            out.append(d)
        return {"items": out}
    except Exception as e:
        log.exception("log search failed")
        raise HTTPException(status_code=500, detail=str(e))

