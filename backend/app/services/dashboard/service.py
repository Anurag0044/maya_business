from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.appointment import Appointment
from app.models.call import Call
from app.models.followup import Followup
from app.models.lead import Lead


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def overview(self, business_id: UUID) -> dict:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today_start + timedelta(days=1)

        calls_today = await self.db.scalar(
            select(func.count(Call.id)).where(
                Call.business_id == business_id,
                Call.created_at >= today_start,
                Call.created_at < tomorrow,
            )
        )

        leads_total = await self.db.scalar(
            select(func.count(Lead.id)).where(
                Lead.business_id == business_id
            )
        )

        appointments_today = await self.db.scalar(
            select(func.count(Appointment.id)).where(
                Appointment.business_id == business_id,
                Appointment.start_time >= today_start,
                Appointment.start_time < tomorrow,
                Appointment.status.in_(["SCHEDULED", "CONFIRMED"]),
            )
        )

        pending_followups = await self.db.scalar(
            select(func.count(Followup.id)).where(
                Followup.business_id == business_id,
                Followup.status == "PENDING",
            )
        )

        return {
            "calls_today": calls_today or 0,
            "leads_total": leads_total or 0,
            "appointments_today": appointments_today or 0,
            "pending_followups": pending_followups or 0,
        }

    async def lead_counts(self, business_id: UUID) -> list[dict]:
        rows = await self.db.execute(
            select(
                Lead.status,
                func.count(Lead.id).label("count"),
            )
            .where(Lead.business_id == business_id)
            .group_by(Lead.status)
            .order_by(Lead.status)
        )
        return [
            {"status": row.status, "count": row.count}
            for row in rows
        ]

    async def call_counts(self, business_id: UUID) -> list[dict]:
        rows = await self.db.execute(
            select(
                Call.status,
                func.count(Call.id).label("count"),
            )
            .where(Call.business_id == business_id)
            .group_by(Call.status)
            .order_by(Call.status)
        )
        return [
            {"status": row.status, "count": row.count}
            for row in rows
        ]
