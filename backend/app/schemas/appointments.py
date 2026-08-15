from pydantic import BaseModel
from typing import Optional

from .profiles import Profile
from .salon_services import Service
from .staff import StaffProfile


class AppointmentProduct(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    appointment_id: str
    product_id: str
    quantity: int
    notes: Optional[str] = None
    created_at: str
    products: Optional[dict] = None


class AppointmentDetail(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    client_id: str
    service_id: str
    staff_profile_id: Optional[str] = None
    starts_at: str
    ends_at: str
    status: str
    payment_status: str
    price: float
    discount: float
    notes: Optional[str] = None
    internal_notes: Optional[str] = None
    consultation_record_id: Optional[str] = None
    created_at: str
    updated_at: str
    # Nested relations
    services: Optional[Service] = None
    profiles: Optional[Profile] = None
    staff_profiles: Optional[StaffProfile] = None
