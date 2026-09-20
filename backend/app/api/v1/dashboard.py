from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database
from app.models.user import User
from app.schemas.dashboard import DashboardOverview, StatusCount
from app.services.dashboard.service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverview)
async def overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await DashboardService(db).overview(current_user.business_id)


@router.get("/leads", response_model=list[StatusCount])
async def lead_counts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await DashboardService(db).lead_counts(current_user.business_id)


@router.get("/calls", response_model=list[StatusCount])
async def call_counts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await DashboardService(db).call_counts(current_user.business_id)
