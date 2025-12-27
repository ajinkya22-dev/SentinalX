from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.utils.logger import get_logger
from backend.utils.config import settings
from backend.routes import alerts, playbooks, intel, incidents, stats, auth
from backend.routes import cases, logs, integrations, monitor, wazuh

log = get_logger(__name__)

app = FastAPI(title="SentinalX", version="0.3.0")

# CORS - adjust origins as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "env": settings.APP_ENV}

# Core routers
app.include_router(auth.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(playbooks.router, prefix="/api")
app.include_router(intel.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
# Extended SOC modules
app.include_router(cases.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")
app.include_router(monitor.router, prefix="/api")
# Wazuh Integration
app.include_router(wazuh.router, prefix="/api")
