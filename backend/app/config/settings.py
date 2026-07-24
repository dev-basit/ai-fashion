from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr

class Settings(BaseSettings):
    OPENAI_API_KEY: SecretStr
    IS_LLM_LIMIT: bool = True
    LLM_REQUESTS_PER_DAY: int = 100

    DATABASE_URL: SecretStr

    JWT_SECRET_KEY: SecretStr
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 300


    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings() # type: ignore
