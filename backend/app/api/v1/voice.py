from uuid import UUID
import secrets

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent.context import ConversationContext
from app.ai.agent.orchestrator import AgentOrchestrator
from app.api.deps import get_database
from app.core.exceptions import AppException
from app.schemas.voice import VoiceMessageRequest, VoiceSessionRequest
from app.services.calls.service import CallService
from app.core.config import settings

router = APIRouter(prefix="/voice", tags=["Voice"])


# V1 in-memory context store. Replace with Redis/database-backed session storage
# when streaming/multi-instance deployment is introduced.
_contexts: dict[str, ConversationContext] = {}



async def require_voice_gateway(
    x_maya_voice_key: str | None = Header(default=None),
) -> None:
    expected = settings.voice_gateway_api_key
    if not expected:
        raise AppException(
            "Voice gateway authentication is not configured",
            "VOICE_AUTH_NOT_CONFIGURED",
            503,
        )
    if not x_maya_voice_key or not secrets.compare_digest(x_maya_voice_key, expected):
        raise AppException(
            "Invalid voice gateway credentials",
            "VOICE_UNAUTHORIZED",
            401,
        )


@router.post("/session")
async def voice_session(
    payload: VoiceSessionRequest,
    db: AsyncSession = Depends(get_database),
    _: None = Depends(require_voice_gateway),
):
    try:
        business_id = UUID(payload.business_id)
    except ValueError as exc:
        raise AppException(
            "Invalid business_id",
            "INVALID_BUSINESS_ID",
            422,
        ) from exc

    call = await CallService(db).create(
        business_id,
        session_id=payload.session_id,
        caller_number=payload.caller_number,
    )

    _contexts[payload.session_id] = ConversationContext(
        session_id=payload.session_id,
        business_id=business_id,
        customer_phone=payload.caller_number,
        language=payload.language,
        channel="VOICE",
    )

    return {
        "success": True,
        "data": {
            "session_id": payload.session_id,
            "call_id": str(call.id),
            "greeting": "Hello, welcome. How may I help you today?",
        },
        "message": "Voice session initialized",
    }


@router.post("/message")
async def voice_message(
    payload: VoiceMessageRequest,
    db: AsyncSession = Depends(get_database),
    _: None = Depends(require_voice_gateway),
):
    context = _contexts.get(payload.session_id)

    if context is None:
        raise AppException(
            "Voice session not initialized",
            "VOICE_SESSION_NOT_FOUND",
            404,
        )

    if payload.language:
        context.language = payload.language

    decision = await AgentOrchestrator(db).handle_message(
        context,
        payload.message,
    )

    return {
        "success": True,
        "data": {
            "session_id": payload.session_id,
            "response": decision.response,
            "intent": context.intent,
            "decision": decision.decision.value,
            "confidence": decision.confidence,
            "reason": decision.reason,
            "lead_id": str(context.lead_id) if context.lead_id else None,
        },
        "message": "Voice message processed",
    }
