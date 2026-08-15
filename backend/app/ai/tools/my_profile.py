import json
from typing import Annotated

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolArg, tool

from app.ai.tools.utils import get_user_id
from app.services import profiles as profiles_svc


@tool
def get_my_profile(
    config: Annotated[RunnableConfig, InjectedToolArg] = None,
) -> str:
    """Get the current logged-in user's own profile details (name, email, phone, role, etc.)."""

    class _User:
        def __init__(self, user_id: str):
            self.id = user_id
            self.email = None

    user_id = get_user_id(config)
    profile = profiles_svc.get_me(_User(user_id))
    return json.dumps(profile, indent=2)


my_profile_tools = [get_my_profile]
