from datetime import datetime, timezone
from typing import Any, cast

from app.core.context import get_db, get_current_user
from app.core.supabase import get_admin_db_client
from app.schemas.chat import Message


def list_conversations() -> list:
    user = get_current_user()
    admin = get_admin_db_client()
    _mem_res = admin.table("conversation_participants").select("conversation_id").eq("profile_id", user.id).execute()
    memberships: list[dict[str, Any]] = cast(list[dict[str, Any]], _mem_res.data or [])
    conv_ids = [m["conversation_id"] for m in memberships]
    if not conv_ids:
        return []
    result = (
        admin.table("conversations")
        .select("*, conversation_participants(profile_id, last_read_at, profiles(id, full_name, avatar_url))")
        .in_("id", conv_ids)
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data or []


def create_conversation(recipient_id: str) -> dict:
    user = get_current_user()
    admin = get_admin_db_client()
    _part_res = admin.table("conversation_participants").select("conversation_id").eq("profile_id", user.id).execute()
    my_participations: list[dict[str, Any]] = cast(list[dict[str, Any]], _part_res.data or [])
    my_conv_ids = [p["conversation_id"] for p in my_participations]

    if my_conv_ids:
        _shared_res = admin.table("conversation_participants").select("conversation_id").eq("profile_id", recipient_id).in_("conversation_id", my_conv_ids).execute()
        shared: list[dict[str, Any]] = cast(list[dict[str, Any]], _shared_res.data or [])
        for row in shared:
            _conv_res = admin.table("conversations").select("id").eq("id", row["conversation_id"]).eq("is_group", False).maybe_single().execute()
            existing: dict[str, Any] | None = cast(dict[str, Any], _conv_res.data) if _conv_res is not None and _conv_res.data is not None else None
            if existing:
                return {"id": existing["id"]}

    _new_res = admin.table("conversations").insert({"created_by": user.id, "is_group": False}).select().execute()
    new_conv: dict[str, Any] = cast(dict[str, Any], _new_res.data[0])
    admin.table("conversation_participants").insert([
        {"conversation_id": new_conv["id"], "profile_id": user.id},
        {"conversation_id": new_conv["id"], "profile_id": recipient_id},
    ]).execute()
    return {"id": new_conv["id"]}


def is_member(conversation_id: str) -> bool:
    user = get_current_user()
    result = (
        get_admin_db_client()
        .table("conversation_participants")
        .select("conversation_id")
        .eq("conversation_id", conversation_id)
        .eq("profile_id", user.id)
        .maybe_single()
        .execute()
    )
    data = result.data if result is not None else None
    return data is not None


def list_messages(conversation_id: str, limit: int = 50) -> list:
    result = (
        get_db().table("messages")
        .select("*, profiles!sender_id(id, full_name, avatar_url)")
        .eq("conversation_id", conversation_id)
        .order("created_at")
        .limit(limit)
        .execute()
    )
    return result.data or []


def send_message(conversation_id: str, content: str) -> Message:
    user = get_current_user()
    result = (
        get_db().table("messages")
        .insert({"conversation_id": conversation_id, "sender_id": user.id, "content": content, "message_type": "text"})
        .select("*, profiles!sender_id(id, full_name, avatar_url)")
        .maybe_single()
        .execute()
    )
    return Message.model_validate(result.data)


def mark_conversation_read(conversation_id: str) -> None:
    user = get_current_user()
    get_db().table("conversation_participants").update({"last_read_at": datetime.now(timezone.utc).isoformat()}).eq("conversation_id", conversation_id).eq("profile_id", user.id).execute()


def list_recipients() -> list:
    user = get_current_user()
    db = get_db()
    _profile_res = db.table("profiles").select("role").eq("id", user.id).maybe_single().execute()
    profile: dict[str, Any] = cast(dict[str, Any], (_profile_res.data if _profile_res is not None else None) or {})
    role = profile.get("role")

    if role == "admin":
        result = db.table("profiles").select("id, full_name, avatar_url, role").eq("is_active", True).neq("id", user.id).order("full_name").execute()
        return result.data or []

    admin = get_admin_db_client()

    if role == "customer":
        _apts_res = admin.table("appointments").select("staff_profile_id, staff_profiles(profile_id)").eq("client_id", user.id).execute()
        apts: list[dict[str, Any]] = cast(list[dict[str, Any]], _apts_res.data or [])
        staff_profile_ids = [str(a["staff_profiles"]["profile_id"]) for a in apts if a.get("staff_profiles")]
        or_filter = f"role.eq.admin,id.in.({','.join(staff_profile_ids)})" if staff_profile_ids else "role.eq.admin"
    else:
        _sp_res = admin.table("staff_profiles").select("id").eq("profile_id", user.id).maybe_single().execute()
        sp: dict[str, Any] | None = cast(dict[str, Any], _sp_res.data) if _sp_res is not None and _sp_res.data is not None else None
        if sp:
            _apts_res2 = admin.table("appointments").select("client_id").eq("staff_profile_id", sp["id"]).execute()
            client_ids = [str(a["client_id"]) for a in cast(list[dict[str, Any]], _apts_res2.data or [])]
        else:
            client_ids = []
        or_filter = f"role.eq.admin,id.in.({','.join(client_ids)})" if client_ids else "role.eq.admin"

    result = db.table("profiles").select("id, full_name, avatar_url, role").eq("is_active", True).neq("id", user.id).or_(or_filter).order("full_name").execute()
    return result.data or []
