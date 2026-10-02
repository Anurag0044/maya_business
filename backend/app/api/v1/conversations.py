from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.core.exceptions import AppException
from app.models.user import User
from app.schemas.conversation import (
    ConversationListResponse,
    ConversationMessageResponse,
    ConversationResponse,
    HumanMessageCreate,
)
from app.services.conversations.service import ConversationService

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    status: str | None = Query(default=None),
    channel: str | None = Query(default=None),
    lead_id: UUID | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    items = await ConversationService(db).list(
        current_user.business_id,
        status=status,
        channel=channel,
        lead_id=lead_id,
        limit=limit,
        offset=offset,
    )
    return ConversationListResponse(items=items, limit=limit, offset=offset)


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await ConversationService(db).get(current_user.business_id, conversation_id)


@router.get("/{conversation_id}/messages", response_model=list[ConversationMessageResponse])
async def list_conversation_messages(
    conversation_id: UUID,
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await ConversationService(db).list_messages(
        current_user.business_id, conversation_id, limit=limit, offset=offset
    )


@router.post(
    "/{conversation_id}/messages",
    response_model=ConversationMessageResponse,
    status_code=201,
)
async def send_human_message(
    conversation_id: UUID,
    payload: HumanMessageCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await ConversationService(db).append_human_message(
        current_user.business_id,
        conversation_id,
        current_user.id,
        current_user.role,
        payload.message,
    )
