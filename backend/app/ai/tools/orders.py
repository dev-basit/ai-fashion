import json
from typing import Annotated, Optional

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolArg, tool

from app.ai.tools.utils import get_user_id
from app.config.settings import settings
from app.services import orders as orders_svc


def _format_order(o: dict) -> dict:
    return {
        "id": o["id"],
        "status": o.get("status"),
        "total_amount": o.get("total_amount"),
        "created_at": o.get("created_at"),
        "items": [{"product": (i.get("products") or {}).get("name"), "quantity": i.get("quantity"), "unit_price": i.get("unit_price")} for i in (o.get("order_items") or [])],
    }


@tool
def get_my_orders(
    limit: Annotated[int, "Max orders to return"] = settings.page_limit,
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """List the current customer's own orders with item details and status."""
    data = orders_svc.list_orders()
    if not data:
        return "You have no orders."
    return json.dumps([_format_order(o) for o in data[:limit]], indent=2)


@tool
def get_order_status(
    order_id: Annotated[str, "UUID of the order"],
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Get the full details and status of a specific order by its ID."""
    data = orders_svc.get_order(order_id)
    if not data:
        return "Order not found."
    return json.dumps(_format_order(data.model_dump()), indent=2)


@tool
def get_all_orders(
    client_id: Annotated[Optional[str], "Filter by client profile UUID"] = None,
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """List all orders across all clients. Optionally filter by a specific client."""
    data = orders_svc.list_orders(client_id=client_id)
    if not data:
        return "No orders found."
    return json.dumps(
        [{"id": o["id"], "client": (o.get("profiles") or {}).get("full_name"), "status": o.get("status"), "total_amount": o.get("total_amount"), "created_at": o.get("created_at")} for o in data],
        indent=2,
    )


@tool
def update_order_status(
    order_id: Annotated[str, "UUID of the order"],
    status: Annotated[str, "New status: pending | processing | shipped | delivered | cancelled | refunded"],
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Update the status of an order. Admin only."""
    try:
        orders_svc.update_order(order_id, {"status": status})
        return f"Order {order_id} status updated to \"{status}\"."
    except Exception as e:
        return f"Failed to update order: {e}"


customer_order_tools = [get_my_orders, get_order_status]
staff_order_tools = [get_all_orders, get_order_status]
admin_order_tools = [*staff_order_tools, update_order_status]
