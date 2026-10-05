from __future__ import annotations

from app.services.channels.adapters.base import ChannelAdapter
from app.services.channels.adapters.chat import ChatChannelAdapter, WebsiteChannelAdapter
from app.services.channels.types import ChannelType


class ChannelAdapterRegistry:
    """Single registry for all customer-channel adapters."""

    def __init__(self) -> None:
        self._adapters: dict[ChannelType, ChannelAdapter] = {
            ChannelType.CHAT: ChatChannelAdapter(),
            ChannelType.WEBSITE: WebsiteChannelAdapter(),
        }

    def get(self, channel: ChannelType) -> ChannelAdapter:
        try:
            return self._adapters[channel]
        except KeyError as exc:
            raise ValueError(
                f"No adapter is registered for channel '{channel.value}'. "
                "Implement the provider adapter before enabling this channel."
            ) from exc

    def is_registered(self, channel: ChannelType) -> bool:
        return channel in self._adapters

    def capabilities(self) -> list[dict[str, object]]:
        return [
            {
                "channel": channel.value,
                "registered": self.is_registered(channel),
            }
            for channel in ChannelType
        ]
