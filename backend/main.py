from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routes import health
from app.routes import me, profiles
from app.routes import salon_services, products, clients, staff
from app.routes import appointments, orders
from app.routes import consultation, treatment_plans
from app.routes import notifications
from app.routes import settings as settings_router
from app.routes import reports
from app.routes import chat
from app.routes import ai

app = FastAPI(title="Glow By Miral API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(health.router)
app.include_router(me.router, prefix="/me")
app.include_router(profiles.router, prefix="/profiles")
app.include_router(salon_services.router, prefix="/services")
app.include_router(products.router, prefix="/products")
app.include_router(clients.router, prefix="/clients")
app.include_router(staff.router, prefix="/staff")
app.include_router(appointments.router, prefix="/appointments")
app.include_router(orders.router, prefix="/orders")
app.include_router(consultation.router, prefix="/consultation")
app.include_router(treatment_plans.router, prefix="/treatment-plans")
app.include_router(notifications.router, prefix="/notifications")
app.include_router(settings_router.router, prefix="/settings")
app.include_router(reports.router, prefix="/reports")
app.include_router(chat.router, prefix="/chat")
app.include_router(ai.router, prefix="/ai")
