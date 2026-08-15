from fastapi import HTTPException
from app.core.context import get_db, get_current_user


def require_admin():
    user = get_current_user()
    db = get_db()
    result = db.table("profiles").select("role").eq("id", user.id).maybe_single().execute()
    data = result.data if result is not None else None
    if not isinstance(data, dict) or data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")


def get_admin_auth():
    
    require_admin()
