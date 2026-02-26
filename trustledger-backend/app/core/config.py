import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Database - SQLite for self-contained operation
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./trustledger.db")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "trustledger-super-secret-key-2024-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"


settings = Settings()
