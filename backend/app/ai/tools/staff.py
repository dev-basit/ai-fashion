import json
from typing import Annotated, Optional
from langchain_core.tools import tool
from app.services import staff as staff_svc


@tool
def list_staff() -> str:
    """List all staff members with their profile IDs and specializations. ADMIN ONLY."""
    data = staff_svc.list_staff()
    if not data:
        return "No staff members found."
    return json.dumps(
        [{"staff_profile_id": s["id"], "full_name": (s.get("profiles") or {}).get("full_name"), "specializations": s.get("specializations"), "is_active": s.get("is_active")} for s in data],
        indent=2,
    )


@tool
def get_my_staff_profile() -> str:
    """Get current staff member's own profile information only."""
    try:
        from app.core.context import get_current_user, get_db

        user = get_current_user()
        user_role = get_db().table("profiles").select("role").eq("id", user.id).maybe_single().execute()
        role = (user_role.data or {}).get("role") if user_role else None

        if role != "staff":
            return "❌ Error: Only staff members can view their own profile."

        # Get staff profile for current user
        staff_profile = get_db().table("staff_profiles").select("*").eq("profile_id", user.id).maybe_single().execute()
        if not staff_profile or not staff_profile.data:
            return "❌ No staff profile found for current user."

        data = staff_profile.data
        return json.dumps(
            {
                "staff_profile_id": data.get("id"),
                "profile_id": data.get("profile_id"),
                "full_name": (get_db().table("profiles").select("full_name").eq("id", user.id).maybe_single().execute().data or {}).get("full_name"),
                "specializations": data.get("specializations"),
                "is_active": data.get("is_active"),
            },
            indent=2,
        )
    except Exception as e:
        return f"❌ Error: {str(e)}"


@tool
def create_staff(
    email: Annotated[str, "Staff member's email address"],
    full_name: Annotated[str, "Staff member's full name"],
    password: Annotated[str, "Initial password"],
    phone: Annotated[Optional[str], "Staff member's phone number"] = None,
) -> str:
    """Create a new staff account. Admin only."""
    try:
        data = staff_svc.create_staff({"email": email, "full_name": full_name, "password": password, "phone": phone})
        return f"Staff member created with email {email}."
    except Exception as e:
        return f"Failed to create staff: {e}"


@tool
def update_staff(
    staff_id: Annotated[str, "UUID of the staff profile to update"],
    full_name: Annotated[Optional[str], "New full name"] = None,
    phone: Annotated[Optional[str], "New phone number"] = None,
    specializations: Annotated[Optional[list[str]], "Updated list of specializations"] = None,
    is_active: Annotated[Optional[bool], "Set false to deactivate"] = None,
) -> str:
    """Update a staff member's profile. Admin only."""
    try:
        body = {k: v for k, v in {"full_name": full_name, "phone": phone, "specializations": specializations, "is_active": is_active}.items() if v is not None}
        staff_svc.update_staff(staff_id, body)
        return f"Staff member {staff_id} updated successfully."
    except Exception as e:
        return f"Failed to update staff: {e}"


shared_staff_tools = [get_my_staff_profile]
admin_staff_tools = [*shared_staff_tools, list_staff, create_staff, update_staff]
