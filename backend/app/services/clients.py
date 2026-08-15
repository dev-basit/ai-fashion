from typing import Optional

from app.core.context import get_db
from app.core.supabase import get_admin_client


def list_clients(search: Optional[str] = None) -> list:
    admin = get_admin_client()
    query = (
        admin.table("profiles")
        .select("*")
        .eq("role", "customer")
        .eq("is_active", True)
        .order("full_name")
    )
    if search:
        query = query.ilike("full_name", f"%{search}%")
    return query.execute().data or []


def get_client(client_id: str) -> dict | None:
    admin = get_admin_client()
    result = admin.table("profiles").select("*").eq("id", client_id).maybe_single().execute()
    return result.data


def create_client(body: dict) -> dict:
    admin = get_admin_client()
    email = body["email"]
    password = body["password"]
    full_name = body["full_name"]
    phone = body.get("phone")
    date_of_birth = body.get("date_of_birth")
    notes = body.get("notes")

    created = admin.auth.admin.create_user(
        {"email": email, "password": password, "email_confirm": True, "user_metadata": {"full_name": full_name}}
    )
    profile_id = created.user.id

    result = admin.table("profiles").upsert(
        {"id": profile_id, "role": "customer", "full_name": full_name, "phone": phone,
         "date_of_birth": date_of_birth, "notes": notes, "is_active": True}
    ).select().single().execute()
    return result.data


def update_client(client_id: str, body: dict) -> dict | None:
    result = (
        get_admin_client()
        .table("profiles")
        .update(body)
        .eq("id", client_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def deactivate_client(client_id: str) -> None:
    get_admin_client().table("profiles").update({"is_active": False}).eq("id", client_id).execute()


def get_client_history(client_id: str) -> dict:
    db = get_db()
    appointments = db.table("appointments").select("*, services(name, base_price), staff_profiles(profiles(full_name))").eq("client_id", client_id).order("starts_at", desc=True).execute().data or []
    orders = db.table("orders").select("*, order_items(*, products(name))").eq("client_id", client_id).order("created_at", desc=True).execute().data or []
    consultations = db.table("consultation_records").select("*, consultation_form_templates(name), staff_profiles(profiles(full_name))").eq("client_id", client_id).order("created_at", desc=True).execute().data or []
    plans = db.table("client_treatment_plans").select("*, treatment_plan_templates(name)").eq("client_id", client_id).order("created_at", desc=True).execute().data or []
    return {"appointments": appointments, "orders": orders, "consultations": consultations, "plans": plans}


def get_appointment_counts() -> dict:
    db = get_db()
    rows = db.table("appointments").select("client_id").execute().data or []
    counts: dict[str, int] = {}
    for row in rows:
        cid = row["client_id"]
        counts[cid] = counts.get(cid, 0) + 1
    return counts
