from pydantic import BaseModel
from typing import Optional


class ProductCategory(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    parent_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class Product(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    category_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    price: float
    cost_price: Optional[float] = None
    stock_quantity: int
    low_stock_threshold: int
    image_url: Optional[str] = None
    is_active: bool
    is_for_sale: bool
    created_at: str
    updated_at: str
    product_categories: Optional[ProductCategory] = None
