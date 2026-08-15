import json
from typing import Annotated, Optional
from langchain_core.tools import tool

from app.config.settings import settings
from app.services import appointments as appts_svc


@tool
def get_my_appointments(
    status: Annotated[Optional[str], "Filter by status: pending | confirmed | in_progress | completed | cancelled | no_show"] = None,
    limit: Annotated[int, "Max results to return"] = settings.page_limit,
) -> str:
    """List the current user's own appointments. Optionally filter by status."""
    data = appts_svc.list_appointments(status=status)
    if not data:
        return "You have no appointments."
    return json.dumps(
        [{"id": a["id"], "service": (a.get("services") or {}).get("name"), "staff": ((a.get("staff_profiles") or {}).get("profiles") or {}).get("full_name", "TBD"), "starts_at": a["starts_at"], "status": a["status"], "price": a.get("price")} for a in data[:limit]],
        indent=2,
    )


@tool
def book_appointment(
    service_id: Annotated[str, "UUID of the service to book"],
    starts_at: Annotated[str, "Start datetime in ISO 8601 format"],
    staff_profile_id: Annotated[Optional[str], "Preferred staff profile UUID"] = None,
    notes: Annotated[Optional[str], "Special notes or requests"] = None,
) -> str:
    """Book a new appointment for the current customer."""
    try:
        data = appts_svc.create_appointment(
            {"service_id": service_id, "staff_profile_id": staff_profile_id, "starts_at": starts_at, "notes": notes, "status": "pending", "payment_status": "unpaid", "price": 0, "discount": 0},
        )
        return f"Appointment booked! ID: {data['id']}, starts at: {data['starts_at']}, status: {data['status']}."
    except Exception as e:
        return f"Failed to book: {e}"


@tool
def book_appointment_for_client(
    client_id: Annotated[str, "UUID of the client profile — use get_clients to find it"],
    service_id: Annotated[str, "UUID of the service to book — use list_services to find it"],
    starts_at: Annotated[str, "Start datetime in ISO 8601 format"],
    staff_profile_id: Annotated[Optional[str], "Staff profile UUID"] = None,
    notes: Annotated[Optional[str], "Special notes or requests"] = None,
) -> str:
    """Book an appointment on behalf of a client. Requires client_id, service_id, and starts_at."""
    try:
        data = appts_svc.create_appointment(
            {"client_id": client_id, "service_id": service_id, "staff_profile_id": staff_profile_id, "starts_at": starts_at, "notes": notes, "status": "pending", "payment_status": "unpaid", "price": 0, "discount": 0},
        )
        return f"Appointment booked! ID: {data['id']}, starts at: {data['starts_at']}, status: {data['status']}."
    except Exception as e:
        return f"Failed to book: {e}"


@tool
def cancel_appointment(
    appointment_id: Annotated[str, "UUID of the appointment to cancel"],
    reason: Annotated[Optional[str], "Reason for cancellation"] = None,
) -> str:
    """Cancel an appointment by ID. Confirm the appointment ID first."""
    try:
        appts_svc.update_appointment(appointment_id, {"status": "cancelled", "internal_notes": reason})
        return f"Appointment {appointment_id} cancelled successfully."
    except Exception as e:
        return f"Failed to cancel: {e}"


@tool
def get_all_appointments(
    client_id: Annotated[Optional[str], "Filter by client profile UUID"] = None,
    staff_profile_id: Annotated[Optional[str], "Filter by staff profile UUID"] = None,
    status: Annotated[Optional[str], "Filter by status"] = None,
    date_from: Annotated[Optional[str], "Filter from date (ISO 8601)"] = None,
    date_to: Annotated[Optional[str], "Filter to date (ISO 8601)"] = None,
) -> str:
    """List all appointments across all clients. Supports filtering by client, staff, status, or date range."""
    data = appts_svc.list_appointments(client_id=client_id, staff_profile_id=staff_profile_id, status=status, from_=date_from, to=date_to)
    if not data:
        return "No appointments found."
    return json.dumps(
        [{"id": a["id"], "client": (a.get("profiles") or {}).get("full_name"), "service": (a.get("services") or {}).get("name"), "starts_at": a["starts_at"], "status": a["status"]} for a in data],
        indent=2,
    )


@tool
def update_appointment_status(
    appointment_id: Annotated[str, "UUID of the appointment"],
    status: Annotated[str, "New status: pending | confirmed | in_progress | completed | cancelled | no_show"],
) -> str:
    """Update the status of any appointment."""
    try:
        appts_svc.update_appointment(appointment_id, {"status": status})
        return f"Appointment {appointment_id} updated to \"{status}\"."
    except Exception as e:
        return f"Failed to update: {e}"


@tool
def delete_appointment(
    appointment_id: Annotated[str, "UUID of the appointment to delete"],
) -> str:
    """Permanently delete an appointment. Admin only. Ask for confirmation before proceeding."""
    try:
        appts_svc.delete_appointment(appointment_id)
        return f"Appointment {appointment_id} deleted permanently."
    except Exception as e:
        return f"Failed to delete: {e}"


customer_appointment_tools = [get_my_appointments, book_appointment, cancel_appointment]
staff_appointment_tools = [get_my_appointments, book_appointment_for_client, cancel_appointment, get_all_appointments, update_appointment_status]
admin_appointment_tools = [*staff_appointment_tools, delete_appointment]
