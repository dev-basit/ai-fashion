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
        me = get_db().table("profiles").select("role").eq("id", user.id).single().execute()
        if not me.data or me.data.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
    data = profiles_svc.update_profile(profile_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}
