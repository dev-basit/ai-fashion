from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query

from app.core.auth import AuthContext, get_auth
from app.services import staff as staff_svc

router = APIRouter(tags=["staff"])


@router.get("")
def list_staff(
    profile_id: Optional[str] = Query(None, alias="profileId"),
    auth: AuthContext = Depends(get_auth),
):
    return {"data": staff_svc.list_staff(auth.supabase, profile_id=profile_id)}


@router.post("")
def create_staff(body: dict, auth: AuthContext = Depends(get_auth)):
    if not body.get("email") or not body.get("password") or not body.get("full_name"):
        raise HTTPException(status_code=400, detail="email, password and full_name are required")
    data = staff_svc.create_staff(body)
    return {"data": data}


@router.get("/{staff_id}")
def get_staff(staff_id: str, auth: AuthContext = Depends(get_auth)):
    data = staff_svc.get_staff(auth.supabase, staff_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{staff_id}")
def update_staff(staff_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = staff_svc.update_staff(auth.supabase, staff_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.get("/{staff_id}/schedule")
def get_schedule(staff_id: str, auth: AuthContext = Depends(get_auth)):
    return {"data": staff_svc.get_schedule(auth.supabase, staff_id)}


@router.put("/{staff_id}/schedule")
def update_schedule(staff_id: str, body: list = Body(...), auth: AuthContext = Depends(get_auth)):
    staff_svc.update_schedule(auth.supabase, staff_id, body)
    return {"success": True}


@router.get("/{staff_id}/leaves")
def get_leaves(staff_id: str, auth: AuthContext = Depends(get_auth)):
    return {"data": staff_svc.get_leaves(auth.supabase, staff_id)}


@router.post("/{staff_id}/leaves")
def create_leave(staff_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = staff_svc.create_leave(auth.supabase, staff_id, body)
    return {"data": data}


@router.delete("/{staff_id}/leaves/{leave_id}")
def delete_leave(staff_id: str, leave_id: str, auth: AuthContext = Depends(get_auth)):
    staff_svc.delete_leave(auth.supabase, staff_id, leave_id)
    return {"success": True}


@router.get("/{staff_id}/services")
def get_staff_services(staff_id: str, auth: AuthContext = Depends(get_auth)):
    return {"data": staff_svc.get_staff_services(auth.supabase, staff_id)}


@router.post("/{staff_id}/services")
def add_staff_service(staff_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    staff_svc.add_staff_service(auth.supabase, staff_id, body["service_id"])
    return {"success": True}


@router.delete("/{staff_id}/services/{service_id}")
def remove_staff_service(staff_id: str, service_id: str, auth: AuthContext = Depends(get_auth)):
    staff_svc.remove_staff_service(auth.supabase, staff_id, service_id)
    return {"success": True}
