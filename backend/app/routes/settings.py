from typing import Optional

from fastapi import APIRouter, Query

from app.services import settings as settings_svc

router = APIRouter(tags=["settings"])


@router.get("")
def get_settings(
    key: Optional[str] = Query(None),
):
    return {"data": settings_svc.get_settings(key=key)}


@router.patch("")
def update_setting(body: dict):
    data = settings_svc.update_setting(body["key"], body["value"])
    return {"data": data}
