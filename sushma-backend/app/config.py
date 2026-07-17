"""
Application configuration.
Loads settings from environment variables / .env file.
"""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database: falls back to local SQLite file if not provided (great for dev/testing)
    DATABASE_URL: str = ""

    # JWT / Auth
    SECRET_KEY: str = "dev-secret-key-please-change"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # File storage
    UPLOAD_DIR: str = "app/uploads"
    MAX_UPLOAD_MB: int = 20

    # First admin bootstrap
    FIRST_ADMIN_EMAIL: str = "admin@edrp.local"
    FIRST_ADMIN_PASSWORD: str = "Admin@12345"

    @property
    def resolved_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # Default to SQLite for zero-config local development
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return f"sqlite:///{os.path.join(base_dir, 'edrp.db')}"


settings = Settings()
