from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import AuthContext, get_auth
from app.services import consultation as consultation_svc

router = APIRouter(tags=["consultation"])


@router.get("/templates")
def list_templates(auth: AuthContext = Depends(get_auth)):
    return {"data": consultation_svc.list_templates(auth.supabase)}


@router.post("/templates")
def create_template(body: dict, auth: AuthContext = Depends(get_auth)):
    data = consultation_svc.create_template(auth.supabase, body)
    return {"data": data}


@router.get("/templates/{template_id}")
def get_template(template_id: str, auth: AuthContext = Depends(get_auth)):
    data = consultation_svc.get_template(auth.supabase, template_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/templates/{template_id}")
def update_template(template_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = consultation_svc.update_template(auth.supabase, template_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.get("/records")
def list_records(
    client_id: Optional[str] = Query(None, alias="clientId"),
    staff_profile_id: Optional[str] = Query(None, alias="staffProfileId"),
    auth: AuthContext = Depends(get_auth),
):
    return {"data": consultation_svc.list_records(auth.supabase, client_id=client_id, staff_profile_id=staff_profile_id)}


@router.post("/records")
def create_record(body: dict, auth: AuthContext = Depends(get_auth)):
    data = consultation_svc.create_record(auth.supabase, auth.user.id, body)
    return {"data": data}


@router.get("/records/{record_id}")
def get_record(record_id: str, auth: AuthContext = Depends(get_auth)):
    data = consultation_svc.get_record(auth.supabase, record_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/records/{record_id}")
def update_record(record_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = consultation_svc.update_record(auth.supabase, record_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}
