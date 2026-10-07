from __future__ import annotations

import base64
import hashlib
import hmac
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings


class WhatsAppAPIError(RuntimeError):
    """Raised when Meta WhatsApp Cloud API rejects a request."""


class WhatsAppClient:
    """Small provider client for Meta WhatsApp Cloud API.

    This class knows only about Meta transport. It contains no MAYA business
    logic and no conversation/lead/RAG behavior.
    """

    def __init__(
        self,
        *,
        access_token: str,
        phone_number_id: str,
        graph_api_version: str | None = None,
    ) -> None:
        self.access_token = access_token
        self.phone_number_id = phone_number_id
        self.graph_api_version = (
            graph_api_version or settings.whatsapp_graph_api_version
        )

    @property
    def messages_url(self) -> str:
        return (
            f"{settings.whatsapp_graph_api_base}/"
            f"{self.graph_api_version}/"
            f"{quote(self.phone_number_id, safe='')}/messages"
        )

    async def send_text(
        self,
        *,
        to: str,
        body: str,
        reply_to_message_id: str | None = None,
        preview_url: bool = False,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {
                "preview_url": preview_url,
                "body": body,
            },
        }

        if reply_to_message_id:
            payload["context"] = {"message_id": reply_to_message_id}

        return await self._request("POST", self.messages_url, json=payload)

    async def _request(self, method: str, url: str, **kwargs) -> dict[str, Any]:
        headers = kwargs.pop("headers", {})
        headers.update(
            {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )

        async with httpx.AsyncClient(
            timeout=httpx.Timeout(
                settings.whatsapp_http_timeout_seconds,
                connect=settings.whatsapp_http_connect_timeout_seconds,
            )
        ) as client:
            response = await client.request(
                method,
                url,
                headers=headers,
                **kwargs,
            )

        if response.is_error:
            try:
                error = response.json()
            except ValueError:
                error = response.text

            raise WhatsAppAPIError(
                f"Meta WhatsApp API returned HTTP {response.status_code}: {error}"
            )

        if not response.content:
            return {}

        return response.json()


def verify_webhook_signature(
    *,
    raw_body: bytes,
    signature_header: str | None,
    app_secret: str,
) -> bool:
    """Verify Meta's X-Hub-Signature-256 header."""

    if not signature_header or not signature_header.startswith("sha256="):
        return False

    received = signature_header.removeprefix("sha256=")
    expected = hmac.new(
        app_secret.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(received, expected)
