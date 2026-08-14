from fastapi import APIRouter, Depends

from app.core.auth import AuthContext, get_auth
from app.services import notifications as notif_svc

router = APIRouter(tags=["notifications"])


@router.get("/unread-count")
def get_unread_count(auth: AuthContext = Depends(get_auth)):
    count = notif_svc.get_unread_count(auth.supabase, auth.user.id)
    return {"data": {"count": count}}


@router.post("/read-all")
def mark_all_read(auth: AuthContext = Depends(get_auth)):
    notif_svc.mark_all_read(auth.supabase, auth.user.id)
    return {"success": True}


@router.get("")
def list_notifications(auth: AuthContext = Depends(get_auth)):
    return {"data": notif_svc.list_notifications(auth.supabase, auth.user.id)}


@router.post("/{notification_id}/read")
def mark_read(notification_id: str, auth: AuthContext = Depends(get_auth)):
    notif_svc.mark_read(auth.supabase, notification_id, auth.user.id)
    return {"success": True}
