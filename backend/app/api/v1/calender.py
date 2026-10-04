from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.core.config import settings
from app.integrations.calendar.google import GoogleCalendarClient
from app.integrations.calendar.service import CalendarService
from app.models.user import User

router = APIRouter(prefix="/calendar", tags=["Calendar"])


@router.get("/connect")
async def connect_google_calendar(
    current_user: User = Depends(
        require_roles("OWNER", "ADMIN", "STAFF")
    ),
):
    if (
        not settings.google_calendar_client_id
        or not settings.google_calendar_client_secret
    ):
        raise HTTPException(
            status_code=503,
            detail="Google Calendar OAuth is not configured",
        )

    state = GoogleCalendarClient.make_state(
        str(current_user.business_id),
        str(current_user.id),
    )

    return RedirectResponse(
        GoogleCalendarClient.authorization_url(state)
    )


@router.get("/callback")
async def google_calendar_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_database),
):
    if error:
        raise HTTPException(
            status_code=400,
            detail=f"Google OAuth failed: {error}",
        )

    if not code or not state:
        raise HTTPException(
            status_code=400,
            detail="Missing OAuth code or state",
        )

    try:
        data = GoogleCalendarClient.decode_state(state)

        business_id = UUID(str(data["business_id"]))
        user_id = UUID(str(data["user_id"]))

        token = await GoogleCalendarClient.exchange_code(code)

        client = GoogleCalendarClient(
            token["access_token"],
            token.get("refresh_token"),
        )

        profile = await client.userinfo()

        await CalendarService(db).save_google_connection(
            business_id,
            user_id,
            token,
            account_email=profile.get("email"),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Google Calendar connection failed: {exc}",
        ) from exc

    return {
        "success": True,
        "data": {
            "connected": True,
            "account_email": profile.get("email"),
        },
        "message": "Google Calendar connected",
    }


@router.get("/status")
async def calendar_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return {
        "success": True,
        "data": await CalendarService(db).connection_status(
            current_user.business_id
        ),
        "message": "Calendar status",
    }


@router.get("/events")
async def calendar_events(
    time_min: datetime | None = Query(default=None),
    time_max: datetime | None = Query(default=None),
    max_results: int = Query(
        default=50,
        ge=1,
        le=2500,
    ),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    try:
        data = await CalendarService(db).list_events(
            current_user.business_id,
            time_min=time_min,
            time_max=time_max,
            max_results=max_results,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=409,
            detail=str(exc),
        ) from exc

    return {
        "success": True,
        "data": data,
        "message": "Calendar events",
    }
