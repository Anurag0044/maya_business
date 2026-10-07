from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.channels.registry import ChannelAdapterRegistry
from app.services.channels.types import ChannelType
from app.services.whatsapp.service import WhatsAppConnectionService


CHANNEL_CATALOG: dict[ChannelType, dict] = {
    ChannelType.CHAT: {
        "label": "Chat",
        "description": "Authenticated MAYA chat/test channel.",
        "external": False,
        "provider": "MAYA",
        "setup_required": [],
    },
    ChannelType.WHATSAPP: {
        "label": "WhatsApp",
        "description": "WhatsApp Business messaging through Meta Cloud API.",
        "external": True,
        "provider": "META_WHATSAPP_CLOUD_API",
        "setup_required": [
            "phone_number_id",
            "whatsapp_business_account_id",
            "access_token",
        ],
    },
    ChannelType.INSTAGRAM: {
        "label": "Instagram",
        "description": "Instagram messaging integration.",
        "external": True,
        "provider": "META",
        "setup_required": ["Meta connection"],
    },
    ChannelType.FACEBOOK: {
        "label": "Facebook",
        "description": "Facebook/Messenger messaging integration.",
        "external": True,
        "provider": "META",
        "setup_required": ["Meta connection"],
    },
    ChannelType.SMS: {
        "label": "SMS",
        "description": "SMS messaging integration.",
        "external": True,
        "provider": None,
        "setup_required": ["SMS provider"],
    },
    ChannelType.EMAIL: {
        "label": "Email",
        "description": "Email customer messaging integration.",
        "external": True,
        "provider": None,
        "setup_required": ["Email provider"],
    },
    ChannelType.WEBSITE: {
        "label": "Website",
        "description": "Website chat channel.",
        "external": True,
        "provider": "MAYA",
        "setup_required": ["Website widget"],
    },
    ChannelType.VOICE: {
        "label": "Voice",
        "description": "Voice/call customer channel.",
        "external": True,
        "provider": None,
        "setup_required": ["Voice provider"],
    },
    ChannelType.LINKEDIN: {
        "label": "LinkedIn",
        "description": "Future customer-channel integration.",
        "external": True,
        "provider": None,
        "setup_required": ["LinkedIn integration"],
    },
}


class ChannelManagementService:
    """Read-only channel catalog plus business-specific connection state.

    Provider credentials remain in their provider-specific connection tables.
    This layer does not duplicate or expose secrets.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_business(self, business_id: UUID) -> list[dict]:
        registry = ChannelAdapterRegistry(self.db)
        whatsapp = await WhatsAppConnectionService(self.db).get_for_business(
            business_id
        )

        result: list[dict] = []
        for channel in ChannelType:
            definition = CHANNEL_CATALOG[channel]
            registered = registry.is_registered(channel)

            connected = False
            enabled = False
            status = "NOT_CONFIGURED"
            details: dict = {}

            if channel is ChannelType.CHAT:
                connected = registered
                enabled = registered
                status = "AVAILABLE" if registered else "UNAVAILABLE"

            elif channel is ChannelType.WEBSITE:
                # The website adapter is already part of the unified pipeline.
                # Actual website widget installation is a separate frontend/deployment concern.
                connected = registered
                enabled = registered
                status = "AVAILABLE" if registered else "UNAVAILABLE"

            elif channel is ChannelType.WHATSAPP:
                connected = whatsapp is not None
                enabled = bool(whatsapp and whatsapp.is_active)
                if enabled:
                    status = "CONNECTED"
                elif connected:
                    status = "DISABLED"
                else:
                    status = "NOT_CONNECTED"

                if whatsapp:
                    details = {
                        "phone_number_id": whatsapp.phone_number_id,
                        "whatsapp_business_account_id": (
                            whatsapp.whatsapp_business_account_id
                        ),
                        "display_phone_number": whatsapp.display_phone_number,
                    }

            elif registered:
                status = "AVAILABLE"

            result.append(
                {
                    "channel": channel,
                    "label": definition["label"],
                    "description": definition["description"],
                    "external": definition["external"],
                    "registered": registered,
                    "connected": connected,
                    "enabled": enabled,
                    "status": status,
                    "provider": definition["provider"],
                    "setup_required": definition["setup_required"],
                    "details": details,
                }
            )

        return result

    async def get_for_business(
        self,
        business_id: UUID,
        channel: ChannelType,
    ) -> dict:
        channels = await self.list_for_business(business_id)
        return next(item for item in channels if item["channel"] == channel)
