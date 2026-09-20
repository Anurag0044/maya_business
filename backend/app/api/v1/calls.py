from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.models.user import User
from app.schemas.call import (
    CallCreate,
    CallEndRequest,
    CallEventCreate,
    CallResponse,
    CallTranscriptCreate,
)
from app.services.calls.service import CallService

router = APIRouter(prefix="/calls", tags=["Calls"])


@router.get("", response_model=list[CallResponse])
async def list_calls(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await CallService(db).list(
        current_user.business_id,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=CallResponse, status_code=201)
async def create_call(
    payload: CallCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await CallService(db).create(
        current_user.business_id,
        **payload.model_dump(),
    )


@router.get("/{call_id}", response_model=CallResponse)
async def get_call(
    call_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await CallService(db).get(current_user.business_id, call_id)


@router.post("/{call_id}/events", status_code=201)
async def add_event(
    call_id: UUID,
    payload: CallEventCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    event = await CallService(db).add_event(
        current_user.business_id,
        call_id,
        **payload.model_dump(),
    )
    return {"success": True, "data": {"id": str(event.id)}, "message": "Call event recorded"}


@router.post("/{call_id}/transcript", status_code=201)
async def add_transcript(
    call_id: UUID,
    payload: CallTranscriptCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    transcript = await CallService(db).add_transcript(
        current_user.business_id,
        call_id,
        **payload.model_dump(),
    )
    return {"success": True, "data": {"id": str(transcript.id)}, "message": "Transcript recorded"}


@router.post("/{call_id}/end", response_model=CallResponse)
async def end_call(
    call_id: UUID,
    payload: CallEndRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await CallService(db).end(
        current_user.business_id,
        call_id,
        **payload.model_dump(),
    )
