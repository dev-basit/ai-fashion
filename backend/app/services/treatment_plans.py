from typing import Optional

from supabase import Client

from app.core.notify import notify_user_and_admins


def list_plans(supabase: Client, user_id: str, user_role: str, client_id: Optional[str] = None) -> list:
    query = (
        supabase.table("client_treatment_plans")
        .select("*, profiles!client_id(id, full_name, avatar_url), treatment_plan_templates(name, duration_days)")
        .order("created_at", desc=True)
    )
    if user_role == "customer":
        query = query.eq("client_id", user_id)
    elif client_id:
        query = query.eq("client_id", client_id)
    return query.execute().data or []


def get_plan(supabase: Client, plan_id: str) -> dict | None:
    result = (
        supabase.table("client_treatment_plans")
        .select("*, profiles!client_id(*), treatment_plan_templates(*)")
        .eq("id", plan_id)
        .maybe_single()
        .execute()
    )
    return result.data


def create_plan(supabase: Client, body: dict) -> dict:
    result = supabase.table("client_treatment_plans").insert(body).select().single().execute()
    data = result.data
    client_id = body.get("client_id")
    if client_id:
        client_res = supabase.table("profiles").select("full_name").eq("id", client_id).single().execute()
        client_name = (client_res.data or {}).get("full_name", "A client")
        template_res = (
            supabase.table("treatment_plan_templates").select("name").eq("id", body["template_id"]).single().execute()
            if body.get("template_id") else None
        )
        plan_name = (template_res.data or {}).get("name", "a treatment plan") if template_res else "a treatment plan"

        notify_user_and_admins(
            client_id,
            {"type": "system", "title": "Treatment plan assigned",
             "body": f"You have been assigned \"{plan_name}\". Check your treatment plans to get started.",
             "data": {"plan_id": data["id"]}},
        )
        notify_user_and_admins(
            None,
            {"type": "system", "title": "Treatment plan assigned",
             "body": f"{plan_name} was assigned to {client_name}.",
             "data": {"plan_id": data["id"]}},
        )
    return data


def update_plan(supabase: Client, plan_id: str, body: dict) -> dict | None:
    result = (
        supabase.table("client_treatment_plans")
        .update(body)
        .eq("id", plan_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def list_templates(supabase: Client) -> list:
    result = (
        supabase.table("treatment_plan_templates")
        .select("*")
        .eq("is_active", True)
        .order("duration_days")
        .execute()
    )
    return result.data or []


def get_template(supabase: Client, template_id: str) -> dict | None:
    result = (
        supabase.table("treatment_plan_templates")
        .select("*")
        .eq("id", template_id)
        .maybe_single()
        .execute()
    )
    return result.data


def create_template(supabase: Client, body: dict) -> dict:
    result = supabase.table("treatment_plan_templates").insert(body).select().single().execute()
    return result.data


def update_template(supabase: Client, template_id: str, body: dict) -> dict | None:
    result = (
        supabase.table("treatment_plan_templates")
        .update(body)
        .eq("id", template_id)
        .select()
        .single()
        .execute()
    )
    return result.data
