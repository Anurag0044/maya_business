from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_database, require_roles
from app.models.user import User
from app.services.conversations.service import ConversationService

router = APIRouter(prefix="/data", tags=["Data & Privacy"])


@router.post("/cleanup")
async def cleanup_expired_data(
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    deleted = await ConversationService(db).apply_retention_to_existing(current_user.business_id)
    return {
        "success": True,
        "data": {"conversations_deleted": deleted},
        "message": "Expired conversation data cleaned up",
    }


@router.delete("/conversations/{conversation_id}")
async def delete_conversation_history(
    conversation_id: UUID,
    current_user: User = Depends(require_roles("OWNER")),
    db: AsyncSession = Depends(get_database),
):
    await ConversationService(db).delete_history_for_conversation(
        current_user.business_id, conversation_id
    )
    return {
        "success": True,
        "data": None,
        "message": "Conversation history permanently deleted",
    }


@router.delete("/leads/{lead_id}/conversation-history")
async def delete_lead_conversation_history(
    lead_id: UUID,
    current_user: User = Depends(require_roles("OWNER")),
    db: AsyncSession = Depends(get_database),
):
    calls = await ConversationService(db).delete_history_for_lead(
        current_user.business_id, lead_id
    )
    return {
        "success": True,
        "data": {"voice_records_anonymized": calls},
        "message": "Customer conversation history permanently deleted",
    }


@router.delete("/conversations")
async def delete_all_conversation_history(
    current_user: User = Depends(require_roles("OWNER")),
    db: AsyncSession = Depends(get_database),
):
    deleted = await ConversationService(db).delete_all_history(current_user.business_id)
    return {
        "success": True,
        "data": {"conversations_deleted": deleted},
        "message": "All conversation history permanently deleted",
    }
