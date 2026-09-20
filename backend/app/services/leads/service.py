from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.lead import Lead, LeadActivity


class LeadService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        business_id: UUID,
        *,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Lead]:
        query = (
            select(Lead)
            .where(Lead.business_id == business_id)
            .order_by(Lead.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        if status:
            query = query.where(Lead.status == status)

        result = await self.db.scalars(query)
        return list(result)

    async def get(self, business_id: UUID, lead_id: UUID) -> Lead:
        lead = await self.db.scalar(
            select(Lead).where(
                Lead.id == lead_id,
                Lead.business_id == business_id,
            )
        )
        if not lead:
            raise AppException("Lead not found", "LEAD_NOT_FOUND", 404)
        return lead

    async def create_or_update_by_phone(
        self,
        business_id: UUID,
        *,
        phone: str,
        name: str | None = None,
        email: str | None = None,
        source: str | None = None,
        interest: str | None = None,
        course_id: UUID | None = None,
        notes: str | None = None,
    ) -> Lead:
        lead = await self.db.scalar(
            select(Lead).where(
                Lead.business_id == business_id,
                Lead.phone == phone,
            )
        )

        now = datetime.now(timezone.utc)

        if lead:
            if name:
                lead.name = name
            if email:
                lead.email = email
            if source:
                lead.source = source
            if interest:
                lead.interest = interest
            if course_id:
                lead.course_id = course_id
            if notes:
                lead.notes = notes
            lead.last_contact_at = now
        else:
            lead = Lead(
                business_id=business_id,
                phone=phone,
                name=name,
                email=email,
                source=source,
                interest=interest,
                course_id=course_id,
                notes=notes,
                status="NEW",
                first_contact_at=now,
                last_contact_at=now,
            )
            self.db.add(lead)

        await self.db.flush()

        self.db.add(
            LeadActivity(
                lead_id=lead.id,
                business_id=business_id,
                activity_type="CONTACT",
                description="Lead created or updated through Front Desk",
            )
        )

        await self.db.commit()
        await self.db.refresh(lead)
        return lead

    async def update(self, business_id: UUID, lead_id: UUID, **fields) -> Lead:
        lead = await self.get(business_id, lead_id)

        allowed = {
            "name", "phone", "email", "source", "interest", "course_id",
            "status", "priority", "assigned_to", "notes", "next_followup_at",
        }
        for key, value in fields.items():
            if key in allowed and value is not None:
                setattr(lead, key, value)

        await self.db.commit()
        await self.db.refresh(lead)
        return lead

    async def add_activity(
        self,
        business_id: UUID,
        lead_id: UUID,
        *,
        activity_type: str,
        description: str | None = None,
        performed_by: UUID | None = None,
    ) -> LeadActivity:
        await self.get(business_id, lead_id)

        activity = LeadActivity(
            lead_id=lead_id,
            business_id=business_id,
            activity_type=activity_type,
            description=description,
            performed_by=performed_by,
        )
        self.db.add(activity)
        await self.db.commit()
        await self.db.refresh(activity)
        return activity

    async def assign(
        self,
        business_id: UUID,
        lead_id: UUID,
        user_id: UUID,
    ) -> Lead:
        return await self.update(
            business_id,
            lead_id,
            assigned_to=user_id,
        )
