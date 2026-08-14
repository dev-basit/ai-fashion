from typing import Annotated

from fastapi import Depends, Header, HTTPException
from supabase import Client

from app.core.supabase import get_admin_client, get_user_client


class AuthContext:
    def __init__(self, user, supabase: Client, token: str):
        self.user = user
        self.supabase = supabase
        self.token = token


def get_auth(authorization: Annotated[str | None, Header()] = None) -> AuthContext:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.removeprefix("Bearer ")
    response = get_admin_client().auth.get_user(token)
    if not response.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return AuthContext(user=response.user, supabase=get_user_client(token), token=token)


def get_admin_auth(auth: AuthContext = Depends(get_auth)) -> AuthContext:
    result = (
        auth.supabase.table("profiles")
        .select("role")
        .eq("id", auth.user.id)
        .single()
        .execute()
    )
    if not result.data or result.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return auth
