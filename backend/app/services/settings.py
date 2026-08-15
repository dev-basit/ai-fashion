from datetime import datetime, timezone
from typing import Optional

from app.core.context import get_db, get_current_user
from app.schemas.settings import BusinessSetting


def get_settings(key: Optional[str] = None) -> list:
    query = get_db().table("business_settings").select("*")
    if key:
        query = query.eq("key", key)
    return query.execute().data or []


def update_setting(key: str, value) -> BusinessSetting | None:
    user = get_current_user()
    result = (
        get_db().table("business_settings")
        .update({"value": value, "updated_by": user.id, "updated_at": datetime.now(timezone.utc).isoformat()})
        .eq("key", key)
        .select()
        .maybe_single()
        .execute()
    )
    if result is None or result.data is None:
        return None
    return BusinessSetting.model_validate(result.data)
