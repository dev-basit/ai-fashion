from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import AuthContext, get_auth
from app.services import orders as orders_svc

router = APIRouter(tags=["orders"])


@router.get("")
def list_orders(
    client_id: Optional[str] = Query(None, alias="clientId"),
    auth: AuthContext = Depends(get_auth),
):
    profile = auth.supabase.table("profiles").select("role").eq("id", auth.user.id).single().execute()
    role = (profile.data or {}).get("role", "customer")
    return {"data": orders_svc.list_orders(auth.supabase, auth.user.id, role, client_id=client_id)}


@router.post("")
def create_order(body: dict, auth: AuthContext = Depends(get_auth)):
    data = orders_svc.create_order(auth.supabase, body)
    return {"data": data}


@router.get("/{order_id}")
def get_order(order_id: str, auth: AuthContext = Depends(get_auth)):
    data = orders_svc.get_order(auth.supabase, order_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{order_id}")
def update_order(order_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = orders_svc.update_order(auth.supabase, order_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}
