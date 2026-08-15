import json
from typing import Annotated, Optional
from langchain_core.tools import tool

from app.services import consultation as consultation_svc


@tool
def get_my_consultation_records() -> str:
    """Get the current customer's own consultation records."""
    from app.core.context import get_current_user

    user_id = get_current_user().id
    data = consultation_svc.list_records(client_id=user_id)
    if not data:
        return "You have no consultation records."
    return json.dumps(
        [{"id": r["id"], "template": (r.get("consultation_form_templates") or {}).get("name"), "notes": r.get("notes"), "created_at": r.get("created_at")} for r in data],
        indent=2,
    )


@tool
def get_consultation_records(
    client_id: Annotated[Optional[str], "Filter by client profile UUID"] = None,
) -> str:
    """List consultation records. Optionally filter by a specific client."""
    data = consultation_svc.list_records(client_id=client_id)
    if not data:
        return "No consultation records found."
    return json.dumps(
        [{"id": r["id"], "client": (r.get("profiles") or {}).get("full_name"), "template": (r.get("consultation_form_templates") or {}).get("name"), "notes": r.get("notes"), "created_at": r.get("created_at")} for r in data],
        indent=2,
    )

@tool
def create_consultation_record(
    client_id: Annotated[str, "UUID of the client"],
    template_id: Annotated[Optional[str], "UUID of the consultation form template"] = None,
    notes: Annotated[Optional[str], "Session notes and observations"] = None,
    recommendations: Annotated[Optional[str], "Recommended treatments or products"] = None,
) -> str:
    """Create a consultation record for a client. Staff and admin only."""
    try:
        body = {k: v for k, v in {"client_id": client_id, "template_id": template_id, "notes": notes, "recommendations": recommendations}.items() if v is not None}
        consultation_svc.create_record(body)
        return f"Consultation record created successfully for client {client_id}."
    except Exception as e:
        return f"Failed to create record: {e}"


customer_consultation_tools = [get_my_consultation_records]
staff_consultation_tools = [*customer_consultation_tools, get_consultation_records, create_consultation_record]
