from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.notification import Notification


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        business_id: UUID,
        *,
        user_id: UUID | None = None,
        unread_only: bool = False,
    ) -> list[Notification]:
        query = (
            select(Notification)
            .where(Notification.business_id == business_id)
            .order_by(Notification.created_at.desc())
        )

        if user_id:
            query = query.where(
                (Notification.user_id == user_id) |
                (Notification.user_id.is_(None))
            )

        if unread_only:
            query = query.where(Notification.status == "UNREAD")

        result = await self.db.scalars(query)
        return list(result)

    async def create(
        self,
        business_id: UUID,
        *,
        title: str,
        message: str,
        notification_type: str,
        user_id: UUID | None = None,
        channel: str = "IN_APP",
        related_entity_type: str | None = None,
        related_entity_id: UUID | None = None,
    ) -> Notification:
        notification = Notification(
            business_id=business_id,
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            channel=channel,
            status="UNREAD",
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
        )
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def mark_read(
        self,
        business_id: UUID,
        notification_id: UUID,
    ) -> Notification:
        notification = await self.db.scalar(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.business_id == business_id,
            )
        )
        if not notification:
            raise AppException(
                "Notification not found",
                "NOTIFICATION_NOT_FOUND",
                404,
            )

        from datetime import datetime, timezone

        notification.status = "READ"
        notification.read_at = datetime.now(timezone.utc)

        await self.db.commit()
        await self.db.refresh(notification)
        return notification
