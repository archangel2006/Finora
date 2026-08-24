import json
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings

APP_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    # Database / Auth / API settings
    database_url: str = "sqlite:///./copilot.db"
    jwt_secret: str = "change-me"
    cors_origins_raw: Union[List[str], str] = '["http://localhost:3000", "https://*.vercel.app"]'

    @property
    def cors_origins(self) -> List[str]:
        if isinstance(self.cors_origins_raw, list):
            return self.cors_origins_raw
        try:
            return json.loads(self.cors_origins_raw)
        except Exception:
            return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]

    # External APIs
    finnhub_api_key: str = ""
    fmp_api_key: str = ""

    anthropic_api_key: str = ""
    anthropic_base_url: str = ""

    # RAG paths
    documents_path: str = str(APP_DIR / "rag" / "documents")
    vector_store_path: str = str(APP_DIR / "rag" / "index")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()