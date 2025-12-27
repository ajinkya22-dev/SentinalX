from fastapi import APIRouter, HTTPException
from backend.services import virustotal, abuseipdb, otx
from backend.utils.logger import get_logger

router = APIRouter(prefix="/intel", tags=["intel"])
log = get_logger(__name__)


@router.get("/ip/{ip}")
async def enrich_ip(ip: str):
    try:
        vt = virustotal.lookup_ip(ip)
        abuse = abuseipdb.lookup_ip(ip)
        alien = otx.lookup_ip(ip)
        return {"ip": ip, "virustotal": vt, "abuseipdb": abuse, "otx": alien}
    except Exception as e:
        log.exception("IP enrichment failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/domain/{domain}")
async def enrich_domain(domain: str):
    try:
        vt = virustotal.lookup_domain(domain)
        alien = otx.lookup_domain(domain)
        return {"domain": domain, "virustotal": vt, "otx": alien}
    except Exception as e:
        log.exception("Domain enrichment failed")
        raise HTTPException(status_code=500, detail=str(e))
