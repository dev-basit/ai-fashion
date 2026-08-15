import json
from typing import Annotated, Optional

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolArg, tool

from app.ai.tools.utils import get_user_id
from app.services import settings as settings_svc


@tool
def get_settings(
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Get current business settings (name, contact details, working hours, booking rules). Admin only."""
    data = settings_svc.get_settings()
    return json.dumps(data, indent=2)


@tool
def update_settings(
    key: Annotated[str, "The settings key to update"],
    value: Annotated[str, "The new value"],
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Update a business setting. Admin only. Confirm with admin before updating."""
    try:
        settings_svc.update_setting(get_user_id(config), key, value)
        return "Business settings updated successfully."
    except Exception as e:
        return f"Failed to update settings: {e}"


settings_tools = [get_settings, update_settings]
