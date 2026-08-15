from types import SimpleNamespace

import jwt
from jwt import PyJWKClient
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.config import config
from app.core.context import _db_var, _user_var, _token_var
from app.core.supabase import get_db_client

_jwks_client = PyJWKClient(f"{config.supabase_url}/auth/v1/.well-known/jwks.json", cache_keys=True)
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

PUBLIC_PATHS = {"/health"}


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    if request.url.path in PUBLIC_PATHS:
        return await call_next(request)

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    token = auth_header.removeprefix("Bearer ")
    try:
        signing_key = _jwks_client.get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256", "HS256"],
            options={"verify_aud": False},
        )
    except Exception as e:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    user = SimpleNamespace(
        id=claims["sub"],
        email=claims.get("email", ""),
        user_metadata=claims.get("user_metadata", {}),
    )

    t1 = _user_var.set(user)
    t2 = _token_var.set(token)
    t3 = _db_var.set(get_db_client(token))
    try:
        return await call_next(request)
    finally:
        _user_var.reset(t1)
        _token_var.reset(t2)
        _db_var.reset(t3)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.frontend_url],
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
