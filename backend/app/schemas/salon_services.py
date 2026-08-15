from pydantic import BaseModel
from typing import Optional


class ServiceVariant(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    service_id: str
    name: str
    price_modifier: float
    duration_modifier: float
    is_active: bool
    created_at: str


class ServiceCategory(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    parent_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: str
    updated_at: str


class Service(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    category_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    base_price: float
    duration_mins: int
    image_url: Optional[str] = None
    instructions: Optional[str] = None
    is_active: bool
    sort_order: int
    created_at: str
    updated_at: str
    service_categories: Optional[ServiceCategory] = None
    service_variants: Optional[list[ServiceVariant]] = None
