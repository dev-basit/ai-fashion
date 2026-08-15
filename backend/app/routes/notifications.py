from fastapi import APIRouter
from app.services import notifications as notif_svc

router = APIRouter(tags=["notifications"])


@router.get("/unread-count")
def get_unread_count():
    count = notif_svc.get_unread_count()
    return {"data": {"count": count}}


@router.post("/read-all")
def mark_all_read():
    notif_svc.mark_all_read()
    return {"success": True}


@router.get("")
def list_notifications():
    return {"data": notif_svc.list_notifications()}


@router.post("/{notification_id}/read")
def mark_read(notification_id: str):
    notif_svc.mark_read(notification_id)
    return {"success": True}
