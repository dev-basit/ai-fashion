import json
from typing import Annotated, Optional
from langchain_core.tools import tool

from app.config.settings import settings
from app.services import products as products_svc


@tool
def list_products(
    search: Annotated[Optional[str], "Search products by name"] = None,
    category_id: Annotated[Optional[str], "Filter by product category UUID"] = None,
) -> str:
    """List available products. Optionally search by name or filter by category."""
    data = products_svc.list_products(search=search, category_id=category_id)
    if not data:
        return "No products found."
    return json.dumps(
        [{"id": p["id"], "name": p["name"], "category": (p.get("product_categories") or {}).get("name"), "price": p.get("price"), "stock_quantity": p.get("stock_quantity"), "description": p.get("description")} for p in data],
        indent=2,
    )


@tool
def create_product(
    name: Annotated[str, "Product name"],
    price: Annotated[float, "Product price"],
    stock_quantity: Annotated[int, "Initial stock quantity"],
    description: Annotated[Optional[str], "Product description"] = None,
    category_id: Annotated[Optional[str], "UUID of the product category"] = None,
) -> str:
    """Create a new product. Admin only."""
    try:
        products_svc.create_product({"name": name, "price": price, "stock_quantity": stock_quantity, "description": description, "category_id": category_id})
        return f"Product \"{name}\" created successfully."
    except Exception as e:
        return f"Failed to create product: {e}"


@tool
def update_product(
    product_id: Annotated[str, "UUID of the product to update"],
    name: Annotated[Optional[str], "New name"] = None,
    description: Annotated[Optional[str], "New description"] = None,
    price: Annotated[Optional[float], "New price"] = None,
    stock_quantity: Annotated[Optional[int], "New stock quantity"] = None,
    is_active: Annotated[Optional[bool], "Set false to deactivate"] = None,
) -> str:
    """Update an existing product. Admin only."""
    try:
        body = {k: v for k, v in {"name": name, "description": description, "price": price, "stock_quantity": stock_quantity, "is_active": is_active}.items() if v is not None}
        products_svc.update_product(product_id, body)
        return f"Product {product_id} updated successfully."
    except Exception as e:
        return f"Failed to update product: {e}"


@tool
def delete_product(
    product_id: Annotated[str, "UUID of the product to delete"],
) -> str:
    """Permanently delete a product. Admin only. Ask for confirmation before proceeding."""
    try:
        products_svc.delete_product(product_id)
        return f"Product {product_id} deleted permanently."
    except Exception as e:
        return f"Failed to delete product: {e}"


shared_product_tools = [list_products]
admin_product_tools = [*shared_product_tools, create_product, update_product, delete_product]
