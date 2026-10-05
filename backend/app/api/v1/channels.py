from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.core.exceptions import AppException
from app.models.user import User
from app.schemas.channel import ChannelCapabilityResponse, ChannelInboundRequest
from app.services.channels.gateway import ChannelGateway
from app.services.channels.registry import ChannelAdapterRegistry
from app.services.channels.types import ChannelType


router = APIRouter(prefix="/channels", tags=["Channels"])


@router.get("/capabilities", response_model=list[ChannelCapabilityResponse])
async def capabilities(
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
):
    """Return the unified channel contract and currently registered adapters."""
    return ChannelAdapterRegistry().capabilities()


@router.post("/{channel}/messages")
async def receive_normalized_message(
    channel: ChannelType,
    payload: ChannelInboundRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """Authenticated adapter/test ingress into the single MAYA pipeline.

    This is intentionally protected by MAYA authentication. External
    WhatsApp/Instagram/etc. webhooks will be added in their own provider
    routers and will call ChannelGateway after signature verification.
    """

    if current_user.business_id is None:
        raise AppException("Business access denied", "FORBIDDEN", 403)

    gateway = ChannelGateway(db)

    try:
        inbound = gateway.normalize_inbound(
            channel=channel,
            business_id=current_user.business_id,
            payload=payload.model_dump(),
        )
    except ValueError as exc:
        raise AppException(str(exc), "INVALID_CHANNEL_PAYLOAD", 400) from exc

    result = await gateway.receive(inbound)

    if result.get("duplicate"):
        return {
            "success": True,
            "data": result,
            "message": "Duplicate message ignored",
        }

    return {
        "success": True,
        "data": result,
        "message": "Message processed through unified channel pipeline",
    }
