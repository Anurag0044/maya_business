from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
)
from app.services.appointments.service import AppointmentService

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("", response_model=list[AppointmentResponse])
async def list_appointments(
    start_from: datetime | None = Query(default=None),
    start_to: datetime | None = Query(default=None),
    status: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await AppointmentService(db).list(
        current_user.business_id,
        start_from=start_from,
        start_to=start_to,
        status=status,
    )


@router.get("/availability")
async def availability(
    start_time: datetime,
    end_time: datetime,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    available = await AppointmentService(db).check_availability(
        current_user.business_id,
        start_time=start_time,
        end_time=end_time,
    )
    return {"success": True, "data": {"available": available}, "message": "Availability checked"}


@router.post("", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await AppointmentService(db).create(
        current_user.business_id,
        created_by=current_user.id,
        **payload.model_dump(),
    )


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await AppointmentService(db).get(current_user.business_id, appointment_id)


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: UUID,
    payload: AppointmentUpdate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await AppointmentService(db).update(
        current_user.business_id,
        appointment_id,
        **payload.model_dump(exclude_unset=True),
    )


@router.post("/{appointment_id}/confirm", response_model=AppointmentResponse)
async def confirm_appointment(
    appointment_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await AppointmentService(db).confirm(
        current_user.business_id,
        appointment_id,
    )


@router.post("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await AppointmentService(db).cancel(
        current_user.business_id,
        appointment_id,
    )


@router.post("/{appointment_id}/reschedule", response_model=AppointmentResponse)
async def reschedule_appointment(
    appointment_id: UUID,
    start_time: datetime,
    end_time: datetime,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await AppointmentService(db).reschedule(
        current_user.business_id,
        appointment_id,
        start_time=start_time,
        end_time=end_time,
    )
