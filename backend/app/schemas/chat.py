from pydantic import BaseModel
from typing import Optional


class Message(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    conversation_id: str
    sender_id: str
    content: str
    message_type: str
    metadata: Optional[dict] = None
    is_edited: bool
    edited_at: Optional[str] = None
    created_at: str
    profiles: Optional[dict] = None


class Conversation(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    title: Optional[str] = None
    is_group: bool
    created_by: Optional[str] = None
    created_at: str
    updated_at: str
    conversation_participants: Optional[list[dict]] = None
