from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import AuthContext, get_auth
from app.services import appointments as appts_svc

router = APIRouter(tags=["appointments"])


@router.get("/stats")
def get_stats(auth: AuthContext = Depends(get_auth)):
    return {"data": appts_svc.get_stats(auth.supabase)}


@router.get("")
def list_appointments(
    client_id: Optional[str] = Query(None, alias="clientId"),
    staff_profile_id: Optional[str] = Query(None, alias="staffProfileId"),
    service_id: Optional[str] = Query(None, alias="serviceId"),
    status: Optional[str] = Query(None),
    from_: Optional[str] = Query(None, alias="from"),
    to: Optional[str] = Query(None),
    auth: AuthContext = Depends(get_auth),
):
    data = appts_svc.list_appointments(
        auth.supabase,
        client_id=client_id,
        staff_profile_id=staff_profile_id,
        service_id=service_id,
        status=status,
        from_=from_,
        to=to,
    )
    return {"data": data}


@router.post("")
def create_appointment(body: dict, auth: AuthContext = Depends(get_auth)):
    try:
        data = appts_svc.create_appointment(auth.supabase, auth.user.id, body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"data": data}


@router.get("/products/{product_id}")
def remove_appointment_product(product_id: str, auth: AuthContext = Depends(get_auth)):
    raise HTTPException(status_code=405, detail="Method not allowed")


@router.delete("/products/{product_id}")
def delete_appointment_product(product_id: str, auth: AuthContext = Depends(get_auth)):
    appts_svc.remove_appointment_product(auth.supabase, product_id)
    return {"success": True}


@router.get("/{appointment_id}")
def get_appointment(appointment_id: str, auth: AuthContext = Depends(get_auth)):
    data = appts_svc.get_appointment(auth.supabase, appointment_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{appointment_id}")
def update_appointment(appointment_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = appts_svc.update_appointment(auth.supabase, appointment_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: str, auth: AuthContext = Depends(get_auth)):
    appts_svc.delete_appointment(auth.supabase, appointment_id)
    return {"success": True}


@router.get("/{appointment_id}/products")
def get_appointment_products(appointment_id: str, auth: AuthContext = Depends(get_auth)):
    return {"data": appts_svc.get_appointment_products(auth.supabase, appointment_id)}


@router.post("/{appointment_id}/products")
def add_appointment_product(appointment_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    data = appts_svc.add_appointment_product(auth.supabase, appointment_id, body)
    return {"data": data}
