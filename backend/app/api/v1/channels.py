from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.core.exceptions import AppException
from app.models.user import User
from app.schemas.channel import ChannelCapabilityResponse, ChannelInboundRequest
from app.schemas.channel_management import ChannelDefinitionResponse, ChannelManagementResponse
from app.services.channels.management import ChannelManagementService
from app.services.channels.gateway import ChannelGateway
from app.services.channels.registry import ChannelAdapterRegistry
from app.services.channels.types import ChannelType


router = APIRouter(prefix="/channels", tags=["Channels"])


@router.get("/capabilities", response_model=list[ChannelCapabilityResponse])
async def capabilities(
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    """Return channel adapters registered in the current MAYA runtime."""
    return ChannelAdapterRegistry(db).capabilities()


@router.get(
    "/status",
    response_model=ChannelManagementResponse,
)
async def channel_status(
    current_user: User = Depends(
        require_roles("OWNER", "ADMIN", "STAFF")
    ),
    db: AsyncSession = Depends(get_database),
):
    """Return the channel catalog and this business's connection state.

    Secrets are never returned. Provider-specific credentials remain in their
    own connection services/tables.
    """
    channels = await ChannelManagementService(db).list_for_business(
        current_user.business_id
    )
    return {
        "business_id": current_user.business_id,
        "channels": channels,
    }


@router.get(
    "/{channel}/status",
    response_model=ChannelDefinitionResponse,
)
async def channel_status_by_type(
    channel: ChannelType,
    current_user: User = Depends(
        require_roles("OWNER", "ADMIN", "STAFF")
    ),
    db: AsyncSession = Depends(get_database),
):
    """Return one channel's configuration state for the current business."""
    return await ChannelManagementService(db).get_for_business(
        current_user.business_id,
        channel,
    )


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
