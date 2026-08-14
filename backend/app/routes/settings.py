from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.auth import AuthContext, get_auth
from app.services import settings as settings_svc

router = APIRouter(tags=["settings"])


@router.get("")
def get_settings(
    key: Optional[str] = Query(None),
    auth: AuthContext = Depends(get_auth),
):
    return {"data": settings_svc.get_settings(auth.supabase, key=key)}


@router.patch("")
def update_setting(body: dict, auth: AuthContext = Depends(get_auth)):
    data = settings_svc.update_setting(auth.supabase, auth.user.id, body["key"], body["value"])
    return {"data": data}
