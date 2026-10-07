from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from app.integrations.whatsapp.client import WhatsAppClient
from app.services.channels.adapters.base import (
    ChannelAdapter,
    ChannelDeliveryResult,
)
from app.services.channels.types import (
    ChannelType,
    MessageType,
    NormalizedInboundMessage,
    NormalizedOutboundMessage,
)
from app.services.whatsapp.service import WhatsAppConnectionService


class WhatsAppChannelAdapter(ChannelAdapter):
    """Meta WhatsApp Cloud API adapter.

    All Meta-specific payload parsing and delivery lives here. The MAYA
    Conversation Engine only sees normalized channel messages.
    """

    channel = ChannelType.WHATSAPP

    def __init__(self, db=None):
        self.db = db

    def normalize_inbound(
        self,
        *,
        business_id: UUID,
        payload: Any,
        metadata: dict[str, Any] | None = None,
    ) -> NormalizedInboundMessage:
        if not isinstance(payload, dict):
            raise ValueError("WhatsApp payload must be an object")

        value = payload.get("value") or {}
        messages = value.get("messages") or []
        contacts = value.get("contacts") or []

        if not messages:
            raise ValueError("WhatsApp webhook contains no message")

        message = messages[0]
        contact = contacts[0] if contacts else {}

        message_type = message.get("type", "text")
        if message_type == "text":
            body = ((message.get("text") or {}).get("body") or "").strip()
            normalized_type = MessageType.TEXT
            attachments = []
        else:
            body = self._message_preview(message, message_type)
            normalized_type = self._map_message_type(message_type)
            attachments = [self._attachment(message, message_type)]

        if not body:
            raise ValueError(
                "WhatsApp message has no supported text content"
            )

        external_user_id = str(message.get("from") or "").strip()
        external_message_id = message.get("id")

        if not external_user_id:
            raise ValueError("WhatsApp message has no sender")
        if not external_message_id:
            raise ValueError("WhatsApp message has no message ID")

        timestamp = message.get("timestamp")
        received_at = datetime.now(timezone.utc)
        if timestamp:
            try:
                received_at = datetime.fromtimestamp(
                    int(timestamp),
                    tz=timezone.utc,
                )
            except (TypeError, ValueError, OSError):
                pass

        metadata_out = {
            **(metadata or {}),
            "whatsapp": {
                "phone_number_id": value.get("metadata", {}).get(
                    "phone_number_id"
                ),
                "display_phone_number": value.get("metadata", {}).get(
                    "display_phone_number"
                ),
                "message_type": message_type,
            },
        }

        return NormalizedInboundMessage(
            business_id=business_id,
            channel=self.channel,
            external_user_id=external_user_id,
            session_id=f"WHATSAPP:{external_user_id}",
            external_message_id=external_message_id,
            message=body,
            provider="META_WHATSAPP_CLOUD_API",
            display_name=(contact.get("profile") or {}).get("name"),
            phone_number=contact.get("wa_id") or external_user_id,
            message_type=normalized_type,
            attachments=attachments,
            received_at=received_at,
            raw_event_id=payload.get("_raw_event_id"),
            metadata=metadata_out,
        )

    async def send(
        self,
        outbound: NormalizedOutboundMessage,
    ) -> ChannelDeliveryResult:
        if self.db is None:
            return ChannelDeliveryResult(
                success=False,
                status="FAILED",
                error="WhatsApp adapter requires a database session",
            )

        connection_service = WhatsAppConnectionService(self.db)
        connection = await connection_service.get_for_business(
            outbound.business_id
        )

        if not connection or not connection.is_active:
            return ChannelDeliveryResult(
                success=False,
                status="FAILED",
                error="WhatsApp is not connected for this business",
            )

        client = WhatsAppClient(
            access_token=connection_service.decrypt(
                connection.access_token_encrypted
            ),
            phone_number_id=connection.phone_number_id,
        )

        if outbound.message_type != MessageType.TEXT:
            return ChannelDeliveryResult(
                success=False,
                status="FAILED",
                error=(
                    f"WhatsApp outbound type "
                    f"{outbound.message_type.value} is not implemented yet"
                ),
            )

        try:
            response = await client.send_text(
                to=outbound.external_user_id,
                body=outbound.message,
                reply_to_message_id=outbound.reply_to_external_message_id,
            )
        except Exception as exc:
            return ChannelDeliveryResult(
                success=False,
                status="FAILED",
                error=str(exc),
            )

        provider_message_id = None
        messages = response.get("messages") or []
        if messages:
            provider_message_id = messages[0].get("id")

        return ChannelDeliveryResult(
            success=True,
            status="SENT",
            provider_message_id=provider_message_id,
            metadata={"provider_response": response},
        )

    @staticmethod
    def _map_message_type(message_type: str) -> MessageType:
        return {
            "image": MessageType.IMAGE,
            "audio": MessageType.AUDIO,
            "video": MessageType.VIDEO,
            "document": MessageType.DOCUMENT,
            "location": MessageType.LOCATION,
            "contacts": MessageType.CONTACT,
        }.get(message_type, MessageType.UNKNOWN)

    @staticmethod
    def _attachment(
        message: dict[str, Any],
        message_type: str,
    ) -> dict[str, Any]:
        content = message.get(message_type) or {}
        result = {"type": message_type}

        for key in (
            "id",
            "mime_type",
            "filename",
            "caption",
            "sha256",
        ):
            if content.get(key) is not None:
                result[key] = content[key]

        return result

    @staticmethod
    def _message_preview(
        message: dict[str, Any],
        message_type: str,
    ) -> str:
        if message_type == "location":
            location = message.get("location") or {}
            return (
                f"Customer shared a location"
                f" ({location.get('latitude')}, {location.get('longitude')})."
            )

        if message_type == "contacts":
            return "Customer shared a contact."

        content = message.get(message_type) or {}
        caption = content.get("caption")
        if caption:
            return str(caption).strip()

        return f"Customer sent a {message_type} message."
