from datetime import date
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import AIMessage, HumanMessage

from app.config.settings import settings
from app.core.context import get_current_user, get_db, get_token
from app.services import ai_service

router = APIRouter(tags=["ai"])


@router.get("/conversations")
def list_conversations():
    return {"data": ai_service.list_conversations()}


@router.post("/conversations")
def create_conversation():
    data = ai_service.create_conversation()
    return {"data": data}


@router.get("/conversations/{conversation_id}/messages")
def get_conversation_messages(conversation_id: str):
    return {"data": ai_service.get_messages(conversation_id)}


@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str):
    count = ai_service.delete_conversation(conversation_id)
    if not count:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}


@router.post("/chat")
async def ai_chat(body: dict):
    message: str = body.get("message", "")
    conversation_id: str = body.get("conversationId", "")
    timezone_str: str = body.get("timezone", "UTC")

    if not message.strip():
        raise HTTPException(status_code=400, detail="Bad Request")
    if not conversation_id:
        raise HTTPException(status_code=400, detail="conversationId required")

    user = get_current_user()
    db = get_db()
    token = get_token()

    profile = db.table("profiles").select("role").eq("id", user.id).single().execute()
    profile_data = profile.data if profile is not None else None
    user_role: str = str((profile_data.get("role") or "customer") if isinstance(profile_data, dict) else "customer")

    today = date.today().isoformat()
    call_count, is_limited = ai_service.check_rate_limit(user.id, today)

    if is_limited:
        raise HTTPException(
            status_code=429,
            detail={"error": "rate_limit", "message": f"You've reached your daily limit of {settings.ai_daily_limit} AI calls. Resets at midnight.", "limit": settings.ai_daily_limit, "remaining": 0},
            headers={"X-RateLimit-Limit": str(settings.ai_daily_limit), "X-RateLimit-Remaining": "0"},
        )

    if not ai_service.verify_conversation_owner(conversation_id, user.id):
        raise HTTPException(status_code=404, detail="Conversation not found")

    history = ai_service.load_history(conversation_id)

    ai_service.increment_usage(user.id, today, call_count)
    ai_service.save_message(conversation_id, "user", message)

    if not history:
        ai_service.auto_title_conversation(conversation_id, message)

    messages = [
        *(HumanMessage(content=m["content"]) if m["role"] == "user" else AIMessage(content=m["content"]) for m in history),
        HumanMessage(content=message),
    ]

    remaining = settings.ai_daily_limit - (call_count + 1)

    async def generate():
        from app.ai.graph import graph
        full_response = ""
        try:
            async for chunk, meta in graph.astream(
                {"messages": messages, "user_role": user_role, "context": ""},
                config={"configurable": {"access_token": token, "user_id": user.id, "timezone": timezone_str}},
                stream_mode="messages",
            ):
                meta_dict: dict = meta if isinstance(meta, dict) else {}
                if meta_dict.get("langgraph_node") == "agent":
                    content = getattr(chunk, "content", None)
                    if isinstance(content, str) and content:
                        full_response += content
                        yield content
        except Exception:
            err = "Sorry, something went wrong. Please try again."
            full_response = err
            yield err
        finally:
            if full_response:
                ai_service.save_message(conversation_id, "assistant", full_response)

    return StreamingResponse(
        generate(),
        media_type="text/plain; charset=utf-8",
        headers={"X-RateLimit-Limit": str(settings.ai_daily_limit), "X-RateLimit-Remaining": str(remaining)},
    )
