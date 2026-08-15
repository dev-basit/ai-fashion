from functools import lru_cache
from supabase import Client, ClientOptions, create_client
from app.config.settings import settings


@lru_cache(maxsize=1)
def get_admin_db_client() -> Client:
    return create_client(
        settings.supabase_url,
        settings.supabase_secret_key.get_secret_value(),
    )


def get_db_client(access_token: str) -> Client:
    return create_client(
        settings.supabase_url,
        settings.supabase_publishable_key,
        options=ClientOptions(headers={"Authorization": f"Bearer {access_token}"}),
    )
