from fastapi import APIRouter, HTTPException
from app.services import salon_services as svc

router = APIRouter(tags=["services"])


@router.get("")
def list_services():
    return {"data": svc.list_services()}


@router.post("")
def create_service(body: dict):
    data = svc.create_service(body)
    return {"data": data}


@router.get("/categories")
def list_categories():
    return {"data": svc.list_categories()}


@router.post("/categories")
def create_category(body: dict):
    data = svc.create_category(body)
    return {"data": data}


@router.patch("/categories/{category_id}")
def update_category(category_id: str, body: dict):
    data = svc.update_category(category_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/categories/{category_id}")
def delete_category(category_id: str):
    svc.delete_category(category_id)
    return {"success": True}


@router.patch("/variants/{variant_id}")
def update_variant(variant_id: str, body: dict):
    data = svc.update_variant(variant_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/variants/{variant_id}")
def delete_variant(variant_id: str):
    svc.delete_variant(variant_id)
    return {"success": True}


@router.get("/{service_id}")
def get_service(service_id: str):
    data = svc.get_service(service_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{service_id}")
def update_service(service_id: str, body: dict):
    data = svc.update_service(service_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/{service_id}")
def delete_service(service_id: str):
    svc.delete_service(service_id)
    return {"success": True}


@router.get("/{service_id}/variants")
def list_variants(service_id: str):
    return {"data": svc.list_variants(service_id)}


@router.post("/{service_id}/variants")
def create_variant(service_id: str, body: dict):
    data = svc.create_variant(service_id, body)
    return {"data": data}
