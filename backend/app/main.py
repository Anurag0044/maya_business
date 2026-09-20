from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.auth import router as auth_router
from app.api.v1.ai import router as ai_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.followups import router as followups_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.calls import router as calls_router
from app.api.v1.leads import router as leads_router
from app.api.v1.knowledge import router as knowledge_router
from app.api.v1.business import router as business_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import configure_logging
from app.db.session import close_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    yield
    await close_db()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Standalone AI Front Desk backend.",
    debug=settings.debug,
    lifespan=lifespan,
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(followups_router, prefix="/api/v1")
app.include_router(appointments_router, prefix="/api/v1")
app.include_router(calls_router, prefix="/api/v1")
app.include_router(leads_router, prefix="/api/v1")
app.include_router(knowledge_router, prefix="/api/v1")
app.include_router(business_router, prefix="/api/v1")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(_: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "message": exc.message,
            "error_code": exc.error_code,
        },
    )


@app.get("/health")
async def health():
    return {
        "success": True,
        "data": {"status": "ok", "environment": settings.environment},
        "message": "MAYA Front Desk is running",
    }
