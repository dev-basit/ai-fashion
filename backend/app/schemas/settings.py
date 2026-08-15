from pydantic import BaseModel
from typing import Optional


class BusinessSetting(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    key: str
    value: dict
    updated_by: Optional[str] = None
    updated_at: str
