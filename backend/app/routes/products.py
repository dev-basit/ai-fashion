from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.services import products as products_svc

router = APIRouter(tags=["products"])


@router.get("/categories")
def list_product_categories():
    return {"data": products_svc.list_product_categories()}


@router.post("/categories")
def create_product_category(body: dict):
    data = products_svc.create_product_category(body)
    return {"data": data}


@router.get("/low-stock")
def get_low_stock():
    return {"data": products_svc.get_low_stock_products()}


@router.get("")
def list_products(
    search: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None, alias="categoryId"),
):
    return {"data": products_svc.list_products(search=search, category_id=category_id)}


@router.post("")
def create_product(body: dict):
    data = products_svc.create_product(body)
    return {"data": data}


@router.get("/{product_id}")
def get_product(product_id: str):
    data = products_svc.get_product(product_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{product_id}")
def update_product(product_id: str, body: dict):
    data = products_svc.update_product(product_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/{product_id}")
def delete_product(product_id: str):
    products_svc.delete_product(product_id)
    return {"success": True}
