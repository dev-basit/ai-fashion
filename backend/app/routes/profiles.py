from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import AuthContext, get_admin_auth, get_auth
from app.services import profiles as profiles_svc

router = APIRouter(tags=["profiles"])


@router.get("")
def list_profiles(auth: AuthContext = Depends(get_admin_auth)):
    data = profiles_svc.list_profiles(auth.supabase)
    return {"data": data}


@router.get("/{profile_id}")
def get_profile(profile_id: str, auth: AuthContext = Depends(get_auth)):
    data = profiles_svc.get_profile(auth.supabase, profile_id)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}


@router.patch("/{profile_id}")
def update_profile(profile_id: str, body: dict, auth: AuthContext = Depends(get_auth)):
    if profile_id != auth.user.id:
        me = auth.supabase.table("profiles").select("role").eq("id", auth.user.id).single().execute()
        if not me.data or me.data.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
    data = profiles_svc.update_profile(auth.supabase, profile_id, body)
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return {"data": data}
