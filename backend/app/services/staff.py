from typing import Optional

from supabase import Client

from app.core.supabase import get_admin_client


def list_staff(supabase: Client, profile_id: Optional[str] = None) -> list:
    query = (
        supabase.table("staff_profiles")
        .select("*, profiles(id, full_name, avatar_url, phone, is_active)")
        .order("created_at", desc=True)
    )
    if profile_id:
        query = query.eq("profile_id", profile_id)
    return query.execute().data or []


def get_staff(supabase: Client, staff_id: str) -> dict | None:
    result = (
        supabase.table("staff_profiles")
        .select("*, profiles(*), staff_services(services(*))")
        .eq("id", staff_id)
        .maybe_single()
        .execute()
    )
    return result.data


def create_staff(body: dict) -> dict:
    admin = get_admin_client()
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
    }).select().single().execute()
    return result.data


def update_staff(supabase: Client, staff_id: str, body: dict) -> dict | None:
    result = (
        supabase.table("staff_profiles")
        .update(body)
        .eq("id", staff_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def get_schedule(supabase: Client, staff_id: str) -> list:
    result = (
        supabase.table("staff_schedules")
        .select("*")
        .eq("staff_profile_id", staff_id)
        .order("day_of_week")
        .execute()
    )
    return result.data or []


def update_schedule(supabase: Client, staff_id: str, schedules: list) -> None:
    rows = [{**s, "staff_profile_id": staff_id} for s in schedules]
    supabase.table("staff_schedules").upsert(rows, on_conflict="staff_profile_id,day_of_week").execute()


def get_leaves(supabase: Client, staff_id: str) -> list:
    result = (
        supabase.table("staff_leaves")
        .select("*")
        .eq("staff_profile_id", staff_id)
        .order("starts_at")
        .execute()
    )
    return result.data or []


def create_leave(supabase: Client, staff_id: str, body: dict) -> dict:
    result = (
        supabase.table("staff_leaves")
        .insert({**body, "staff_profile_id": staff_id})
        .select()
        .single()
        .execute()
    )
    return result.data


def delete_leave(supabase: Client, staff_id: str, leave_id: str) -> None:
    supabase.table("staff_leaves").delete().eq("id", leave_id).eq("staff_profile_id", staff_id).execute()


def get_staff_services(supabase: Client, staff_id: str) -> list:
    result = (
        supabase.table("staff_services")
        .select("*, services(*)")
        .eq("staff_profile_id", staff_id)
        .execute()
    )
    return result.data or []


def add_staff_service(supabase: Client, staff_id: str, service_id: str) -> None:
    supabase.table("staff_services").insert({"staff_profile_id": staff_id, "service_id": service_id}).execute()


def remove_staff_service(supabase: Client, staff_id: str, service_id: str) -> None:
    supabase.table("staff_services").delete().eq("staff_profile_id", staff_id).eq("service_id", service_id).execute()
