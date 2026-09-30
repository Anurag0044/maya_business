from app.core.exceptions import AppException
from app.services.notifications.channels.base import NotificationChannel
from app.services.notifications.channels.in_app import InAppChannel


class NotificationChannelRegistry:
    """Central channel registry. External adapters are added here later."""

    def __init__(self) -> None:
        self._channels: dict[str, NotificationChannel] = {
            "IN_APP": InAppChannel(),
        }

    def register(self, channel: NotificationChannel) -> None:
        self._channels[channel.name] = channel

    def get(self, name: str) -> NotificationChannel:
        channel = self._channels.get(name.upper())
        if channel is None:
            raise AppException(
                f"Notification channel '{name}' is not available",
                "NOTIFICATION_CHANNEL_UNAVAILABLE",
                400,
            )
        return channel

    def available(self) -> list[str]:
        return sorted(self._channels)


registry = NotificationChannelRegistry()
