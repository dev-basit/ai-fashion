from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import AuthContext, get_auth
from app.services import products as products_svc

router = APIRouter(tags=["products"])


@router.get("/categories")
def list_product_categories(auth: AuthContext = Depends(get_auth)):
    return {"data": products_svc.list_product_categories(auth.supabase)}


@router.post("/categories")
def create_product_category(body: dict, auth: AuthContext = Depends(get_auth)):
    data = products_svc.create_product_category(auth.supabase, body)
    return {"data": data}


@router.get("/low-stock")
def get_low_stock(auth: AuthContext = Depends(get_auth)):
    return {"data": products_svc.get_low_stock_products()}


@router.get("")
def list_products(
    search: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None, alias="categoryId"),
    auth: AuthContext = Depends(get_auth),
):
    return {"data": products_svc.list_products(auth.supabase, search=search, category_id=category_id)}


@router.post("")
def create_product(body: dict, auth: AuthContext = Depends(get_auth)):
    data = products_svc.create_product(auth.supabase, body)
    return {"data": data}


@router.get("/{product_id}")
def get_product(product_id: str, auth: AuthContext = Depends(get_auth)):
    data = products_svc.get_product(auth.supabase, product_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{product_id}")
def update_product(product_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = products_svc.update_product(auth.supabase, product_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/{product_id}")
def delete_product(product_id: str, auth: AuthContext = Depends(get_auth)):
    products_svc.delete_product(auth.supabase, product_id)
    return {"success": True}
