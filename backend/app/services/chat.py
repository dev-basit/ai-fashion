from datetime import datetime, timezone

from app.core.context import get_db, get_current_user
from app.core.supabase import get_admin_client


def list_conversations() -> list:
    user = get_current_user()
    admin = get_admin_client()
    memberships = admin.table("conversation_participants").select("conversation_id").eq("profile_id", user.id).execute().data or []
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
    admin = get_admin_client()
    my_participations = admin.table("conversation_participants").select("conversation_id").eq("profile_id", user.id).execute().data or []
    my_conv_ids = [p["conversation_id"] for p in my_participations]

    if my_conv_ids:
        shared = admin.table("conversation_participants").select("conversation_id").eq("profile_id", recipient_id).in_("conversation_id", my_conv_ids).execute().data or []
        for row in shared:
            conv = admin.table("conversations").select("id").eq("id", row["conversation_id"]).eq("is_group", False).maybe_single().execute().data
            if conv:
                return {"id": conv["id"]}

    conv = admin.table("conversations").insert({"created_by": user.id, "is_group": False}).select().single().execute().data
    admin.table("conversation_participants").insert([
        {"conversation_id": conv["id"], "profile_id": user.id},
        {"conversation_id": conv["id"], "profile_id": recipient_id},
    ]).execute()
    return {"id": conv["id"]}


def is_member(conversation_id: str) -> bool:
    user = get_current_user()
    data = (
        get_admin_client()
        .table("conversation_participants")
        .select("conversation_id")
        .eq("conversation_id", conversation_id)
        .eq("profile_id", user.id)
        .maybe_single()
        .execute()
        .data
    )
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


def send_message(conversation_id: str, content: str) -> dict:
    user = get_current_user()
    result = (
        get_db().table("messages")
        .insert({"conversation_id": conversation_id, "sender_id": user.id, "content": content, "message_type": "text"})
        .select("*, profiles!sender_id(id, full_name, avatar_url)")
        .single()
        .execute()
    )
    return result.data


def mark_conversation_read(conversation_id: str) -> None:
    user = get_current_user()
    get_db().table("conversation_participants").update({"last_read_at": datetime.now(timezone.utc).isoformat()}).eq("conversation_id", conversation_id).eq("profile_id", user.id).execute()


def list_recipients() -> list:
    user = get_current_user()
    db = get_db()
    profile = db.table("profiles").select("role").eq("id", user.id).single().execute().data or {}
    role = profile.get("role")

    if role == "admin":
        result = db.table("profiles").select("id, full_name, avatar_url, role").eq("is_active", True).neq("id", user.id).order("full_name").execute()
        return result.data or []

    admin = get_admin_client()

    if role == "customer":
        apts = admin.table("appointments").select("staff_profile_id, staff_profiles(profile_id)").eq("client_id", user.id).execute().data or []
        staff_profile_ids = [a["staff_profiles"]["profile_id"] for a in apts if a.get("staff_profiles")]
        or_filter = f"role.eq.admin,id.in.({','.join(staff_profile_ids)})" if staff_profile_ids else "role.eq.admin"
    else:
        sp = admin.table("staff_profiles").select("id").eq("profile_id", user.id).maybe_single().execute().data
        if sp:
            client_ids = [a["client_id"] for a in (admin.table("appointments").select("client_id").eq("staff_profile_id", sp["id"]).execute().data or [])]
        else:
            client_ids = []
        or_filter = f"role.eq.admin,id.in.({','.join(client_ids)})" if client_ids else "role.eq.admin"

    result = db.table("profiles").select("id, full_name, avatar_url, role").eq("is_active", True).neq("id", user.id).or_(or_filter).order("full_name").execute()
    return result.data or []
