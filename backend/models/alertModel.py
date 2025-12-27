from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Literal


class AlertIn(BaseModel):
    source: str
    severity: Literal["low", "medium", "high", "critical"]
    type: str
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    status: Literal['new','investigating','false_positive','resolved'] = 'new'


class AlertOut(AlertIn):
    id: str
    createdAt: Optional[str] = None
