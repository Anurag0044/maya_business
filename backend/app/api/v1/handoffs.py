from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.models.user import User
from app.schemas.handoff import (
    HandoffAssignRequest,
    HandoffCreate,
    HandoffResolutionRequest,
    HandoffResponse,
)
from app.services.handoff import HandoffService

router = APIRouter(prefix="/handoffs", tags=["Human Handoff"])


@router.get("", response_model=list[HandoffResponse])
async def list_handoffs(
    status: str | None = Query(default=None),
    priority: str | None = Query(default=None),
    assigned_to: UUID | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await HandoffService(db).list(
        current_user.business_id,
        status=status,
        priority=priority,
        assigned_to=assigned_to,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=HandoffResponse, status_code=201)
async def create_handoff(
    payload: HandoffCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await HandoffService(db).create(
        current_user.business_id,
        **payload.model_dump(),
    )


@router.get("/{handoff_id}", response_model=HandoffResponse)
async def get_handoff(
    handoff_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await HandoffService(db).get(current_user.business_id, handoff_id)


@router.post("/{handoff_id}/assign", response_model=HandoffResponse)
async def assign_handoff(
    handoff_id: UUID,
    payload: HandoffAssignRequest,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    return await HandoffService(db).assign(
        current_user.business_id,
        handoff_id,
        assigned_to=payload.assigned_to,
    )


@router.post("/{handoff_id}/start", response_model=HandoffResponse)
async def start_handoff(
    handoff_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await HandoffService(db).start(
        current_user.business_id,
        handoff_id,
        actor_id=current_user.id,
        actor_role=current_user.role,
    )


@router.post("/{handoff_id}/resolve", response_model=HandoffResponse)
async def resolve_handoff(
    handoff_id: UUID,
    payload: HandoffResolutionRequest,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await HandoffService(db).resolve(
        current_user.business_id,
        handoff_id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        resolution_notes=payload.resolution_notes,
    )


@router.post("/{handoff_id}/cancel", response_model=HandoffResponse)
async def cancel_handoff(
    handoff_id: UUID,
    payload: HandoffResolutionRequest,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await HandoffService(db).cancel(
        current_user.business_id,
        handoff_id,
        actor_id=current_user.id,
        actor_role=current_user.role,
        resolution_notes=payload.resolution_notes,
    )
