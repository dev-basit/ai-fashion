from typing import Any, Optional, cast
from fastapi import APIRouter, HTTPException, Query
from app.core.context import get_current_user, get_db
from app.services import treatment_plans as tp_svc

router = APIRouter(tags=["treatment_plans"])


@router.get("/templates")
def list_templates():
    return {"data": tp_svc.list_templates()}


@router.post("/templates")
def create_template(body: dict):
    data = tp_svc.create_template(body)
    return {"data": data}


@router.get("/templates/{template_id}")
def get_template(template_id: str):
    data = tp_svc.get_template(template_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/templates/{template_id}")
def update_template(template_id: str, body: dict):
    data = tp_svc.update_template(template_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.get("")
def list_plans(
    client_id: Optional[str] = Query(None, alias="clientId"),
):
    return {"data": tp_svc.list_plans(client_id=client_id)}


@router.post("")
def create_plan(body: dict):
    user = get_current_user()
    profile = get_db().table("profiles").select("role").eq("id", user.id).maybe_single().execute()
    profile_dict: dict[str, Any] = cast(dict[str, Any], profile.data) if profile is not None and profile.data else {}
    role: str = str(profile_dict.get("role") or "customer")
    if role == "customer":
        raise HTTPException(status_code=403, detail="Forbidden")
    data = tp_svc.create_plan(body)
    return {"data": data}


@router.get("/{plan_id}")
def get_plan(plan_id: str):
    data = tp_svc.get_plan(plan_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{plan_id}")
def update_plan(plan_id: str, body: dict):
    data = tp_svc.update_plan(plan_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}
