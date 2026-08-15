from app.core.context import get_db, get_current_user


def list_notifications() -> list:
    user = get_current_user()
    result = (
        get_db().table("notifications")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return result.data or []


def get_unread_count() -> int:
    user = get_current_user()
    result = (
        get_db().table("notifications")
        .select("id", count="exact", head=True)
        .eq("profile_id", user.id)
        .eq("is_read", False)
        .execute()
    )
    return result.count or 0


def mark_all_read() -> None:
    user = get_current_user()
    get_db().table("notifications").update({"is_read": True}).eq("profile_id", user.id).eq("is_read", False).execute()


def mark_read(notification_id: str) -> None:
    user = get_current_user()
    get_db().table("notifications").update({"is_read": True}).eq("id", notification_id).eq("profile_id", user.id).execute()
