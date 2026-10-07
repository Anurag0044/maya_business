from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.models.user import User
from app.schemas.whatsapp import (
    WhatsAppConnectionResponse,
    WhatsAppConnectionUpsert,
)
from app.services.whatsapp.service import WhatsAppConnectionService

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])


@router.put("/connection", response_model=WhatsAppConnectionResponse)
async def connect_whatsapp(
    payload: WhatsAppConnectionUpsert,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    """Connect/update the Meta WhatsApp number for the current business."""

    connection = await WhatsAppConnectionService(db).upsert(
        current_user.business_id,
        phone_number_id=payload.phone_number_id,
        whatsapp_business_account_id=payload.whatsapp_business_account_id,
        display_phone_number=payload.display_phone_number,
        access_token=payload.access_token,
        metadata=payload.metadata,
    )

    return {
        "connected": True,
        "phone_number_id": connection.phone_number_id,
        "whatsapp_business_account_id": (
            connection.whatsapp_business_account_id
        ),
        "display_phone_number": connection.display_phone_number,
        "is_active": connection.is_active,
    }


@router.get("/connection", response_model=WhatsAppConnectionResponse)
async def whatsapp_status(
    current_user: User = Depends(
        require_roles("OWNER", "ADMIN", "STAFF")
    ),
    db: AsyncSession = Depends(get_database),
):
    return await WhatsAppConnectionService(db).status(
        current_user.business_id
    )


@router.delete("/connection", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_whatsapp(
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    """Disable WhatsApp for this business without deleting credentials."""
    await WhatsAppConnectionService(db).disconnect(
        current_user.business_id
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
