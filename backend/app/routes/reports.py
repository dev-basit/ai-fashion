from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import AuthContext, get_admin_auth
from app.services import reports as reports_svc

router = APIRouter(tags=["reports"])


@router.get("")
def get_report(
    type: Optional[str] = Query(None),
    from_: Optional[str] = Query(None, alias="from"),
    to: Optional[str] = Query(None),
    auth: AuthContext = Depends(get_admin_auth),
):
    if not type:
        raise HTTPException(status_code=400, detail="Invalid report type")
    from_date = from_ or datetime(1970, 1, 1, tzinfo=timezone.utc).isoformat()
    to_date = to or datetime.now(timezone.utc).isoformat()
    try:
        data = reports_svc.get_report(auth.supabase, type, from_date, to_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"data": data}
