from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.leads.service import LeadService


async def create_or_update_lead(
    db: AsyncSession,
    business_id: UUID,
    *,
    phone: str,
    name: str | None = None,
    email: str | None = None,
    source: str | None = "AI_FRONTDESK",
    interest: str | None = None,
    course_id: UUID | None = None,
    notes: str | None = None,
):
    return await LeadService(db).create_or_update_by_phone(
        business_id,
        phone=phone,
        name=name,
        email=email,
        source=source,
        interest=interest,
        course_id=course_id,
        notes=notes,
    )


async def get_lead(
    db: AsyncSession,
    business_id: UUID,
    lead_id: UUID,
):
    return await LeadService(db).get(business_id, lead_id)
