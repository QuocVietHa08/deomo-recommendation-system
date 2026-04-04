import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    PROJECT_NAME: str = "VinoBuzz"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
