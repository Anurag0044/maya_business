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
    llm_provider: str = "nvidia"
    nvidia_api_key: str | None = None
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_chat_model: str = "moonshotai/kimi-k3"

    # Retained for embeddings and optional development fallback.
    openai_api_key: str | None = None
    openai_base_url: str = "https://api.openai.com/v1"
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    chat_model: str = "gpt-4o-mini"

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
