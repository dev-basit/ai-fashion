from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import AuthContext, get_auth
from app.services import salon_services as svc

router = APIRouter(tags=["services"])


@router.get("")
def list_services(auth: AuthContext = Depends(get_auth)):
    return {"data": svc.list_services(auth.supabase)}


@router.post("")
def create_service(body: dict, auth: AuthContext = Depends(get_auth)):
    data = svc.create_service(auth.supabase, body)
    return {"data": data}


@router.get("/categories")
def list_categories(auth: AuthContext = Depends(get_auth)):
    return {"data": svc.list_categories(auth.supabase)}


@router.post("/categories")
def create_category(body: dict, auth: AuthContext = Depends(get_auth)):
    data = svc.create_category(auth.supabase, body)
    return {"data": data}


@router.patch("/categories/{category_id}")
def update_category(category_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = svc.update_category(auth.supabase, category_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/categories/{category_id}")
def delete_category(category_id: str, auth: AuthContext = Depends(get_auth)):
    svc.delete_category(auth.supabase, category_id)
    return {"success": True}


@router.patch("/variants/{variant_id}")
def update_variant(variant_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = svc.update_variant(auth.supabase, variant_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/variants/{variant_id}")
def delete_variant(variant_id: str, auth: AuthContext = Depends(get_auth)):
    svc.delete_variant(auth.supabase, variant_id)
    return {"success": True}


@router.get("/{service_id}")
def get_service(service_id: str, auth: AuthContext = Depends(get_auth)):
    data = svc.get_service(auth.supabase, service_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{service_id}")
def update_service(service_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = svc.update_service(auth.supabase, service_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/{service_id}")
def delete_service(service_id: str, auth: AuthContext = Depends(get_auth)):
    svc.delete_service(auth.supabase, service_id)
    return {"success": True}


@router.get("/{service_id}/variants")
def list_variants(service_id: str, auth: AuthContext = Depends(get_auth)):
    return {"data": svc.list_variants(auth.supabase, service_id)}


@router.post("/{service_id}/variants")
def create_variant(service_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = svc.create_variant(auth.supabase, service_id, body)
    return {"data": data}
