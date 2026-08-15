from typing import Optional

from app.core.context import get_db
from app.core.supabase import get_admin_db_client
from app.schemas.staff import StaffProfile, StaffDetail, StaffLeave


def list_staff(profile_id: Optional[str] = None) -> list:
    query = (
        get_db().table("staff_profiles")
        .select("*, profiles(id, full_name, avatar_url, phone, is_active)")
        .order("created_at", desc=True)
    )
    if profile_id:
        query = query.eq("profile_id", profile_id)
    return query.execute().data or []


def get_staff(staff_id: str) -> StaffDetail | None:
    result = (
        get_db().table("staff_profiles")
        .select("*, profiles(*), staff_services(services(*))")
        .eq("id", staff_id)
        .maybe_single()
        .execute()
    )
    if result is None or result.data is None:
        return None
    return StaffDetail.model_validate(result.data)


def create_staff(body: dict) -> StaffProfile:
    admin = get_admin_db_client()
    email = body["email"]
    password = body["password"]
    full_name = body["full_name"]
    phone = body.get("phone")

    created = admin.auth.admin.create_user(
        {"email": email, "password": password, "email_confirm": True,
         "user_metadata": {"full_name": full_name, "role": "staff"}}
    )
    profile_id = created.user.id

    admin.table("profiles").update({"role": "staff", "full_name": full_name, "phone": phone}).eq("id", profile_id).execute()

    result = admin.table("staff_profiles").insert({
        "profile_id": profile_id,
        "bio": body.get("bio"),
        "specializations": body.get("specializations"),
        "hire_date": body.get("hire_date"),
        "commission_rate": body.get("commission_rate"),
        "hourly_rate": body.get("hourly_rate"),
        "is_available": True,
    }).select().maybe_single().execute()
    return StaffProfile.model_validate(result.data)


def update_staff(staff_id: str, body: dict) -> StaffProfile | None:
    result = (
        get_db().table("staff_profiles")
        .update(body)
        .eq("id", staff_id)
        .select()
        .maybe_single()
        .execute()
    )
    if result is None or result.data is None:
        return None
    return StaffProfile.model_validate(result.data)


def get_schedule(staff_id: str) -> list:
    result = (
        get_db().table("staff_schedules")
        .select("*")
        .eq("staff_profile_id", staff_id)
        .order("day_of_week")
        .execute()
    )
    return result.data or []


def update_schedule(staff_id: str, schedules: list) -> None:
    rows = [{**s, "staff_profile_id": staff_id} for s in schedules]
    get_db().table("staff_schedules").upsert(rows, on_conflict="staff_profile_id,day_of_week").execute()


def get_leaves(staff_id: str) -> list:
    result = (
        get_db().table("staff_leaves")
        .select("*")
        .eq("staff_profile_id", staff_id)
        .order("starts_at")
        .execute()
    )
    return result.data or []


def create_leave(staff_id: str, body: dict) -> StaffLeave:
    result = (
        get_db().table("staff_leaves")
        .insert({**body, "staff_profile_id": staff_id})
        .select()
        .maybe_single()
        .execute()
    )
    return StaffLeave.model_validate(result.data)


def delete_leave(staff_id: str, leave_id: str) -> None:
    get_db().table("staff_leaves").delete().eq("id", leave_id).eq("staff_profile_id", staff_id).execute()


def get_staff_services(staff_id: str) -> list:
    result = (
        get_db().table("staff_services")
        .select("*, services(*)")
        .eq("staff_profile_id", staff_id)
        .execute()
    )
    return result.data or []


def add_staff_service(staff_id: str, service_id: str) -> None:
    get_db().table("staff_services").insert({"staff_profile_id": staff_id, "service_id": service_id}).execute()


def remove_staff_service(staff_id: str, service_id: str) -> None:
    get_db().table("staff_services").delete().eq("staff_profile_id", staff_id).eq("service_id", service_id).execute()
