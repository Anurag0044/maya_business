from datetime import datetime
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.followups.service import FollowupService


async def create_followup(
    db: AsyncSession,
    business_id: UUID,
    *,
    lead_id: UUID,
    scheduled_at: datetime,
    reason: str | None = None,
    followup_type: str = "GENERAL",
):
    """
    Create an autonomous follow-up for an existing lead.

    Business settings, duplicate protection, business hours,
    and lead validation are enforced by FollowupService.
    """

    return await FollowupService(db).create_for_lead(
        business_id,
        lead_id,
        scheduled_at=scheduled_at,
        reason=reason,
        followup_type=followup_type,
    )