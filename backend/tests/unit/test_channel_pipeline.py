from uuid import uuid4

import pytest

from app.services.channels.adapters.chat import ChatChannelAdapter
from app.services.channels.registry import ChannelAdapterRegistry
from app.services.channels.types import (
    ChannelType,
    NormalizedInboundMessage,
)


def test_channel_registry_exposes_unified_channels():
    registry = ChannelAdapterRegistry()

    capabilities = registry.capabilities()
    channels = {item["channel"] for item in capabilities}

    assert {
        "CHAT",
        "WHATSAPP",
        "INSTAGRAM",
        "FACEBOOK",
        "SMS",
        "EMAIL",
        "WEBSITE",
        "VOICE",
    }.issubset(channels)

    assert registry.is_registered(ChannelType.CHAT) is True
    assert registry.is_registered(ChannelType.WEBSITE) is True
    assert registry.is_registered(ChannelType.WHATSAPP) is False


def test_chat_adapter_normalizes_into_canonical_envelope():
    business_id = uuid4()
    adapter = ChatChannelAdapter()

    message = adapter.normalize_inbound(
        business_id=business_id,
        payload={
            "external_user_id": "visitor-123",
            "session_id": "web-123",
            "external_message_id": "msg-123",
            "message": "Hello MAYA",
        },
    )

    assert isinstance(message, NormalizedInboundMessage)
    assert message.business_id == business_id
    assert message.channel == ChannelType.CHAT
    assert message.external_user_id == "visitor-123"
    assert message.session_id == "web-123"
    assert message.external_message_id == "msg-123"
    assert message.message == "Hello MAYA"


@pytest.mark.asyncio
async def test_chat_adapter_outbound_is_provider_neutral():
    from app.services.channels.types import NormalizedOutboundMessage

    adapter = ChatChannelAdapter()
    result = await adapter.send(
        NormalizedOutboundMessage(
            business_id=uuid4(),
            channel=ChannelType.CHAT,
            external_user_id="visitor-123",
            message="Hello",
        )
    )

    assert result.success is True
    assert result.status == "SENT"
