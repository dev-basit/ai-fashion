from typing import Optional
from fastapi import APIRouter, Body, HTTPException, Query
from app.services import staff as staff_svc

router = APIRouter(tags=["staff"])


@router.get("")
def list_staff(
    profile_id: Optional[str] = Query(None, alias="profileId"),
):
    return {"data": staff_svc.list_staff(profile_id=profile_id)}


@router.post("")
def create_staff(body: dict):
    if not body.get("email") or not body.get("password") or not body.get("full_name"):
        raise HTTPException(status_code=400, detail="email, password and full_name are required")
    data = staff_svc.create_staff(body)
    return {"data": data}


@router.get("/{staff_id}")
def get_staff(staff_id: str):
    data = staff_svc.get_staff(staff_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{staff_id}")
def update_staff(staff_id: str, body: dict):
    data = staff_svc.update_staff(staff_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.get("/{staff_id}/schedule")
def get_schedule(staff_id: str):
    return {"data": staff_svc.get_schedule(staff_id)}


@router.put("/{staff_id}/schedule")
def update_schedule(staff_id: str, body: list = Body(...)):
    staff_svc.update_schedule(staff_id, body)
    return {"success": True}


@router.get("/{staff_id}/leaves")
def get_leaves(staff_id: str):
    return {"data": staff_svc.get_leaves(staff_id)}


@router.post("/{staff_id}/leaves")
def create_leave(staff_id: str, body: dict):
    data = staff_svc.create_leave(staff_id, body)
    return {"data": data}


@router.delete("/{staff_id}/leaves/{leave_id}")
def delete_leave(staff_id: str, leave_id: str):
    staff_svc.delete_leave(staff_id, leave_id)
    return {"success": True}


@router.get("/{staff_id}/services")
def get_staff_services(staff_id: str):
    return {"data": staff_svc.get_staff_services(staff_id)}


@router.post("/{staff_id}/services")
def add_staff_service(staff_id: str, body: dict):
    staff_svc.add_staff_service(staff_id, body["service_id"])
    return {"success": True}


@router.delete("/{staff_id}/services/{service_id}")
def remove_staff_service(staff_id: str, service_id: str):
    staff_svc.remove_staff_service(staff_id, service_id)
    return {"success": True}
