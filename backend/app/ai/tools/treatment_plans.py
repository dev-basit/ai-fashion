import json
from typing import Annotated, Optional
from langchain_core.tools import tool
from app.services import treatment_plans as tp_svc


@tool
def get_my_treatment_plans() -> str:
    """Get the current customer's own assigned treatment plans."""
    data = tp_svc.list_plans()
    if not data:
        return "You have no treatment plans."
    return json.dumps(
        [{"id": p["id"], "template": (p.get("treatment_plan_templates") or {}).get("name"), "status": p.get("status"), "start_date": p.get("start_date"), "end_date": p.get("end_date")} for p in data],
        indent=2,
    )


@tool
def get_treatment_plans(
    client_id: Annotated[Optional[str], "Filter by client profile UUID"] = None,
) -> str:
    """List treatment plans. Optionally filter by client."""
    data = tp_svc.list_plans(client_id=client_id)
    if not data:
        return "No treatment plans found."
    return json.dumps(
        [{"id": p["id"], "client": (p.get("profiles") or {}).get("full_name"), "template": (p.get("treatment_plan_templates") or {}).get("name"), "status": p.get("status"), "start_date": p.get("start_date")} for p in data],
        indent=2,
    )


@tool
def assign_treatment_plan(
    client_id: Annotated[str, "UUID of the client to assign the plan to"],
    template_id: Annotated[Optional[str], "UUID of the treatment plan template"] = None,
    start_date: Annotated[Optional[str], "Plan start date (YYYY-MM-DD)"] = None,
    notes: Annotated[Optional[str], "Additional notes for the plan"] = None,
) -> str:
    """Assign a treatment plan to a client. Staff and admin only."""
    try:
        body = {k: v for k, v in {"client_id": client_id, "template_id": template_id, "start_date": start_date, "notes": notes}.items() if v is not None}
        tp_svc.create_plan(body)
        return f"Treatment plan assigned to client {client_id} successfully."
    except Exception as e:
        return f"Failed to assign plan: {e}"


@tool
def list_treatment_plan_templates() -> str:
    """List all available treatment plan templates."""
    data = tp_svc.list_templates()
    if not data:
        return "No treatment plan templates found."
    return json.dumps(
        [{"id": t["id"], "name": t["name"], "description": t.get("description"), "duration_days": t.get("duration_days")} for t in data],
        indent=2,
    )


@tool
def create_treatment_plan_template(
    name: Annotated[str, "Template name"],
    description: Annotated[Optional[str], "Template description"] = None,
    duration_days: Annotated[Optional[int], "Duration of the plan in days"] = None,
) -> str:
    """Create a new treatment plan template. Admin only."""
    try:
        body = {k: v for k, v in {"name": name, "description": description, "duration_days": duration_days}.items() if v is not None}
        tp_svc.create_template(body)
        return f"Treatment plan template \"{name}\" created successfully."
    except Exception as e:
        return f"Failed to create template: {e}"


customer_treatment_plan_tools = [get_my_treatment_plans, list_treatment_plan_templates]
staff_treatment_plan_tools = [*customer_treatment_plan_tools, get_treatment_plans, assign_treatment_plan]
admin_treatment_plan_tools = [*staff_treatment_plan_tools, create_treatment_plan_template]
