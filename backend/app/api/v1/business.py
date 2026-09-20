from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.models.user import User
from app.schemas.business import (
    BusinessHoursResponse,
    BusinessHoursUpdate,
    BusinessResponse,
    BusinessUpdate,
    SettingsResponse,
    SettingsUpdate,
)
from app.services.business.service import BusinessService

router = APIRouter(prefix="/business", tags=["Business"])


@router.get("", response_model=BusinessResponse)
async def get_business(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await BusinessService(db).get_business(current_user.business_id)


@router.put("", response_model=BusinessResponse)
async def update_business(
    payload: BusinessUpdate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    return await BusinessService(db).update_business(
        current_user.business_id,
        **payload.model_dump(exclude_unset=True),
    )


@router.get("/settings", response_model=SettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await BusinessService(db).get_settings(current_user.business_id)


@router.put("/settings", response_model=SettingsResponse)
async def update_settings(
    payload: SettingsUpdate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    return await BusinessService(db).update_settings(
        current_user.business_id,
        **payload.model_dump(exclude_unset=True),
    )


@router.get("/hours", response_model=list[BusinessHoursResponse])
async def get_hours(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await BusinessService(db).get_hours(current_user.business_id)


@router.put("/hours", response_model=list[BusinessHoursResponse])
async def replace_hours(
    payload: BusinessHoursUpdate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    return await BusinessService(db).replace_hours(
        current_user.business_id,
        [item.model_dump() for item in payload.hours],
    )
