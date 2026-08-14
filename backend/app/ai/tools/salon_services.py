import json
from typing import Annotated, Optional

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolArg, tool

from app.ai.tools.utils import get_supabase
from app.services import salon_services as svc


@tool
def list_services(
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """List all active services with their categories, pricing, duration, and variants. Use this to find valid service IDs for booking."""
    data = svc.list_services(get_supabase(config))
    if not data:
        return "No services available."
    return json.dumps(
        [{"id": s["id"], "name": s["name"], "category": (s.get("service_categories") or {}).get("name"), "base_price": s.get("base_price"), "duration_minutes": s.get("duration_mins"), "variants": [{"id": v["id"], "name": v["name"], "price_modifier": v.get("price_modifier"), "duration_modifier": v.get("duration_modifier")} for v in (s.get("service_variants") or [])]} for s in data],
        indent=2,
    )


@tool
def create_service(
    name: Annotated[str, "Service name"],
    base_price: Annotated[float, "Base price"],
    duration_minutes: Annotated[int, "Service duration in minutes"],
    description: Annotated[Optional[str], "Service description"] = None,
    category_id: Annotated[Optional[str], "UUID of the service category"] = None,
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Create a new service. Admin only."""
    try:
        svc.create_service(get_supabase(config), {"name": name, "base_price": base_price, "duration_mins": duration_minutes, "description": description, "category_id": category_id})
        return f"Service \"{name}\" created successfully."
    except Exception as e:
        return f"Failed to create service: {e}"


@tool
def update_service(
    service_id: Annotated[str, "UUID of the service to update"],
    name: Annotated[Optional[str], "New name"] = None,
    description: Annotated[Optional[str], "New description"] = None,
    base_price: Annotated[Optional[float], "New base price"] = None,
    duration_minutes: Annotated[Optional[int], "New duration in minutes"] = None,
    is_active: Annotated[Optional[bool], "Set false to deactivate"] = None,
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Update an existing service. Admin only."""
    try:
        body = {k: v for k, v in {"name": name, "description": description, "base_price": base_price, "duration_mins": duration_minutes, "is_active": is_active}.items() if v is not None}
        svc.update_service(get_supabase(config), service_id, body)
        return f"Service {service_id} updated successfully."
    except Exception as e:
        return f"Failed to update service: {e}"


shared_service_tools = [list_services]
admin_service_tools = [*shared_service_tools, create_service, update_service]
