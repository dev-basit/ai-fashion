from langchain_core.runnables import RunnableConfig
from supabase import Client

from app.core.supabase import get_user_client


def _cfg(config: RunnableConfig) -> dict:
    return ((config or {}).get("configurable") or {})


def get_supabase(config: RunnableConfig) -> Client:
    return get_user_client(_cfg(config).get("access_token", ""))


def get_user_id(config: RunnableConfig) -> str:
    return _cfg(config).get("user_id", "")
