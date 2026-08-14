from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import AuthContext, get_auth
from app.services import chat as chat_svc

router = APIRouter(tags=["chat"])


@router.get("/recipients")
def list_recipients(auth: AuthContext = Depends(get_auth)):
    return {"data": chat_svc.list_recipients(auth.supabase, auth.user.id)}


@router.get("/conversations")
def list_conversations(auth: AuthContext = Depends(get_auth)):
    return {"data": chat_svc.list_conversations(auth.user.id)}


@router.post("/conversations")
def create_conversation(body: dict, auth: AuthContext = Depends(get_auth)):
    recipient_id = body.get("recipientId")
    if not recipient_id:
        raise HTTPException(status_code=400, detail="recipientId is required")
    data = chat_svc.create_conversation(auth.user.id, recipient_id)
    return {"data": data}


@router.get("/conversations/{conversation_id}/messages")
def list_messages(
    conversation_id: str,
    limit: int = Query(50),
    auth: AuthContext = Depends(get_auth),
):
    if not chat_svc.is_member(conversation_id, auth.user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"data": chat_svc.list_messages(auth.supabase, conversation_id, limit=limit)}


@router.post("/conversations/{conversation_id}/messages")
def send_message(conversation_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    if not chat_svc.is_member(conversation_id, auth.user.id):
        raise HTTPException(status_code=403, detail="Forbidden")
    data = chat_svc.send_message(auth.supabase, conversation_id, auth.user.id, body["content"])
    return {"data": data}


@router.post("/conversations/{conversation_id}/read")
def mark_read(conversation_id: str, auth: AuthContext = Depends(get_auth)):
    chat_svc.mark_conversation_read(auth.supabase, conversation_id, auth.user.id)
    return {"success": True}
