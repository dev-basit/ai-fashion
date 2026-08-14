from supabase import Client


def list_notifications(supabase: Client, user_id: str) -> list:
    result = (
        supabase.table("notifications")
        .select("*")
        .eq("profile_id", user_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return result.data or []


def get_unread_count(supabase: Client, user_id: str) -> int:
    result = (
        supabase.table("notifications")
        .select("id", count="exact", head=True)
        .eq("profile_id", user_id)
        .eq("is_read", False)
        .execute()
    )
    return result.count or 0


def mark_all_read(supabase: Client, user_id: str) -> None:
    supabase.table("notifications").update({"is_read": True}).eq("profile_id", user_id).eq("is_read", False).execute()


def mark_read(supabase: Client, notification_id: str, user_id: str) -> None:
    supabase.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("profile_id", user_id).execute()
