from pydantic import BaseModel
from typing import Optional


class ConsultationField(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    label: str
    type: str
    required: bool
    options: Optional[list[str]] = None
    placeholder: Optional[str] = None


class ConsultationFormTemplate(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    name: str
    description: Optional[str] = None
    fields: list[ConsultationField]
    is_active: bool
    created_at: str
    updated_at: str


class ConsultationRecord(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    template_id: Optional[str] = None
    client_id: str
    staff_profile_id: Optional[str] = None
    appointment_id: Optional[str] = None
    responses: dict
    observations: Optional[str] = None
    recommendations: Optional[list[str]] = None
    submitted_at: Optional[str] = None
    created_at: str
    updated_at: str
    profiles: Optional[dict] = None
    staff_profiles: Optional[dict] = None
    consultation_form_templates: Optional[ConsultationFormTemplate] = None
