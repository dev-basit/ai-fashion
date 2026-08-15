from typing import Any, cast

from app.core.context import get_db, get_current_user
from app.core.supabase import get_admin_db_client
from app.schemas.profiles import Profile


def get_me() -> dict:
    user = get_current_user()
    result = (
        get_db().table("profiles")
        .select("id, full_name, phone, role, avatar_url, date_of_birth, created_at")
        .eq("id", user.id)
        .maybe_single()
        .execute()
    )
    profile_data: dict[str, Any] = cast(dict[str, Any], (result.data if result is not None else None) or {})
    return {**profile_data, "email": user.email}


def list_profiles() -> list:
    result = (
        get_db().table("profiles")
        .select("*")
        .eq("is_active", True)
        .order("full_name")
        .execute()
    )
    return result.data or []


def get_profile(profile_id: str) -> Profile | None:
    result = (
        get_db().table("profiles")
        .select("*")
        .eq("id", profile_id)
        .maybe_single()
        .execute()
    )
    if result is None or result.data is None:
        return None
    return Profile.model_validate(result.data)


def update_profile(profile_id: str, body: dict) -> Profile | None:
    result = (
        get_db().table("profiles")
        .update(body)
        .eq("id", profile_id)
        .select()
        .maybe_single()
        .execute()
    )
    if result is None or result.data is None:
        return None
    return Profile.model_validate(result.data)
