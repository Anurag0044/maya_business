from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.integrations.whatsapp.client import verify_webhook_signature
from app.services.channels.gateway import ChannelGateway
from app.services.channels.types import ChannelType
from app.services.whatsapp.service import WhatsAppConnectionService

router = APIRouter(prefix="/webhooks/whatsapp", tags=["WhatsApp Webhook"])


@router.get("", response_class=PlainTextResponse)
async def verify_whatsapp_webhook(
    hub_mode: str | None = Query(default=None, alias="hub.mode"),
    hub_verify_token: str | None = Query(
        default=None,
        alias="hub.verify_token",
    ),
    hub_challenge: str | None = Query(
        default=None,
        alias="hub.challenge",
    ),
):
    """Meta webhook verification handshake."""

    if (
        hub_mode != "subscribe"
        or not settings.whatsapp_webhook_verify_token
        or hub_verify_token != settings.whatsapp_webhook_verify_token
        or hub_challenge is None
    ):
        return PlainTextResponse("Forbidden", status_code=403)

    return PlainTextResponse(hub_challenge)


@router.post("")
async def receive_whatsapp_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Receive verified Meta WhatsApp webhook events.

    Status-only events are acknowledged without entering the AI pipeline.
    Message events are normalized and passed into Phase 2.
    """

    raw_body = await request.body()

    if not settings.whatsapp_app_secret:
        raise HTTPException(
            status_code=503,
            detail="WhatsApp app secret is not configured",
        )

    signature = request.headers.get("X-Hub-Signature-256")
    if not verify_webhook_signature(
        raw_body=raw_body,
        signature_header=signature,
        app_secret=settings.whatsapp_app_secret,
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid WhatsApp webhook signature",
        )

    try:
        payload: dict[str, Any] = json.loads(raw_body)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON payload",
        ) from exc

    if payload.get("object") != "whatsapp_business_account":
        return {
            "success": True,
            "message": "Event ignored",
        }

    connection_service = WhatsAppConnectionService(db)
    gateway = ChannelGateway(db)

    processed = 0
    duplicates = 0
    ignored = 0
    failures = []

    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value") or {}
            metadata = value.get("metadata") or {}
            phone_number_id = metadata.get("phone_number_id")

            if not phone_number_id:
                ignored += 1
                continue

            connection = await connection_service.get_by_phone_number_id(
                str(phone_number_id)
            )
            if not connection:
                failures.append(
                    f"No active WhatsApp connection for "
                    f"phone_number_id={phone_number_id}"
                )
                continue

            statuses = value.get("statuses") or []
            if statuses:
                for status_event in statuses:
                    provider_message_id = status_event.get("id")
                    status_value = status_event.get("status")
                    if not provider_message_id or not status_value:
                        continue

                    from sqlalchemy import select
                    from app.models.channel_message import ChannelMessage

                    outbound_record = await db.scalar(
                        select(ChannelMessage).where(
                            ChannelMessage.business_id == connection.business_id,
                            ChannelMessage.channel == ChannelType.WHATSAPP.value,
                            ChannelMessage.direction == "OUTBOUND",
                            ChannelMessage.provider_message_id == provider_message_id,
                        )
                    )

                    if outbound_record:
                        outbound_record.status = {
                            "sent": "SENT",
                            "delivered": "DELIVERED",
                            "read": "READ",
                            "failed": "FAILED",
                        }.get(status_value, status_value.upper())

                        outbound_record.metadata_json = {
                            **(outbound_record.metadata_json or {}),
                            "whatsapp_status": status_event,
                        }
                        await db.commit()

                ignored += 1

            messages = value.get("messages") or []
            if not messages:
                continue

            for message in messages:
                message_value = dict(value)
                message_value["messages"] = [message]
                adapter_payload = {
                    "value": message_value,
                    "_raw_event_id": entry.get("id"),
                }

                try:
                    inbound = gateway.normalize_inbound(
                        channel=ChannelType.WHATSAPP,
                        business_id=connection.business_id,
                        payload=adapter_payload,
                    )
                    result = await gateway.receive(inbound)

                    if result.get("duplicate"):
                        duplicates += 1
                    else:
                        processed += 1
                except Exception as exc:
                    failures.append(str(exc))

    # Always acknowledge valid Meta events with HTTP 200. A transient internal
    # failure should be observable in logs without causing uncontrolled
    # webhook retry storms.
    return {
        "success": not failures,
        "processed": processed,
        "duplicates": duplicates,
        "ignored": ignored,
        "failures": failures,
    }
