from datetime import datetime, timedelta, timezone
from typing import Any, Optional, cast

from app.core.context import get_db
from app.core.notify import notify_admins, notify_user_and_admins
from app.core.supabase import get_admin_db_client
from app.schemas.appointments import AppointmentDetail


def list_appointments(
    client_id: Optional[str] = None,
    staff_profile_id: Optional[str] = None,
    service_id: Optional[str] = None,
    status: Optional[str] = None,
    from_: Optional[str] = None,
    to: Optional[str] = None,
) -> list:
    query = (
        get_db().table("appointments")
        .select("*, services(id, name, duration_mins, base_price), profiles!client_id(id, full_name), staff_profiles(id, profiles(id, full_name))")
        .order("starts_at", desc=True)
    )
    if client_id:
        query = query.eq("client_id", client_id)
    if staff_profile_id:
        query = query.eq("staff_profile_id", staff_profile_id)
    if service_id:
        query = query.eq("service_id", service_id)
    if status:
        query = query.eq("status", status)
    if from_:
        query = query.gte("starts_at", from_)
    if to:
        query = query.lte("starts_at", to)
    return query.execute().data or []


def get_appointment(appointment_id: str) -> AppointmentDetail | None:
    result = (
        get_db().table("appointments")
        .select("*, services(*), profiles!client_id(*), staff_profiles(*, profiles(*))")
        .eq("id", appointment_id)
        .maybe_single()
        .execute()
    )

    if result is None or result.data is None:
        return None

    return AppointmentDetail.model_validate(result.data)


def create_appointment(body: dict) -> dict:
    
    from app.core.context import get_current_user

    user_id = get_current_user().id
    profile = get_db().table("profiles").select("role").eq("id", user_id).single().execute()
    role = (profile.data or {}).get("role")

    client_id = user_id if role == "customer" else body.get("client_id")
    if not client_id:
        raise ValueError("client_id is required")

    ends_at = body.get("ends_at")
    price = body.get("price", 0)

    if body.get("service_id") and not ends_at:
        svc = get_db().table("services").select("duration_mins, base_price").eq("id", body["service_id"]).single().execute()
        if svc.data:
            start = datetime.fromisoformat(body["starts_at"])
            ends_at = (start + timedelta(minutes=svc.data.get("duration_mins") or 60)).isoformat()
            if not price:
                price = svc.data.get("base_price") or 0

    if not ends_at:
        raise ValueError("ends_at is required")

    result = (
        get_db().table("appointments")
        .insert({**body, "client_id": client_id, "ends_at": ends_at, "price": price})
        .select()
        .single()
        .execute()
    )
    apt = result.data

    svc_res = get_db().table("services").select("name").eq("id", apt["service_id"]).single().execute() if apt.get("service_id") else None
    client_res = get_db().table("profiles").select("full_name").eq("id", apt["client_id"]).single().execute()
    staff_res = get_db().table("staff_profiles").select("profile_id").eq("id", apt["staff_profile_id"]).single().execute() if apt.get("staff_profile_id") else None

    service_name = (svc_res.data or {}).get("name", "appointment") if svc_res else "appointment"
    client_name = (client_res.data or {}).get("full_name", "A client")
    staff_profile_id = (staff_res.data or {}).get("profile_id") if staff_res else None

    notify_user_and_admins(
        staff_profile_id,
        {"type": "appointment", "title": "New appointment booked",
         "body": f"{client_name} booked a {service_name} appointment.",
         "data": {"appointment_id": apt["id"]}},
        exclude_id=user_id,
    )

    return apt


def update_appointment(appointment_id: str, body: dict) -> dict | None:
    result = (
        get_db().table("appointments")
        .update(body)
        .eq("id", appointment_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def delete_appointment(appointment_id: str) -> None:
    get_db().table("appointments").delete().eq("id", appointment_id).execute()


def get_stats() -> dict:
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    end = now.replace(hour=23, minute=59, second=59, microsecond=999999).isoformat()

    today_count = (
        get_db().table("appointments")
        .select("id", count="exact", head=True)
        .gte("starts_at", start)
        .lte("starts_at", end)
        .execute()
    ).count or 0

    pending_count = (
        get_db().table("appointments")
        .select("id", count="exact", head=True)
        .eq("status", "pending")
        .execute()
    ).count or 0

    _rev_result = (
        get_db().table("appointments")
        .select("price, discount")
        .eq("status", "completed")
        .eq("payment_status", "paid")
        .gte("starts_at", start)
        .lte("starts_at", end)
        .execute()
    )
    revenue_rows: list[dict[str, Any]] = cast(list[dict[str, Any]], _rev_result.data or [])

    revenue = sum((r.get("price", 0) or 0) - (r.get("discount", 0) or 0) for r in revenue_rows)
    return {"todayCount": today_count, "pendingCount": pending_count, "todayRevenue": revenue}


def get_appointment_products(appointment_id: str) -> list:
    result = (
        get_db().table("appointment_products")
        .select("*, products(id, name, stock_quantity)")
        .eq("appointment_id", appointment_id)
        .execute()
    )
    return result.data or []


def add_appointment_product(appointment_id: str, body: dict) -> dict:
    result = (
        get_db().table("appointment_products")
        .insert({**body, "appointment_id": appointment_id})
        .select("*, products(name)")
        .single()
        .execute()
    )
    return result.data


def remove_appointment_product(product_id: str) -> None:
    get_db().table("appointment_products").delete().eq("id", product_id).execute()
