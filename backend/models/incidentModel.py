from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class Incident(BaseModel):
    title: str
    status: str = Field(pattern=r"^(open|in_progress|resolved|closed)$", default="open")
    alerts: Optional[List[str]] = None  # list of alert IDs
    notes: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class IncidentOut(Incident):
    id: str
    createdAt: Optional[str] = None
