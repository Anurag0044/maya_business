from datetime import datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.appointments.service import AppointmentService


async def check_availability(
    db: AsyncSession,
    business_id: UUID,
    *,
    start_time: datetime,
    end_time: datetime,
) -> bool:
    return await AppointmentService(db).check_availability(
        business_id,
        start_time=start_time,
        end_time=end_time,
    )


async def book_appointment(
    db: AsyncSession,
    business_id: UUID,
    *,
    title: str,
    start_time: datetime,
    end_time: datetime,
    lead_id: UUID | None = None,
    appointment_type: str = "COUNSELLING",
):
    return await AppointmentService(db).create(
        business_id,
        title=title,
        start_time=start_time,
        end_time=end_time,
        lead_id=lead_id,
        appointment_type=appointment_type,
    )


async def cancel_appointment(
    db: AsyncSession,
    business_id: UUID,
    appointment_id: UUID,
):
    return await AppointmentService(db).cancel(
        business_id,
        appointment_id,
    )


async def reschedule_appointment(
    db: AsyncSession,
    business_id: UUID,
    appointment_id: UUID,
    *,
    start_time: datetime,
    end_time: datetime,
):
    return await AppointmentService(db).reschedule(
        business_id,
        appointment_id,
        start_time=start_time,
        end_time=end_time,
    )
