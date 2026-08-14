from typing import Optional

from supabase import Client

from app.core.supabase import get_admin_client


def list_products(supabase: Client, search: Optional[str] = None, category_id: Optional[str] = None) -> list:
    query = (
        supabase.table("products")
        .select("*, product_categories(id, name)")
        .eq("is_active", True)
        .order("name")
    )
    if search:
        query = query.ilike("name", f"%{search}%")
    if category_id:
        query = query.eq("category_id", category_id)
    return query.execute().data or []


def get_product(supabase: Client, product_id: str) -> dict | None:
    result = (
        supabase.table("products")
        .select("*, product_categories(*)")
        .eq("id", product_id)
        .maybe_single()
        .execute()
    )
    return result.data


def create_product(supabase: Client, body: dict) -> dict:
    result = supabase.table("products").insert(body).select().single().execute()
    return result.data


def update_product(supabase: Client, product_id: str, body: dict) -> dict | None:
    result = (
        supabase.table("products")
        .update(body)
        .eq("id", product_id)
        .select()
        .single()
        .execute()
    )
    return result.data


def delete_product(supabase: Client, product_id: str) -> None:
    supabase.table("products").update({"is_active": False}).eq("id", product_id).execute()


def list_product_categories(supabase: Client) -> list:
    result = (
        supabase.table("product_categories")
        .select("*")
        .eq("is_active", True)
        .order("sort_order")
        .execute()
    )
    return result.data or []


def create_product_category(supabase: Client, body: dict) -> dict:
    result = supabase.table("product_categories").insert(body).select().single().execute()
    return result.data


def get_low_stock_products() -> list:
    result = (
        get_admin_client()
        .table("products")
        .select("*, product_categories(*)")
        .eq("is_active", True)
        .filter("stock_quantity", "lte", "low_stock_threshold")
        .execute()
    )
    return result.data or []
