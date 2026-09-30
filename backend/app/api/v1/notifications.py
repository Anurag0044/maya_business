from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.models.user import User
from app.schemas.notification import (
    NotificationAttemptResponse,
    NotificationCreate,
    NotificationResponse,
)
from app.services.notifications.channels.registry import registry
from app.services.notifications.service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    unread_only: bool = Query(default=False),
    notification_type: str | None = Query(default=None),
    channel: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await NotificationService(db).list(
        current_user.business_id,
        user_id=current_user.id,
        unread_only=unread_only,
        notification_type=notification_type,
        channel=channel,
        limit=limit,
    )


@router.get("/count")
async def unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    count = await NotificationService(db).unread_count(
        current_user.business_id,
        user_id=current_user.id,
    )
    return {"success": True, "data": {"unread_count": count}, "message": "Unread count retrieved"}


@router.get("/channels")
async def available_channels(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": {"channels": registry.available()},
        "message": "Notification channels retrieved",
    }


@router.post("", response_model=NotificationResponse, status_code=201)
async def create_notification(
    payload: NotificationCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await NotificationService(db).create(
        current_user.business_id,
        **payload.model_dump(),
    )


@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await NotificationService(db).get(current_user.business_id, notification_id)


@router.get("/{notification_id}/attempts", response_model=list[NotificationAttemptResponse])
async def list_attempts(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await NotificationService(db).attempts(
        current_user.business_id,
        notification_id,
    )


@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await NotificationService(db).mark_read(current_user.business_id, notification_id)


@router.post("/{notification_id}/unread", response_model=NotificationResponse)
async def mark_unread(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await NotificationService(db).mark_unread(current_user.business_id, notification_id)


@router.post("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    count = await NotificationService(db).mark_all_read(
        current_user.business_id,
        user_id=current_user.id,
    )
    return {"success": True, "data": {"updated": count}, "message": "Notifications marked as read"}


@router.post("/{notification_id}/cancel", response_model=NotificationResponse)
async def cancel_notification(
    notification_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await NotificationService(db).cancel(current_user.business_id, notification_id)
