import json
from typing import Annotated
from langchain_core.tools import tool
from app.services import settings as settings_svc


@tool
def get_settings() -> str:
    """Get current business settings (name, contact details, working hours, booking rules). Admin only."""
    data = settings_svc.get_settings()
    return json.dumps(data, indent=2)


@tool
def update_settings(
    key: Annotated[str, "The settings key to update"],
    value: Annotated[str, "The new value"],
) -> str:
    """Update a business setting. Admin only. Confirm with admin before updating."""
    try:
        settings_svc.update_setting(key, value)
        return "Business settings updated successfully."
    except Exception as e:
        return f"Failed to update settings: {e}"


settings_tools = [get_settings, update_settings]
