from typing import Any, cast

from app.core.context import get_db, get_current_user
from app.core.supabase import get_admin_db_client
from app.config.settings import settings
from app.schemas.ai import AiConversation, AiMessage


def check_rate_limit(user_id: str, today: str) -> tuple[int, bool]:
    """Returns (call_count, is_limited)."""
    admin = get_admin_db_client()
    result = admin.table("ai_usage").select("call_count").eq("user_id", user_id).eq("date", today).maybe_single().execute()
    row: dict[str, Any] | None = cast(dict[str, Any], result.data) if result is not None and result.data is not None else None
    count: int = int(row["call_count"]) if row else 0
    return count, count >= settings.ai_daily_limit


def increment_usage(user_id: str, today: str, current_count: int) -> None:
    get_admin_db_client().table("ai_usage").upsert(
        {"user_id": user_id, "date": today, "call_count": current_count + 1},
        on_conflict="user_id,date",
    ).execute()


def list_conversations() -> list:
    user = get_current_user()
    result = (
        get_db().table("ai_conversations")
        .select("id, title, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data or []


def get_conversation(conversation_id: str) -> AiConversation | None:
    result = (
        get_db().table("ai_conversations")
        .select("id, title, created_at, updated_at")
        .eq("id", conversation_id)
        .maybe_single()
        .execute()
    )
    if result is None or result.data is None:
        return None
    return AiConversation.model_validate(result.data)


def create_conversation() -> AiConversation:
    user = get_current_user()
    result = (
        get_db().table("ai_conversations")
        .insert({"user_id": user.id})
        .select("id, title, created_at, updated_at")
        .single()
        .execute()
    )
    return AiConversation.model_validate(result.data)


def delete_conversation(conversation_id: str) -> int:
    result = get_db().table("ai_conversations").delete(count="exact").eq("id", conversation_id).execute()
    return result.count or 0


def load_history(conversation_id: str) -> list[dict[str, Any]]:
    admin = get_admin_db_client()
    result = (
        admin.table("ai_messages")
        .select("role, content")
        .eq("ai_conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    return cast(list[dict[str, Any]], result.data or [])


def save_message(conversation_id: str, role: str, content: str) -> None:
    get_admin_db_client().table("ai_messages").insert(
        {"ai_conversation_id": conversation_id, "role": role, "content": content}
    ).execute()


def auto_title_conversation(conversation_id: str, first_message: str) -> None:
    title = first_message[:50].strip()
    get_admin_db_client().table("ai_conversations").update({"title": title}).eq("id", conversation_id).execute()


def verify_conversation_owner(conversation_id: str, user_id: str) -> bool:
    result = (
        get_admin_db_client()
        .table("ai_conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    data = result.data if result is not None else None
    return data is not None


def get_messages(conversation_id: str) -> list:
    result = (
        get_db().table("ai_messages")
        .select("id, ai_conversation_id, role, content, created_at")
        .eq("ai_conversation_id", conversation_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


def match_documents(embedding: list[float], user_role: str, limit: int = 5) -> list[dict[str, Any]]:
    result = get_admin_db_client().rpc("match_documents", {
        "query_embedding": embedding,
        "match_threshold": 0.5,
        "match_count": limit,
        "user_role": user_role,
    }).execute()
    data = result.data if result is not None else None
    return cast(list[dict[str, Any]], data) if isinstance(data, list) else []
