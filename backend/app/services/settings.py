from typing import Optional

from supabase import Client


def get_settings(supabase: Client, key: Optional[str] = None) -> list:
    query = supabase.table("business_settings").select("*")
    if key:
        query = query.eq("key", key)
    return query.execute().data or []


def update_setting(supabase: Client, user_id: str, key: str, value) -> dict | None:
    from datetime import datetime, timezone
    result = (
        supabase.table("business_settings")
        .update({"value": value, "updated_by": user_id, "updated_at": datetime.now(timezone.utc).isoformat()})
        .eq("key", key)
        .select()
        .single()
        .execute()
    )
    return result.data
