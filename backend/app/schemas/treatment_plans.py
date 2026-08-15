from pydantic import BaseModel
from typing import Optional


class TreatmentPlanStep(BaseModel):
    model_config = {"extra": "allow"}
    day: int
    title: str
    description: str
    service_id: Optional[str] = None
    recommended_products: Optional[list[str]] = None


class TreatmentPlanTemplate(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    name: str
    description: Optional[str] = None
    duration_days: int
    steps: list[TreatmentPlanStep]
    created_by: Optional[str] = None
    is_active: bool
    created_at: str
    updated_at: str


class ClientTreatmentPlan(BaseModel):
    model_config = {"extra": "allow"}
    id: str
    template_id: Optional[str] = None
    client_id: str
    assigned_by: Optional[str] = None
    name: str
    starts_on: str
    ends_on: Optional[str] = None
    status: str
    progress_notes: list[dict]
    created_at: str
    updated_at: str
    profiles: Optional[dict] = None
    treatment_plan_templates: Optional[TreatmentPlanTemplate] = None
