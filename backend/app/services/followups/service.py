from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.followup import Followup, FollowupAttempt


class FollowupService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        business_id: UUID,
        *,
        status: str | None = None,
    ) -> list[Followup]:
        query = (
            select(Followup)
            .where(Followup.business_id == business_id)
            .order_by(Followup.scheduled_at)
        )
        if status:
            query = query.where(Followup.status == status)

        result = await self.db.scalars(query)
        return list(result)

    async def get(self, business_id: UUID, followup_id: UUID) -> Followup:
        followup = await self.db.scalar(
            select(Followup).where(
                Followup.id == followup_id,
                Followup.business_id == business_id,
            )
        )
        if not followup:
            raise AppException("Follow-up not found", "FOLLOWUP_NOT_FOUND", 404)
        return followup

    async def create(
        self,
        business_id: UUID,
        *,
        lead_id: UUID,
        scheduled_at: datetime,
        reason: str | None = None,
        followup_type: str = "GENERAL",
        assigned_to: UUID | None = None,
    ) -> Followup:
        followup = Followup(
            business_id=business_id,
            lead_id=lead_id,
            scheduled_at=scheduled_at,
            reason=reason,
            type=followup_type,
            assigned_to=assigned_to,
            status="PENDING",
        )
        self.db.add(followup)
        await self.db.commit()
        await self.db.refresh(followup)
        return followup

    async def update(self, business_id: UUID, followup_id: UUID, **fields) -> Followup:
        followup = await self.get(business_id, followup_id)

        allowed = {
            "scheduled_at", "status", "reason", "type", "assigned_to",
        }
        for key, value in fields.items():
            if key in allowed and value is not None:
                setattr(followup, key, value)

        await self.db.commit()
        await self.db.refresh(followup)
        return followup

    async def add_attempt(
        self,
        business_id: UUID,
        followup_id: UUID,
        *,
        attempt_number: int,
        channel: str,
        status: str,
        notes: str | None = None,
    ) -> FollowupAttempt:
        await self.get(business_id, followup_id)

        attempt = FollowupAttempt(
            followup_id=followup_id,
            business_id=business_id,
            attempt_number=attempt_number,
            channel=channel,
            status=status,
            notes=notes,
        )
        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)
        return attempt

    async def complete(self, business_id: UUID, followup_id: UUID) -> Followup:
        return await self.update(
            business_id,
            followup_id,
            status="COMPLETED",
        )

    async def cancel(self, business_id: UUID, followup_id: UUID) -> Followup:
        return await self.update(
            business_id,
            followup_id,
            status="CANCELLED",
        )
