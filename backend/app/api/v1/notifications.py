from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.services.notifications.service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def list_notifications(
    unread_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    notifications = await NotificationService(db).list(
        current_user.business_id,
        user_id=current_user.id,
        unread_only=unread_only,
    )
    return {"success": True, "data": notifications, "message": "Notifications retrieved"}


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    notification = await NotificationService(db).mark_read(
        current_user.business_id,
        notification_id,
    )
    return {"success": True, "data": notification, "message": "Notification marked as read"}
