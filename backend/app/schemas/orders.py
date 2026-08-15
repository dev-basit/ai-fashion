from pydantic import BaseModel
from typing import Optional


class OrderItem(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    order_id: str
    product_id: str
    quantity: int
    unit_price: float
    created_at: str
    products: Optional[dict] = None


class Order(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    client_id: str
    status: str
    total_amount: float
    shipping_address: Optional[dict] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str
    profiles: Optional[dict] = None
    order_items: Optional[list[OrderItem]] = None
