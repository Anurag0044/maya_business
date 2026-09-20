from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.appointment import Appointment


class AppointmentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        business_id: UUID,
        *,
        start_from: datetime | None = None,
        start_to: datetime | None = None,
        status: str | None = None,
    ) -> list[Appointment]:
        query = (
            select(Appointment)
            .where(Appointment.business_id == business_id)
            .order_by(Appointment.start_time)
        )
        if start_from:
            query = query.where(Appointment.start_time >= start_from)
        if start_to:
            query = query.where(Appointment.start_time <= start_to)
        if status:
            query = query.where(Appointment.status == status)

        result = await self.db.scalars(query)
        return list(result)

    async def get(self, business_id: UUID, appointment_id: UUID) -> Appointment:
        appointment = await self.db.scalar(
            select(Appointment).where(
                Appointment.id == appointment_id,
                Appointment.business_id == business_id,
            )
        )
        if not appointment:
            raise AppException(
                "Appointment not found",
                "APPOINTMENT_NOT_FOUND",
                404,
            )
        return appointment

    async def check_availability(
        self,
        business_id: UUID,
        *,
        start_time: datetime,
        end_time: datetime,
        exclude_appointment_id: UUID | None = None,
    ) -> bool:
        query = select(Appointment).where(
            Appointment.business_id == business_id,
            Appointment.status.in_(["SCHEDULED", "CONFIRMED"]),
            Appointment.start_time < end_time,
            Appointment.end_time > start_time,
        )
        if exclude_appointment_id:
            query = query.where(Appointment.id != exclude_appointment_id)

        existing = await self.db.scalar(query)
        return existing is None

    async def create(
        self,
        business_id: UUID,
        *,
        title: str,
        start_time: datetime,
        end_time: datetime,
        lead_id: UUID | None = None,
        assigned_to: UUID | None = None,
        description: str | None = None,
        appointment_type: str = "COUNSELLING",
        location: str | None = None,
        meeting_link: str | None = None,
        created_by: UUID | None = None,
    ) -> Appointment:
        if end_time <= start_time:
            raise AppException(
                "Appointment end time must be after start time",
                "INVALID_APPOINTMENT_TIME",
                422,
            )

        available = await self.check_availability(
            business_id,
            start_time=start_time,
            end_time=end_time,
        )
        if not available:
            raise AppException(
                "The requested time slot is unavailable",
                "APPOINTMENT_SLOT_UNAVAILABLE",
                409,
            )

        appointment = Appointment(
            business_id=business_id,
            lead_id=lead_id,
            assigned_to=assigned_to,
            title=title,
            description=description,
            start_time=start_time,
            end_time=end_time,
            status="SCHEDULED",
            appointment_type=appointment_type,
            location=location,
            meeting_link=meeting_link,
            created_by=created_by,
        )
        self.db.add(appointment)
        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment

    async def update(self, business_id: UUID, appointment_id: UUID, **fields) -> Appointment:
        appointment = await self.get(business_id, appointment_id)

        allowed = {
            "title", "description", "start_time", "end_time", "status",
            "appointment_type", "location", "meeting_link", "assigned_to",
            "lead_id",
        }
        for key, value in fields.items():
            if key in allowed and value is not None:
                setattr(appointment, key, value)

        if appointment.end_time <= appointment.start_time:
            raise AppException(
                "Appointment end time must be after start time",
                "INVALID_APPOINTMENT_TIME",
                422,
            )

        if appointment.status in {"SCHEDULED", "CONFIRMED"}:
            available = await self.check_availability(
                business_id,
                start_time=appointment.start_time,
                end_time=appointment.end_time,
                exclude_appointment_id=appointment.id,
            )
            if not available:
                raise AppException(
                    "The requested time slot is unavailable",
                    "APPOINTMENT_SLOT_UNAVAILABLE",
                    409,
                )

        await self.db.commit()
        await self.db.refresh(appointment)
        return appointment

    async def cancel(self, business_id: UUID, appointment_id: UUID) -> Appointment:
        return await self.update(
            business_id,
            appointment_id,
            status="CANCELLED",
        )

    async def confirm(self, business_id: UUID, appointment_id: UUID) -> Appointment:
        return await self.update(
            business_id,
            appointment_id,
            status="CONFIRMED",
        )

    async def reschedule(
        self,
        business_id: UUID,
        appointment_id: UUID,
        *,
        start_time: datetime,
        end_time: datetime,
    ) -> Appointment:
        return await self.update(
            business_id,
            appointment_id,
            start_time=start_time,
            end_time=end_time,
            status="RESCHEDULED",
        )
