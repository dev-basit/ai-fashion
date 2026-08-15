from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    # Application
    frontend_url: str = "http://localhost:3000"

    # Supabase
    supabase_url: str
    supabase_publishable_key: str
    supabase_secret_key: SecretStr

    # OpenAI
    openai_api_key: SecretStr
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    # AI
    ai_daily_limit: int = 20

    # Data fetching
    page_limit: int = 10

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


config = Config()  # type: ignore[call-arg]
