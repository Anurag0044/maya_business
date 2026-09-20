from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.models.user import User
from app.schemas.followup import (
    FollowupAttemptCreate,
    FollowupCreate,
    FollowupResponse,
    FollowupUpdate,
)
from app.services.followups.service import FollowupService

router = APIRouter(prefix="/followups", tags=["Follow-ups"])


@router.get("", response_model=list[FollowupResponse])
async def list_followups(
    status: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await FollowupService(db).list(
        current_user.business_id,
        status=status,
    )


@router.post("", response_model=FollowupResponse, status_code=201)
async def create_followup(
    payload: FollowupCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await FollowupService(db).create(
        current_user.business_id,
        **payload.model_dump(),
    )


@router.get("/{followup_id}", response_model=FollowupResponse)
async def get_followup(
    followup_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await FollowupService(db).get(current_user.business_id, followup_id)


@router.patch("/{followup_id}", response_model=FollowupResponse)
async def update_followup(
    followup_id: UUID,
    payload: FollowupUpdate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await FollowupService(db).update(
        current_user.business_id,
        followup_id,
        **payload.model_dump(exclude_unset=True),
    )


@router.post("/{followup_id}/complete", response_model=FollowupResponse)
async def complete_followup(
    followup_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await FollowupService(db).complete(
        current_user.business_id,
        followup_id,
    )


@router.post("/{followup_id}/cancel", response_model=FollowupResponse)
async def cancel_followup(
    followup_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await FollowupService(db).cancel(
        current_user.business_id,
        followup_id,
    )


@router.post("/{followup_id}/attempt", status_code=201)
async def add_attempt(
    followup_id: UUID,
    payload: FollowupAttemptCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    attempt = await FollowupService(db).add_attempt(
        current_user.business_id,
        followup_id,
        **payload.model_dump(),
    )
    return {"success": True, "data": {"id": str(attempt.id)}, "message": "Follow-up attempt recorded"}
