from fastapi import HTTPException

from app.core.context import get_db, get_current_user


def require_admin():
    user = get_current_user()
    db = get_db()
    result = db.table("profiles").select("role").eq("id", user.id).single().execute()
    if not result.data or result.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
