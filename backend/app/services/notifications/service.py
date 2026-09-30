from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.notification import Notification, NotificationAttempt
from app.models.user import User
from app.services.notifications.channels.registry import registry


MAX_ATTEMPTS = 3
RETRY_DELAYS_SECONDS = (60, 300)


class NotificationService:
    """Central notification lifecycle and delivery service.

    Responsibilities:
    - create and schedule notifications
    - route notifications through a channel adapter
    - track delivery state and attempts
    - expose read/unread operations
    - retry failed deliveries with bounded backoff
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        business_id: UUID,
        *,
        user_id: UUID | None = None,
        unread_only: bool = False,
        notification_type: str | None = None,
        channel: str | None = None,
        limit: int = 50,
    ) -> list[Notification]:
        query = (
            select(Notification)
            .where(Notification.business_id == business_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )

        if user_id:
            query = query.where(
                (Notification.user_id == user_id) | Notification.user_id.is_(None)
            )
        if unread_only:
            query = query.where(Notification.status == "UNREAD")
        if notification_type:
            query = query.where(Notification.type == notification_type)
        if channel:
            query = query.where(Notification.channel == channel.upper())

        result = await self.db.scalars(query)
        return list(result)

    async def get(self, business_id: UUID, notification_id: UUID) -> Notification:
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
        return notification

    async def create(
        self,
        business_id: UUID,
        *,
        title: str,
        message: str,
        notification_type: str,
        user_id: UUID | None = None,
        channel: str = "IN_APP",
        priority: str = "NORMAL",
        scheduled_at: datetime | None = None,
        related_entity_type: str | None = None,
        related_entity_id: UUID | None = None,
        metadata: dict | None = None,
    ) -> Notification:
        channel_name = channel.upper()
        registry.get(channel_name)  # Validate before persisting.

        if user_id is not None:
            user = await self.db.scalar(
                select(User).where(
                    User.id == user_id,
                    User.business_id == business_id,
                )
            )
            if not user:
                raise AppException(
                    "Notification recipient is not part of this business",
                    "NOTIFICATION_RECIPIENT_INVALID",
                    400,
                )

        now = datetime.now(timezone.utc)
        if scheduled_at is not None and scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)

        notification = Notification(
            business_id=business_id,
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            channel=channel_name,
            status="UNREAD",
            delivery_status="PENDING",
            priority=priority.upper(),
            scheduled_at=scheduled_at,
            metadata_json=metadata,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
        )
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)

        # No scheduled time means "deliver now". A past/equal scheduled time
        # is also due immediately.
        if scheduled_at is None or scheduled_at <= now:
            await self._dispatch(notification)

        return await self.db.merge(notification)

    async def process_due(self, *, limit: int = 100) -> int:
        """Claim and dispatch due notifications. Returns processed count."""
        now = datetime.now(timezone.utc)
        result = await self.db.scalars(
            select(Notification)
            .where(
                Notification.delivery_status == "PENDING",
                Notification.scheduled_at.is_not(None),
                Notification.scheduled_at <= now,
            )
            .order_by(Notification.scheduled_at, Notification.created_at)
            .limit(limit)
            .with_for_update(skip_locked=True)
        )
        due = list(result)

        processed = 0
        for notification in due:
            # Single-worker V1 claim. This state is committed before the
            # provider call so the row cannot be selected again immediately.
            notification.delivery_status = "PROCESSING"
            await self.db.commit()
            await self.db.refresh(notification)

            await self._dispatch(notification)
            processed += 1

        return processed

    async def _dispatch(self, notification: Notification) -> Notification:
        if notification.delivery_status == "CANCELLED":
            return notification

        now = datetime.now(timezone.utc)
        attempt_number = notification.attempt_count + 1
        notification.attempt_count = attempt_number

        try:
            channel = registry.get(notification.channel)
            result = await channel.send(
                notification_id=notification.id,
                business_id=notification.business_id,
                recipient_user_id=notification.user_id,
                title=notification.title,
                message=notification.message,
                metadata=notification.metadata_json,
            )

            attempt = NotificationAttempt(
                notification_id=notification.id,
                business_id=notification.business_id,
                attempt_number=attempt_number,
                channel=notification.channel,
                status=result.status,
                provider_message_id=result.provider_message_id,
                error=result.error,
            )
            self.db.add(attempt)

            if result.status in {"SENT", "DELIVERED"}:
                notification.delivery_status = result.status
                notification.provider_message_id = result.provider_message_id
                notification.sent_at = notification.sent_at or now
                notification.delivered_at = now if result.status == "DELIVERED" else notification.delivered_at
                notification.failed_at = None
                notification.failure_reason = None
                notification.scheduled_at = None
                await self.db.commit()
                await self.db.refresh(notification)
                return notification

            await self._handle_failure(notification, result.error or "Channel reported failure")
            return notification

        except Exception as exc:
            self.db.add(
                NotificationAttempt(
                    notification_id=notification.id,
                    business_id=notification.business_id,
                    attempt_number=attempt_number,
                    channel=notification.channel,
                    status="FAILED",
                    error=str(exc),
                )
            )
            await self._handle_failure(notification, str(exc))
            return notification

    async def _handle_failure(self, notification: Notification, reason: str) -> None:
        now = datetime.now(timezone.utc)
        notification.failed_at = now
        notification.failure_reason = reason[:2000]

        if notification.attempt_count < MAX_ATTEMPTS:
            retry_index = min(notification.attempt_count - 1, len(RETRY_DELAYS_SECONDS) - 1)
            notification.delivery_status = "PENDING"
            notification.scheduled_at = now + timedelta(seconds=RETRY_DELAYS_SECONDS[retry_index])
        else:
            notification.delivery_status = "FAILED"
            notification.scheduled_at = None

        await self.db.commit()
        await self.db.refresh(notification)

    async def attempts(
        self,
        business_id: UUID,
        notification_id: UUID,
    ) -> list[NotificationAttempt]:
        await self.get(business_id, notification_id)
        result = await self.db.scalars(
            select(NotificationAttempt)
            .where(
                NotificationAttempt.business_id == business_id,
                NotificationAttempt.notification_id == notification_id,
            )
            .order_by(NotificationAttempt.attempt_number)
        )
        return list(result)

    async def unread_count(self, business_id: UUID, *, user_id: UUID | None = None) -> int:
        query = select(func.count(Notification.id)).where(
            Notification.business_id == business_id,
            Notification.status == "UNREAD",
            Notification.delivery_status.in_(("SENT", "DELIVERED")),
        )
        if user_id:
            query = query.where(
                (Notification.user_id == user_id) | Notification.user_id.is_(None)
            )
        return int((await self.db.scalar(query)) or 0)

    async def mark_read(self, business_id: UUID, notification_id: UUID) -> Notification:
        notification = await self.get(business_id, notification_id)
        if notification.delivery_status not in {"SENT", "DELIVERED"}:
            raise AppException(
                "Only delivered notifications can be marked as read",
                "NOTIFICATION_NOT_DELIVERED",
                400,
            )
        notification.status = "READ"
        notification.read_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def mark_unread(self, business_id: UUID, notification_id: UUID) -> Notification:
        notification = await self.get(business_id, notification_id)
        notification.status = "UNREAD"
        notification.read_at = None
        await self.db.commit()
        await self.db.refresh(notification)
        return notification

    async def mark_all_read(self, business_id: UUID, *, user_id: UUID | None = None) -> int:
        query = select(Notification).where(
            Notification.business_id == business_id,
            Notification.status == "UNREAD",
            Notification.delivery_status.in_(("SENT", "DELIVERED")),
        )
        if user_id:
            query = query.where(
                (Notification.user_id == user_id) | Notification.user_id.is_(None)
            )

        notifications = list(await self.db.scalars(query))
        now = datetime.now(timezone.utc)
        for notification in notifications:
            notification.status = "READ"
            notification.read_at = now
        await self.db.commit()
        return len(notifications)

    async def cancel(self, business_id: UUID, notification_id: UUID) -> Notification:
        notification = await self.get(business_id, notification_id)
        if notification.delivery_status in {"DELIVERED", "SENT"}:
            raise AppException(
                "Delivered notifications cannot be cancelled",
                "NOTIFICATION_ALREADY_DELIVERED",
                400,
            )
        notification.delivery_status = "CANCELLED"
        notification.scheduled_at = None
        await self.db.commit()
        await self.db.refresh(notification)
        return notification
