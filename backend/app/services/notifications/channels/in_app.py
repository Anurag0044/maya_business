from uuid import UUID

from app.services.notifications.channels.base import DeliveryResult


class InAppChannel:
    """V1 channel: delivery is the persisted notification itself."""

    name = "IN_APP"

    async def send(
        self,
        *,
        notification_id: UUID,
        business_id: UUID,
        recipient_user_id: UUID | None,
        title: str,
        message: str,
        metadata: dict | None = None,
    ) -> DeliveryResult:
        return DeliveryResult(status="DELIVERED", provider_message_id=str(notification_id))
