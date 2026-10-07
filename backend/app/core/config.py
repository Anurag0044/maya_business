from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve the backend/ root from this file's location so the .env is always
# found regardless of the current working directory (IDE, Docker, scripts, etc.)
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    app_name: str = "MAYA Front Desk"
    environment: str = "development"
    debug: bool = True

    database_url: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/maya_frontdesk"
    )

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    timezone: str = "Asia/Kolkata"

    # LLM provider boundary: switch providers without changing agent/business logic.
    llm_provider: str = "groq"

    # --- Groq (recommended: free tier, instant responses, no timeouts) ---
    groq_api_key: str | None = None
    groq_base_url: str = "https://api.groq.com/openai/v1"
    groq_chat_model: str = "llama-3.1-8b-instant"

    # --- OpenAI (retained for embeddings and optional fallback) ---
    openai_api_key: str | None = None
    openai_base_url: str = "https://api.openai.com/v1"
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    chat_model: str = "gpt-4o-mini"

    google_calendar_client_id: str | None = None
    google_calendar_client_secret: str | None = None
    google_calendar_redirect_uri: str = "http://127.0.0.1:8000/api/v1/calendar/callback"

    # Internal Voice Intelligence -> Front Desk gateway credential.
    # Keep this secret outside source control; rotate it before production.
    voice_gateway_api_key: str | None = None

    # --- Meta WhatsApp Cloud API ---
    whatsapp_graph_api_base: str = "https://graph.facebook.com"
    # Keep the Graph API version configurable because Meta versions retire.
    whatsapp_graph_api_version: str = "v25.0"
    whatsapp_app_secret: str | None = None
    whatsapp_webhook_verify_token: str | None = None
    whatsapp_http_timeout_seconds: float = 20.0
    whatsapp_http_connect_timeout_seconds: float = 10.0

    model_config = SettingsConfigDict(
        # Absolute path — works from any CWD (IDE, Docker, test runner, CLI).
        env_file=str(_BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return the singleton Settings instance.

    The result is cached for the lifetime of the process.  In tests, call
    ``get_settings.cache_clear()`` after patching environment variables so
    the next call picks up the new values instead of returning the stale copy.
    """
    return Settings()


settings = get_settings()
