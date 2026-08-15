from pydantic import BaseModel
from typing import Optional


class AiConversation(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    user_id: str
    title: Optional[str] = None
    created_at: str
    updated_at: str


class AiMessage(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    ai_conversation_id: str
    role: str
    content: str
    created_at: str
