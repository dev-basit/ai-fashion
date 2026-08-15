from pydantic import BaseModel
from typing import Optional

from .profiles import Profile


class StaffSchedule(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    staff_profile_id: str
    day_of_week: int
    start_time: str
    end_time: str
    is_working: bool
    created_at: str
    updated_at: str


class StaffLeave(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    staff_profile_id: str
    starts_at: str
    ends_at: str
    reason: Optional[str] = None
    approved_by: Optional[str] = None
    created_at: str


class StaffProfile(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    profile_id: str
    bio: Optional[str] = None
    specializations: Optional[list[str]] = None
    certifications: Optional[list[str]] = None
    hire_date: Optional[str] = None
    hourly_rate: Optional[float] = None
    commission_rate: Optional[float] = None
    is_available: bool
    created_at: str
    updated_at: str
    profiles: Optional[Profile] = None


class StaffDetail(StaffProfile):
    staff_services: Optional[list[dict]] = None
