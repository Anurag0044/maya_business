from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent.session_store import get_or_create_context
from app.ai.agent.orchestrator import AgentOrchestrator
from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.services.conversations.service import ConversationService

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat")
async def chat(
    business_id: UUID,
    session_id: str,
    message: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    if business_id != current_user.business_id:
        from app.core.exceptions import AppException
        raise AppException("Business access denied", "FORBIDDEN", 403)

    context = get_or_create_context(
        business_id,
        session_id,
    )

    conversation_service = ConversationService(db)
    conversation = await conversation_service.get_or_create(
        business_id, session_id, lead_id=context.lead_id, channel="CHAT"
    )
    await conversation_service.hydrate_context(conversation, context)

    decision = await AgentOrchestrator(db).handle_message(
        context,
        message,
    )
    customer_turn_number = context.turn_count
    if decision.response:
        context.add_turn(
            "ASSISTANT",
            decision.response,
        )

    # Persist the complete transcript and bounded working memory. The database
    # is the durable source of truth; the in-memory session is only a cache.
    await conversation_service.append_turn(
        conversation,
        speaker="CUSTOMER",
        message=message,
        turn_number=customer_turn_number,
    )
    if decision.response:
        await conversation_service.append_turn(
            conversation,
            speaker="ASSISTANT",
            message=decision.response,
            turn_number=context.turn_count,
        )
    conversation.lead_id = context.lead_id
    await conversation_service.sync_memory(
        conversation,
        summary=context.conversation_summary,
        structured_state=context.structured_state,
        summary_turn_count=context.summary_turn_count,
        chunks=context.conversation_chunks,
    )
    await conversation_service.sync_lead_intelligence(
        business_id,
        context.lead_id,
        summary=context.conversation_summary,
        structured_state=context.structured_state,
    )
    await db.commit()

    return {
        "success": True,
        "data": {
            "response": decision.response,
            "intent": context.intent,
            "decision": decision.decision.value,
            "confidence": decision.confidence,
            "reason": decision.reason,
        },
        "message": "AI response generated",
    }
