from fastapi import APIRouter

from app.services import profiles as profiles_svc

router = APIRouter(tags=["me"])


@router.get("")
def get_me():
    data = profiles_svc.get_me()
    return {"data": data}
