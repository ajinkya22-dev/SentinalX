from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.utils.config import settings
from backend.utils.logger import get_logger
from typing import Optional

log = get_logger(__name__)

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        log.info("Connecting to MongoDB...")
        _client = AsyncIOMotorClient(settings.MONGO_URI)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        _db = get_client()[settings.MONGO_DB_NAME]
    return _db
