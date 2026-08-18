import os

class Settings:
    PROJECT_NAME: str = "Expert Decision Replay Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkeyforjwttokengenerationthatisverylong123456")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    # SQLite by default, but supports PostgreSQL if environment variable is set
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./decisions.db")
    
    # Upload storage directory
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
        "uploads"
    ))

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
