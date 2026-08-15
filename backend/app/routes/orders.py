from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services import orders as orders_svc

router = APIRouter(tags=["orders"])


@router.get("")
def list_orders(
    client_id: Optional[str] = Query(None, alias="clientId"),
):
    return {"data": orders_svc.list_orders(client_id=client_id)}


@router.post("")
def create_order(body: dict):
    data = orders_svc.create_order(body)
    return {"data": data}


@router.get("/{order_id}")
def get_order(order_id: str):
    data = orders_svc.get_order(order_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{order_id}")
def update_order(order_id: str, body: dict):
    data = orders_svc.update_order(order_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}
