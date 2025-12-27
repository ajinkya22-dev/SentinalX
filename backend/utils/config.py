import os
from dataclasses import dataclass
from dotenv import load_dotenv
from typing import Optional

# Load environment variables from a .env file if present
load_dotenv()

@dataclass
class Settings:
    # MongoDB
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "SentinalX")

    # Integrations
    VIRUSTOTAL_API_KEY: Optional[str] = os.getenv("VIRUSTOTAL_API_KEY")
    ABUSEIPDB_API_KEY: Optional[str] = os.getenv("ABUSEIPDB_API_KEY")
    OTX_API_KEY: Optional[str] = os.getenv("OTX_API_KEY")
    SLACK_WEBHOOK_URL: Optional[str] = os.getenv("SLACK_WEBHOOK_URL")

    # Wazuh Integration
    WAZUH_API_URL: str = os.getenv("WAZUH_API_URL", "https://localhost:55000")
    WAZUH_API_USER: str = os.getenv("WAZUH_API_USER", "wazuh")
    WAZUH_API_PASSWORD: Optional[str] = os.getenv("WAZUH_API_PASSWORD")
    WAZUH_VERIFY_SSL: bool = os.getenv("WAZUH_VERIFY_SSL", "false").lower() == "true"

    # ELK Stack
    ELK_ENDPOINT: str = os.getenv("ELK_ENDPOINT", "http://localhost:9200")

    # App
    APP_ENV: str = os.getenv("APP_ENV", "dev")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-insecure-secret-change")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

settings = Settings()
