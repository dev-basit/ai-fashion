from fastapi import APIRouter, Depends

from app.core.auth import AuthContext, get_auth
from app.services import profiles as profiles_svc

router = APIRouter(tags=["me"])


@router.get("")
def get_me(auth: AuthContext = Depends(get_auth)):
    data = profiles_svc.get_me(auth.supabase, auth.user)
    return {"data": data}
