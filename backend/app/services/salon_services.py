from app.core.context import get_db


def list_services() -> list:
    result = (
        get_db().table("services")
        .select("*, service_categories(id, name), service_variants(*)")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    return result.data or []


def get_service(service_id: str) -> dict | None:
    result = (
        get_db().table("services")
        .select("*, service_categories(*), service_variants(*)")
        .eq("id", service_id)
        .maybe_single()
        .execute()
    )
    return result.data


def create_service(body: dict) -> dict:
    result = get_db().table("services").insert(body).select().single().execute()
    return result.data


def update_service(service_id: str, body: dict) -> dict | None:
    result = (
        get_db().table("services")
        .update(body)
        .eq("id", service_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def delete_service(service_id: str) -> None:
    get_db().table("services").update({"is_active": False}).eq("id", service_id).execute()


def list_categories() -> list:
    result = (
        get_db().table("service_categories")
        .select("*")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    return result.data or []


def create_category(body: dict) -> dict:
    result = get_db().table("service_categories").insert(body).select().single().execute()
    return result.data


def get_category(category_id: str) -> dict | None:
    result = (
        get_db().table("service_categories")
        .select("*")
        .eq("id", category_id)
        .maybe_single()
        .execute()
    )
    return result.data


def update_category(category_id: str, body: dict) -> dict | None:
    result = (
        get_db().table("service_categories")
        .update(body)
        .eq("id", category_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def delete_category(category_id: str) -> None:
    get_db().table("service_categories").update({"is_active": False}).eq("id", category_id).execute()


def list_variants(service_id: str) -> list:
    result = (
        get_db().table("service_variants")
        .select("*")
        .eq("service_id", service_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


def create_variant(service_id: str, body: dict) -> dict:
    result = (
        get_db().table("service_variants")
        .insert({**body, "service_id": service_id})
        .select()
        .single()
        .execute()
    )
    return result.data


def update_variant(variant_id: str, body: dict) -> dict | None:
    result = (
        get_db().table("service_variants")
        .update(body)
        .eq("id", variant_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def delete_variant(variant_id: str) -> None:
    get_db().table("service_variants").delete().eq("id", variant_id).execute()
