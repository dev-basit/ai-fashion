from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = ""
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 300
    OPENAI_API_KEY: str = ""

    IS_LLM_LIMIT: bool = True
    LLM_REQUESTS_PER_DAY: int = 100

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
