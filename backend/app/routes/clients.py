from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.services import clients as clients_svc

router = APIRouter(tags=["clients"])


@router.get("/appointment-counts")
def get_appointment_counts():
    data = clients_svc.get_appointment_counts()
    return {"data": data}


@router.get("")
def list_clients(
    search: Optional[str] = Query(None),
):
    return {"data": clients_svc.list_clients(search=search)}


@router.post("")
def create_client(body: dict):
    if not body.get("email") or not body.get("password") or not body.get("full_name"):
        raise HTTPException(status_code=400, detail="email, password and full_name are required")
    data = clients_svc.create_client(body)
    return {"data": data}


@router.get("/{client_id}")
def get_client(client_id: str):
    data = clients_svc.get_client(client_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{client_id}")
def update_client(client_id: str, body: dict):
    data = clients_svc.update_client(client_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/{client_id}")
def deactivate_client(client_id: str):
    clients_svc.deactivate_client(client_id)
    return {"success": True}


@router.get("/{client_id}/history")
def get_client_history(client_id: str):
    data = clients_svc.get_client_history(client_id)
    return {"data": data}
