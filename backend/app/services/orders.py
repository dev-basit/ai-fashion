from typing import Any, Optional, cast

from app.core.context import get_db, get_current_user
from app.core.notify import notify_user_and_admins
from app.core.supabase import get_admin_db_client
from app.schemas.orders import Order


def list_orders(client_id: Optional[str] = None) -> list:
    user = get_current_user()
    db = get_db()

    query = (
        db.table("orders")
        .select("*, profiles!client_id(id, full_name), order_items(*, products(name, image_url))")
        .order("created_at", desc=True)
    )
    if user.user_metadata.get("role") == "customer":
        query = query.eq("client_id", user.id)
    elif client_id:
        query = query.eq("client_id", client_id)
    return query.execute().data or []


def get_order(order_id: str) -> Order | None:
    result = (
        get_db().table("orders")
        .select("*, profiles!client_id(id, full_name, phone), order_items(*, products(*))")
        .eq("id", order_id)
        .maybe_single()
        .execute()
    )
    if result is None or result.data is None:
        return None
    return Order.model_validate(result.data)


def create_order(body: dict) -> dict:
    db = get_db()
    items = body["items"]
    total = sum(i["quantity"] * i["unit_price"] for i in items)

    order_result = (
        db.table("orders")
        .insert({"client_id": body["client_id"], "total_amount": total, "notes": body.get("notes")})
        .select()
        .maybe_single()
        .execute()
    )
    order = order_result.data

    db.table("order_items").insert([
        {"order_id": order["id"], "product_id": i["product_id"], "quantity": i["quantity"], "unit_price": i["unit_price"]}
        for i in items
    ]).execute()

    admin = get_admin_db_client()
    product_ids = [i["product_id"] for i in items]
    _prod_res = admin.table("products").select("id, stock_quantity").in_("id", product_ids).execute()
    products: list[dict[str, Any]] = cast(list[dict[str, Any]], _prod_res.data or [])
    for item in items:
        current = next((p["stock_quantity"] for p in products if p["id"] == item["product_id"]), 0)
        admin.table("products").update({"stock_quantity": max(0, current - item["quantity"])}).eq("id", item["product_id"]).execute()

    item_count = sum(i["quantity"] for i in items)
    client_profile = db.table("profiles").select("full_name").eq("id", body["client_id"]).maybe_single().execute()
    client_name = cast(dict[str, Any], (client_profile.data if client_profile is not None else None) or {}).get("full_name", "A client")

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


def update_order(order_id: str, body: dict) -> Order | None:
    db = get_db()
    _existing_res = db.table("orders").select("status, client_id").eq("id", order_id).maybe_single().execute()
    existing: dict[str, Any] = cast(dict[str, Any], (_existing_res.data if _existing_res is not None else None) or {})
    result = db.table("orders").update(body).eq("id", order_id).select().maybe_single().execute()

    if result is None or result.data is None:
        return None

    data = result.data
    if body.get("status") == "delivered" and existing.get("status") != "delivered" and existing.get("client_id"):
        notify_user_and_admins(
            existing["client_id"],
            {"type": "order", "title": "Order delivered",
             "body": "Your order has been marked as delivered. Enjoy your products!",
             "data": {"order_id": order_id}},
        )

    return Order.model_validate(data)
