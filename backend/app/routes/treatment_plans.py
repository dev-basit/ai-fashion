from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import AuthContext, get_auth
from app.services import treatment_plans as tp_svc

router = APIRouter(tags=["treatment_plans"])


@router.get("/templates")
def list_templates(auth: AuthContext = Depends(get_auth)):
    return {"data": tp_svc.list_templates(auth.supabase)}


@router.post("/templates")
def create_template(body: dict, auth: AuthContext = Depends(get_auth)):
    data = tp_svc.create_template(auth.supabase, body)
    return {"data": data}


@router.get("/templates/{template_id}")
def get_template(template_id: str, auth: AuthContext = Depends(get_auth)):
    data = tp_svc.get_template(auth.supabase, template_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/templates/{template_id}")
def update_template(template_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = tp_svc.update_template(auth.supabase, template_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.get("")
def list_plans(
    client_id: Optional[str] = Query(None, alias="clientId"),
    auth: AuthContext = Depends(get_auth),
):
    profile = auth.supabase.table("profiles").select("role").eq("id", auth.user.id).single().execute()
    role = (profile.data or {}).get("role", "customer")
    return {"data": tp_svc.list_plans(auth.supabase, auth.user.id, role, client_id=client_id)}


@router.post("")
def create_plan(body: dict, auth: AuthContext = Depends(get_auth)):
    profile = auth.supabase.table("profiles").select("role").eq("id", auth.user.id).single().execute()
    role = (profile.data or {}).get("role", "customer")
    if role == "customer":
        raise HTTPException(status_code=403, detail="Forbidden")
    data = tp_svc.create_plan(auth.supabase, body)
    return {"data": data}


@router.get("/{plan_id}")
def get_plan(plan_id: str, auth: AuthContext = Depends(get_auth)):
    data = tp_svc.get_plan(auth.supabase, plan_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{plan_id}")
def update_plan(plan_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = tp_svc.update_plan(auth.supabase, plan_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}
