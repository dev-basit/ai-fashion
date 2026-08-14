import json
from typing import Annotated, Optional

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolArg, tool

from app.ai.tools.utils import get_supabase
from app.services import clients as clients_svc


@tool
def get_clients(
    search: Annotated[Optional[str], "Search clients by name"] = None,
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """List all active clients. Optionally search by name."""
    data = clients_svc.list_clients(search=search)
    if not data:
        return "No clients found."
    return json.dumps(
        [{"id": c["id"], "full_name": c.get("full_name"), "phone": c.get("phone")} for c in data],
        indent=2,
    )


@tool
def get_client(
    client_id: Annotated[str, "UUID of the client profile"],
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Get full profile details for a specific client by their UUID."""
    data = clients_svc.get_client(client_id)
    if not data:
        return "Client not found."
    return json.dumps(data, indent=2)


@tool
def create_client(
    email: Annotated[str, "Client's email address"],
    full_name: Annotated[str, "Client's full name"],
    password: Annotated[str, "Initial password"],
    phone: Annotated[Optional[str], "Client's phone number"] = None,
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Create a new customer account. Admin only."""
    try:
        data = clients_svc.create_client({"email": email, "full_name": full_name, "password": password, "phone": phone})
        return f"Client \"{data.get('full_name')}\" created with email {email}."
    except Exception as e:
        return f"Failed to create client: {e}"


@tool
def update_client(
    client_id: Annotated[str, "UUID of the client profile"],
    full_name: Annotated[Optional[str], "New full name"] = None,
    phone: Annotated[Optional[str], "New phone number"] = None,
    is_active: Annotated[Optional[bool], "Set false to deactivate the account"] = None,
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Update a client's profile details. Admin or staff can do this."""
    try:
        body = {k: v for k, v in {"full_name": full_name, "phone": phone, "is_active": is_active}.items() if v is not None}
        clients_svc.update_client(client_id, body)
        return f"Client {client_id} updated successfully."
    except Exception as e:
        return f"Failed to update client: {e}"


staff_client_tools = [get_clients, get_client, update_client]
admin_client_tools = [*staff_client_tools, create_client]
