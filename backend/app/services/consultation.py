from typing import Optional

from supabase import Client

from app.core.notify import notify_user_and_admins


def list_records(supabase: Client, client_id: Optional[str] = None, staff_profile_id: Optional[str] = None) -> list:
    query = (
        supabase.table("consultation_records")
        .select("*, profiles!client_id(id, full_name, avatar_url), staff_profiles(profiles(full_name)), consultation_form_templates(name)")
        .order("created_at", desc=True)
    )
    if client_id:
        query = query.eq("client_id", client_id)
    if staff_profile_id:
        query = query.eq("staff_profile_id", staff_profile_id)
    return query.execute().data or []


def get_record(supabase: Client, record_id: str) -> dict | None:
    result = (
        supabase.table("consultation_records")
        .select("*, profiles!client_id(*), staff_profiles(*, profiles(*)), consultation_form_templates(*)")
        .eq("id", record_id)
        .maybe_single()
        .execute()
    )
    return result.data


def create_record(supabase: Client, user_id: str, body: dict) -> dict:
    result = supabase.table("consultation_records").insert(body).select().single().execute()
    data = result.data
    client_id = body.get("client_id")
    if client_id:
        client_profile = supabase.table("profiles").select("full_name").eq("id", client_id).single().execute()
        client_name = (client_profile.data or {}).get("full_name", "A client")
        notify_user_and_admins(
            client_id if client_id != user_id else None,
            {"type": "system", "title": "Consultation record created",
             "body": "A consultation record has been created for you. You can view it in your profile.",
             "data": {"record_id": data["id"]}},
        )
        notify_user_and_admins(
            None,
            {"type": "system", "title": "New consultation record",
             "body": f"A consultation record was created for {client_name}.",
             "data": {"record_id": data["id"]}},
        )
    return data


def update_record(supabase: Client, record_id: str, body: dict) -> dict | None:
    result = (
        supabase.table("consultation_records")
        .update(body)
        .eq("id", record_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def list_templates(supabase: Client) -> list:
    result = (
        supabase.table("consultation_form_templates")
        .select("*")
        .eq("is_active", True)
        .order("name")
        .execute()
    )
    return result.data or []


def get_template(supabase: Client, template_id: str) -> dict | None:
    result = (
        supabase.table("consultation_form_templates")
        .select("*")
        .eq("id", template_id)
        .maybe_single()
        .execute()
    )
    return result.data


def create_template(supabase: Client, body: dict) -> dict:
    result = supabase.table("consultation_form_templates").insert(body).select().single().execute()
    return result.data


def update_template(supabase: Client, template_id: str, body: dict) -> dict | None:
    result = (
        supabase.table("consultation_form_templates")
        .update(body)
        .eq("id", template_id)
        .select()
        .single()
        .execute()
    )
    return result.data
