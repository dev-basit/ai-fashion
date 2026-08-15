from typing import Any, cast
from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_admin_auth
from app.core.context import get_current_user, get_db
from app.services import profiles as profiles_svc

router = APIRouter(tags=["profiles"])


@router.get("")
def list_profiles(auth = Depends(get_admin_auth)):
    data = profiles_svc.list_profiles()
    return {"data": data}


@router.get("/{profile_id}")
def get_profile(profile_id: str):
    data = profiles_svc.get_profile(profile_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{profile_id}")
def update_profile(profile_id: str, body: dict):
    user = get_current_user()
    if profile_id != user.id:
        me = get_db().table("profiles").select("role").eq("id", user.id).maybe_single().execute()
        me_data: dict[str, Any] = cast(dict[str, Any], me.data) if me is not None and me.data else {}
        if not me_data or me_data.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
    data = profiles_svc.update_profile(profile_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}
