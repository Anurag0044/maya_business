from dataclasses import dataclass
from typing import Protocol
from uuid import UUID


@dataclass(frozen=True)
class DeliveryResult:
    status: str  # SENT, DELIVERED, FAILED
    provider_message_id: str | None = None
    error: str | None = None


class NotificationChannel(Protocol):
    name: str

    async def send(
        self,
        *,
        notification_id: UUID,
        business_id: UUID,
        recipient_user_id: UUID | None,
        title: str,
        message: str,
        metadata: dict | None = None,
    ) -> DeliveryResult: ...
