from pydantic import BaseModel
from typing import Optional


class Profile(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    role: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: str
    updated_at: str
