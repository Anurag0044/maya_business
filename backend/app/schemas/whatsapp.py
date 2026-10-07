from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class WhatsAppConnectionUpsert(BaseModel):
    phone_number_id: str = Field(min_length=1, max_length=100)
    whatsapp_business_account_id: str | None = Field(
        default=None,
        max_length=100,
    )
    display_phone_number: str | None = Field(
        default=None,
        max_length=50,
    )
    access_token: str = Field(min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class WhatsAppConnectionResponse(BaseModel):
    connected: bool
    phone_number_id: str | None = None
    whatsapp_business_account_id: str | None = None
    display_phone_number: str | None = None
    is_active: bool = False


class WhatsAppWebhookResponse(BaseModel):
    success: bool
    message: str
