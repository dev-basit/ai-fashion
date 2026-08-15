from pydantic import BaseModel
from typing import Optional


class Notification(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    profile_id: str
    type: str
    title: str
    body: Optional[str] = None
    data: Optional[dict] = None
    is_read: bool
    created_at: str
