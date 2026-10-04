from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database
from app.core.exceptions import AppException
from app.models.user import User
from app.services.channels.service import ChannelMessageService
from app.services.channels.types import (
    ChannelType,
    NormalizedInboundMessage,
)

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat")
async def chat(
    business_id: UUID,
    session_id: str,
    message: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """
    Process a customer chat message through the single MAYA channel pipeline.

    ChannelMessageService owns the complete pipeline:

        incoming message
              ↓
        conversation
              ↓
        MAYA orchestrator
              ↓
        transcript
              ↓
        memory
              ↓
        channel message records
    """

    if business_id != current_user.business_id:
        raise AppException(
            "Business access denied",
            "FORBIDDEN",
            403,
        )

    inbound = NormalizedInboundMessage(
        business_id=business_id,
        channel=ChannelType.CHAT,
        external_user_id=session_id,
        session_id=session_id,
        message=message,
    )

    result = await ChannelMessageService(db).process_ai_message(
        inbound
    )

    if result["duplicate"]:
        return {
            "success": True,
            "data": result,
            "message": "Duplicate message ignored",
        }

    return {
        "success": True,
        "data": {
            "response": result["response"],
            "intent": result["intent"],
            "decision": result["decision"],
            "confidence": result["confidence"],
            "reason": result["reason"],
            "conversation_id": result["conversation_id"],
            "channel_message_id": result["channel_message_id"],
            "outbound_channel_message_id": result[
                "outbound_channel_message_id"
            ],
        },
        "message": "AI response generated",
    }