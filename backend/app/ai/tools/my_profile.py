import json
from langchain_core.tools import tool
from app.services import profiles as profiles_svc


@tool
def get_my_profile() -> str:
    """Get the current logged-in user's own profile details (name, email, phone, role, etc.)."""

    profile = profiles_svc.get_me()
    return json.dumps(profile, indent=2)


my_profile_tools = [get_my_profile]
