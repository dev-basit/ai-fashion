from supabase import Client


def list_services(supabase: Client) -> list:
    result = (
        supabase.table("services")
        .select("*, service_categories(id, name), service_variants(*)")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    return result.data or []


def get_service(supabase: Client, service_id: str) -> dict | None:
    result = (
        supabase.table("services")
        .select("*, service_categories(*), service_variants(*)")
        .eq("id", service_id)
        .maybe_single()
        .execute()
    )
    return result.data


def create_service(supabase: Client, body: dict) -> dict:
    result = supabase.table("services").insert(body).select().single().execute()
    return result.data


def update_service(supabase: Client, service_id: str, body: dict) -> dict | None:
    result = (
        supabase.table("services")
        .update(body)
        .eq("id", service_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def delete_service(supabase: Client, service_id: str) -> None:
    supabase.table("services").update({"is_active": False}).eq("id", service_id).execute()


def list_categories(supabase: Client) -> list:
    result = (
        supabase.table("service_categories")
        .select("*")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    return result.data or []


def create_category(supabase: Client, body: dict) -> dict:
    result = supabase.table("service_categories").insert(body).select().single().execute()
    return result.data


def get_category(supabase: Client, category_id: str) -> dict | None:
    result = (
        supabase.table("service_categories")
        .select("*")
        .eq("id", category_id)
        .maybe_single()
        .execute()
    )
    return result.data


def update_category(supabase: Client, category_id: str, body: dict) -> dict | None:
    result = (
        supabase.table("service_categories")
        .update(body)
        .eq("id", category_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def delete_category(supabase: Client, category_id: str) -> None:
    supabase.table("service_categories").update({"is_active": False}).eq("id", category_id).execute()


def list_variants(supabase: Client, service_id: str) -> list:
    result = (
        supabase.table("service_variants")
        .select("*")
        .eq("service_id", service_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


def create_variant(supabase: Client, service_id: str, body: dict) -> dict:
    result = (
        supabase.table("service_variants")
        .insert({**body, "service_id": service_id})
        .select()
        .single()
        .execute()
    )
    return result.data


def update_variant(supabase: Client, variant_id: str, body: dict) -> dict | None:
    result = (
        supabase.table("service_variants")
        .update(body)
        .eq("id", variant_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def delete_variant(supabase: Client, variant_id: str) -> None:
    supabase.table("service_variants").delete().eq("id", variant_id).execute()
