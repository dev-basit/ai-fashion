from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services import chat as chat_svc

router = APIRouter(tags=["chat"])


@router.get("/recipients")
def list_recipients():
    return {"data": chat_svc.list_recipients()}


@router.get("/conversations")
def list_conversations():
    return {"data": chat_svc.list_conversations()}


@router.post("/conversations")
def create_conversation(body: dict):
    recipient_id = body.get("recipientId")
    if not recipient_id:
        raise HTTPException(status_code=400, detail="recipientId is required")
    data = chat_svc.create_conversation(recipient_id)
    return {"data": data}


@router.get("/conversations/{conversation_id}/messages")
def list_messages(
    conversation_id: str,
    limit: int = Query(50),
):
    if not chat_svc.is_member(conversation_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"data": chat_svc.list_messages(conversation_id, limit=limit)}


@router.post("/conversations/{conversation_id}/messages")
def send_message(conversation_id: str, body: dict):
    if not chat_svc.is_member(conversation_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    data = chat_svc.send_message(conversation_id, body["content"])
    return {"data": data}


@router.post("/conversations/{conversation_id}/read")
def mark_read(conversation_id: str):
    chat_svc.mark_conversation_read(conversation_id)
    return {"success": True}
