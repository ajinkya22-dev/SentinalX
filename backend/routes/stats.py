from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta, timezone
from backend.database import get_db
from backend.utils.logger import get_logger

router = APIRouter(prefix="/stats", tags=["stats"])
log = get_logger(__name__)


@router.get("/overview")
async def overview():
    try:
        db = get_db()
        # Severity counts
        pipeline_sev = [
            {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
        ]
        sev = {d["_id"]: d["count"] async for d in db.alerts.aggregate(pipeline_sev)}

        # Total and last 24h
        total = await db.alerts.count_documents({})
        since = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat().replace("+00:00", "Z")
        last24 = await db.alerts.count_documents({"createdAt": {"$gte": since}})

        # Top sources
        pipeline_src = [
            {"$group": {"_id": "$source", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5},
        ]
        top_sources = [{"source": d["_id"], "count": d["count"]} async for d in db.alerts.aggregate(pipeline_src)]

        # Recent alerts
        recent = [
            {"id": str(d["_id"]), "severity": d.get("severity"), "type": d.get("type"), "source": d.get("source"), "createdAt": d.get("createdAt")}
            async for d in db.alerts.find({}, {"source": 1, "severity": 1, "type": 1, "createdAt": 1}).sort("createdAt", -1).limit(8)
        ]

        # Incident status counts
        pipeline_inc = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        incidents = {d["_id"]: d["count"] async for d in db.incidents.aggregate(pipeline_inc)}

        return {
            "totalAlerts": total,
            "last24hAlerts": last24,
            "severity": sev,
            "topSources": top_sources,
            "recentAlerts": recent,
            "incidents": incidents,
        }
    except Exception as e:
        log.exception("overview stats failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeseries")
async def timeseries(days: int = 7, bucket: str = "day"):
    try:
        db = get_db()
        if bucket not in {"hour", "day"}:
            bucket = "day"
        start_dt = datetime.now(timezone.utc) - timedelta(days=days)
        start_iso = start_dt.isoformat().replace("+00:00", "Z")

        # Parse createdAt string to date and truncate
        unit = "hour" if bucket == "hour" else "day"
        pipeline = [
            {"$match": {"createdAt": {"$gte": start_iso}}},
            {
                "$addFields": {
                    "createdAtDate": {
                        "$dateFromString": {"dateString": "$createdAt"}
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateTrunc": {
                            "date": "$createdAtDate",
                            "unit": unit,
                            "binSize": 1,
                        }
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        points = [{"ts": d["_id"].isoformat(), "count": d["count"]} async for d in db.alerts.aggregate(pipeline)]
        return {"start": start_dt.isoformat(), "bucket": bucket, "points": points}
    except Exception as e:
        log.exception("timeseries stats failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mitre")
async def mitre_top():
    try:
        # Stub data; in real system map alerts to MITRE tactics via classification logic
        return {
            "tactics": [
                {"name": "Defense Evasion", "count": 12},
                {"name": "Initial Access", "count": 8},
                {"name": "Persistence", "count": 5},
                {"name": "Privilege Escalation", "count": 3},
            ]
        }
    except Exception as e:
        log.exception("mitre stats failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/compliance")
async def compliance():
    try:
        # Stub compliance donut values; integrate with benchmark scanner later
        return {
            "standard": "PCI DSS",
            "segments": [
                {"label": "Passed", "value": 72},
                {"label": "Warn", "value": 14},
                {"label": "Failed", "value": 9},
                {"label": "Unknown", "value": 5},
            ]
        }
    except Exception as e:
        log.exception("compliance stats failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fim/recent")
async def fim_recent():
    try:
        # Stub file integrity events
        return {
            "events": []  # Provide empty list until implemented
        }
    except Exception as e:
        log.exception("fim recent failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sca/latest")
async def sca_latest():
    try:
        # Stub secure configuration assessment results
        return {
            "scans": [
                {
                    "policy": "CIS Microsoft Windows 10 Enterprise Benchmark v1.12.0",
                    "endedAt": "2025-11-09T10:00:00Z",
                    "passed": 128,
                    "failed": 24,
                    "score": 84.2,
                }
            ]
        }
    except Exception as e:
        log.exception("sca latest failed")
        raise HTTPException(status_code=500, detail=str(e))
