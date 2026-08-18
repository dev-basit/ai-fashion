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
    template_id: Annotated[str, "UUID of the treatment plan template"],
    starts_on: Annotated[str, "Plan start date (YYYY-MM-DD format)"],
    name: Annotated[Optional[str], "Plan name (optional, defaults to template name)"] = None,
) -> str:
    """Assign a treatment plan to a client matching frontend structure.

    Requires: client_id, template_id, starts_on
    Auto-calculates: ends_on (start + template duration), assigned_by (current user)"""
    try:
        from datetime import datetime, timedelta
        from app.core.context import get_db, get_current_user

        # Validate inputs
        if not client_id:
            return "❌ Error: client_id is required."
        if not template_id:
            return "❌ Error: template_id is required."
        if not starts_on:
            return "❌ Error: starts_on date is required (YYYY-MM-DD)."

        # Validate date format
        try:
            start_date_obj = datetime.strptime(starts_on, "%Y-%m-%d")
        except ValueError:
            return f"❌ Error: Invalid date '{starts_on}'. Use YYYY-MM-DD format."

        # Verify template exists
        template = tp_svc.get_template(template_id)
        if not template:
            return f"❌ Template not found. Use list_treatment_plan_templates()."

        # Verify client exists
        client_check = get_db().table("profiles").select("id").eq("id", client_id).maybe_single().execute()
        if not client_check or not client_check.data:
            return f"❌ Client not found."

        # Calculate end date
        duration = template.duration_days or 0
        ends_on = (start_date_obj + timedelta(days=duration)).strftime("%Y-%m-%d")

        # Get current user
        current_user = get_current_user()

        # Build body matching frontend
        body = {
            "client_id": client_id,
            "template_id": template_id,
            "assigned_by": current_user.id,
            "name": name or template.name,
            "starts_on": starts_on,
            "ends_on": ends_on,
            "status": "active",
            "progress_notes": [],
        }

        tp_svc.create_plan(body)
        return f"✓ Plan assigned: {body['name']} ({duration}d, {starts_on} to {ends_on})"
    except Exception as e:
        return f"❌ Failed: {str(e)}"


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
    name: Annotated[str, "Template name (e.g., 'Post-Treatment Recovery Plan')"],
    duration_days: Annotated[int, "REQUIRED: Duration of the treatment plan in DAYS (e.g., 7, 14, 30)"],
    description: Annotated[Optional[str], "Optional: Description of the treatment/recovery plan"] = None,
) -> str:
    """Create a treatment/recovery plan template with a duration in days. Use this for multi-day treatment schedules, NOT for consultation question forms.

    This is for recovery/healing plans that span multiple days. If you want a reusable form for gathering client information, use create_consultation_template instead."""
    try:
        body = {k: v for k, v in {"name": name, "description": description, "duration_days": duration_days}.items() if v is not None}
        tp_svc.create_template(body)
        return f"Treatment plan template \"{name}\" created successfully."
    except Exception as e:
        return f"Failed to create template: {e}"


@tool
def update_treatment_plan_status(
    plan_id: Annotated[str, "UUID of the treatment plan to update"],
    status: Annotated[str, "New status: active, completed, cancelled, on_hold"],
) -> str:
    """Update the status of a treatment plan.

    Valid statuses: active, completed, cancelled, on_hold"""
    try:
        if not plan_id:
            return "❌ Error: plan_id is required."
        if not status:
            return "❌ Error: status is required (active, completed, cancelled, on_hold)."

        valid_statuses = ["active", "completed", "cancelled", "on_hold"]
        status_lower = status.lower().strip()
        if status_lower not in valid_statuses:
            return f"❌ Error: Invalid status '{status}'. Must be: {', '.join(valid_statuses)}"

        # Update the plan
        updated = tp_svc.update_plan(plan_id, {"status": status_lower})
        if not updated:
            return f"❌ Treatment plan '{plan_id}' not found."

        return f"✓ Treatment plan status updated to '{status_lower}'"
    except Exception as e:
        return f"❌ Failed to update plan: {str(e)}"


customer_treatment_plan_tools = [get_my_treatment_plans, ]
staff_treatment_plan_tools = [*customer_treatment_plan_tools, list_treatment_plan_templates, get_treatment_plans, assign_treatment_plan, update_treatment_plan_status]
admin_treatment_plan_tools = [*staff_treatment_plan_tools, create_treatment_plan_template]
