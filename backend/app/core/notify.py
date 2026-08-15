from typing import Any, Optional, cast

from app.core.supabase import get_admin_db_client


def notify_user_and_admins(
    recipient_id: Optional[str],
    payload: dict,
    exclude_id: Optional[str] = None,
) -> None:
    admin = get_admin_db_client()
    raw = admin.table("profiles").select("id").eq("role", "admin").eq("is_active", True).execute()
    rows: list[dict[str, Any]] = cast(list[dict[str, Any]], raw.data or [])
    admin_ids = [r["id"] for r in rows]
    ids = list(
        dict.fromkeys(
            i
            for i in ([recipient_id] if recipient_id else []) + admin_ids
            if i and i != exclude_id
        )
    )
    if ids:
        admin.table("notifications").insert(
            [{"profile_id": pid, **payload} for pid in ids]
        ).execute()


def notify_admins(payload: dict, exclude_id: Optional[str] = None) -> None:
    notify_user_and_admins(None, payload, exclude_id)
