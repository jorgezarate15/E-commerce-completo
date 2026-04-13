from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    project_name: str = "Shoe Store API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./shoe_store.db"
    secret_key: str = "change_this_secret"
    payment_webhook_secret: str = "dev_webhook_secret"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 10080
    backend_cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
    ]

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


settings = Settings()
