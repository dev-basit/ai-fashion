from typing import Optional

from supabase import Client

from app.core.notify import notify_user_and_admins
from app.core.supabase import get_admin_client


def list_orders(supabase: Client, user_id: str, user_role: str, client_id: Optional[str] = None) -> list:
    query = (
        supabase.table("orders")
        .select("*, profiles!client_id(id, full_name), order_items(*, products(name, image_url))")
        .order("created_at", desc=True)
    )
    if user_role == "customer":
        query = query.eq("client_id", user_id)
    elif client_id:
        query = query.eq("client_id", client_id)
    return query.execute().data or []


def get_order(supabase: Client, order_id: str) -> dict | None:
    result = (
        supabase.table("orders")
        .select("*, profiles!client_id(id, full_name, phone), order_items(*, products(*))")
        .eq("id", order_id)
        .maybe_single()
        .execute()
    )
    return result.data


def create_order(supabase: Client, body: dict) -> dict:
    items = body["items"]
    total = sum(i["quantity"] * i["unit_price"] for i in items)

    order_result = (
        supabase.table("orders")
        .insert({"client_id": body["client_id"], "total_amount": total, "notes": body.get("notes")})
        .select()
        .single()
        .execute()
    )
    order = order_result.data

    supabase.table("order_items").insert([
        {"order_id": order["id"], "product_id": i["product_id"], "quantity": i["quantity"], "unit_price": i["unit_price"]}
        for i in items
    ]).execute()

    admin = get_admin_client()
    product_ids = [i["product_id"] for i in items]
    products = admin.table("products").select("id, stock_quantity").in_("id", product_ids).execute().data or []
    for item in items:
        current = next((p["stock_quantity"] for p in products if p["id"] == item["product_id"]), 0)
        admin.table("products").update({"stock_quantity": max(0, current - item["quantity"])}).eq("id", item["product_id"]).execute()

    item_count = sum(i["quantity"] for i in items)
    client_profile = supabase.table("profiles").select("full_name").eq("id", body["client_id"]).single().execute()
    client_name = (client_profile.data or {}).get("full_name", "A client")

    notify_user_and_admins(
        body["client_id"],
        {"type": "order", "title": "Order placed",
         "body": f"Your order of {item_count} item{'s' if item_count != 1 else ''} has been placed successfully.",
         "data": {"order_id": order["id"]}},
    )
    notify_user_and_admins(
        None,
        {"type": "order", "title": "New order received",
         "body": f"{client_name} placed an order of {item_count} item{'s' if item_count != 1 else ''} (£{total:.2f}).",
         "data": {"order_id": order["id"]}},
    )

    return order


def update_order(supabase: Client, order_id: str, body: dict) -> dict | None:
    existing = supabase.table("orders").select("status, client_id").eq("id", order_id).single().execute().data or {}
    result = supabase.table("orders").update(body).eq("id", order_id).select().single().execute()
    data = result.data

    if body.get("status") == "delivered" and existing.get("status") != "delivered" and existing.get("client_id"):
        notify_user_and_admins(
            existing["client_id"],
            {"type": "order", "title": "Order delivered",
             "body": "Your order has been marked as delivered. Enjoy your products!",
             "data": {"order_id": order_id}},
        )

    return data
