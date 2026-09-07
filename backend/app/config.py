"""
SentiaMind — Application Configuration
Reads all settings from environment variables / .env file.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────
    app_env: str = "development"
    app_name: str = "SentiaMind"
    app_version: str = "1.0.0"
    debug: bool = False

    # ── Database ─────────────────────────────────────────────────
    database_url: str = (
        "postgresql+asyncpg://sentia:sentia_pass@localhost:5432/sentiamind"
    )

    # ── Redis ────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── JWT ──────────────────────────────────────────────────────
    jwt_secret: str = "insecure_dev_secret_change_in_production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # ── AES-256 Encryption ───────────────────────────────────────
    # Must be exactly 64 hex characters (32 bytes decoded)
    master_encryption_key: str = (
        "0000000000000000000000000000000000000000000000000000000000000000"
    )

    # ── HuggingFace / ML ─────────────────────────────────────────
    huggingface_model_path: str = "./models/distilbert-emotion"
    # Fallback public model if local weights not found
    fallback_model_name: str = "j-hartmann/emotion-english-distilroberta-base"

    # ── CORS ─────────────────────────────────────────────────────
    frontend_url: str = "http://localhost:5173"

    # ── Rate Limiting ────────────────────────────────────────────
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60

    @property
    def master_key_bytes(self) -> bytes:
        """Decode the hex master encryption key to raw bytes."""
        return bytes.fromhex(self.master_encryption_key)

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached Settings singleton."""
    return Settings()
