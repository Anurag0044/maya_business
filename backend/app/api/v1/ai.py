from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent.session_store import get_or_create_context
from app.ai.agent.orchestrator import AgentOrchestrator
from app.api.deps import get_current_user, get_database
from app.models.user import User

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

    decision = await AgentOrchestrator(db).handle_message(
        context,
        message,
    )
    if decision.response:
        context.add_turn(
        "ASSISTANT",
        decision.response,
    )

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
