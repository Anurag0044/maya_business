from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.models.user import User
from app.schemas.lead import (
    LeadActivityCreate,
    LeadActivityResponse,
    LeadCreate,
    LeadResponse,
    LeadUpdate,
)
from app.services.leads.service import LeadService

router = APIRouter(prefix="/leads", tags=["Leads"])


@router.get("", response_model=list[LeadResponse])
async def list_leads(
    status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await LeadService(db).list(
        current_user.business_id,
        status=status,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=LeadResponse, status_code=201)
async def create_lead(
    payload: LeadCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await LeadService(db).create_or_update_by_phone(
        current_user.business_id,
        **payload.model_dump(),
    )


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await LeadService(db).get(current_user.business_id, lead_id)


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    payload: LeadUpdate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await LeadService(db).update(
        current_user.business_id,
        lead_id,
        **payload.model_dump(exclude_unset=True),
    )


@router.post("/{lead_id}/activities", response_model=LeadActivityResponse, status_code=201)
async def add_activity(
    lead_id: UUID,
    payload: LeadActivityCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await LeadService(db).add_activity(
        current_user.business_id,
        lead_id,
        performed_by=current_user.id,
        **payload.model_dump(),
    )


@router.post("/{lead_id}/assign", response_model=LeadResponse)
async def assign_lead(
    lead_id: UUID,
    user_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    return await LeadService(db).assign(
        current_user.business_id,
        lead_id,
        user_id,
    )
