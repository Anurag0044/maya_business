from datetime import datetime, time, timezone
from uuid import UUID
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.business import Business
from app.models.followup import Followup, FollowupAttempt
from app.models.lead import Lead
from app.models.settings import BusinessHours, BusinessSettings


class FollowupService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ============================================================
    # BASIC CRUD
    # ============================================================

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

    async def get(
        self,
        business_id: UUID,
        followup_id: UUID,
    ) -> Followup:

        followup = await self.db.scalar(
            select(Followup).where(
                Followup.id == followup_id,
                Followup.business_id == business_id,
            )
        )

        if not followup:
            raise AppException(
                "Follow-up not found",
                "FOLLOWUP_NOT_FOUND",
                404,
            )

        return followup

    # ============================================================
    # BUSINESS
    # ============================================================

    async def get_business(
        self,
        business_id: UUID,
    ) -> Business:

        business = await self.db.scalar(
            select(Business).where(
                Business.id == business_id,
                Business.is_active.is_(True),
            )
        )

        if not business:
            raise AppException(
                "Business not found or inactive",
                "BUSINESS_NOT_FOUND",
                404,
            )

        return business

    async def get_settings(
        self,
        business_id: UUID,
    ) -> BusinessSettings | None:

        return await self.db.scalar(
            select(BusinessSettings).where(
                BusinessSettings.business_id == business_id,
            )
        )

    # ============================================================
    # LEAD VALIDATION
    # ============================================================

    async def validate_lead(
        self,
        business_id: UUID,
        lead_id: UUID,
    ) -> Lead:

        lead = await self.db.scalar(
            select(Lead).where(
                Lead.id == lead_id,
                Lead.business_id == business_id,
            )
        )

        if not lead:
            raise AppException(
                "Lead not found",
                "LEAD_NOT_FOUND",
                404,
            )

        return lead

    # ============================================================
    # AUTO FOLLOW-UP POLICY
    # ============================================================

    async def is_auto_followup_enabled(
        self,
        business_id: UUID,
    ) -> bool:

        settings = await self.get_settings(business_id)

        # If settings don't exist, don't silently assume that
        # autonomous follow-ups are allowed.
        if not settings:
            return False

        return settings.auto_followups

    # ============================================================
    # BUSINESS HOURS
    # ============================================================

    async def is_within_business_hours(
        self,
        business_id: UUID,
        scheduled_at: datetime,
    ) -> bool:

        business = await self.get_business(business_id)

        # Convert scheduled time into the business timezone.
        try:
            tz = ZoneInfo(business.timezone)
        except Exception:
            tz = ZoneInfo("Asia/Kolkata")

        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(
                tzinfo=timezone.utc
            )

        local_dt = scheduled_at.astimezone(tz)

        # Python weekday:
        # Monday = 0
        # Sunday = 6
        weekday = local_dt.weekday()

        hours = await self.db.scalar(
            select(BusinessHours).where(
                BusinessHours.business_id == business_id,
                BusinessHours.day_of_week == weekday,
            )
        )

        # No configured hours = don't block scheduling.
        #
        # This keeps existing businesses working even if
        # business hours have not been configured yet.
        if not hours:
            return True

        if not hours.is_open:
            return False

        if hours.open_time is None or hours.close_time is None:
            return True

        current_time = local_dt.time()

        # Handle normal same-day hours.
        if hours.open_time <= hours.close_time:
            return (
                hours.open_time
                <= current_time
                <= hours.close_time
            )

        # Handle overnight hours such as:
        # 22:00 -> 02:00
        return (
            current_time >= hours.open_time
            or current_time <= hours.close_time
        )

    # ============================================================
    # DUPLICATE CHECK
    # ============================================================

    async def check_duplicate(
        self,
        business_id: UUID,
        lead_id: UUID,
        *,
        scheduled_at: datetime | None = None,
    ) -> Followup | None:

        query = (
            select(Followup)
            .where(
                Followup.business_id == business_id,
                Followup.lead_id == lead_id,
                Followup.status == "PENDING",
            )
            .order_by(Followup.scheduled_at)
        )

        result = await self.db.scalars(query)
        existing = list(result)

        if not existing:
            return None

        # If a time was specifically requested, find an
        # exact-time duplicate.
        if scheduled_at is not None:
            for followup in existing:
                if followup.scheduled_at == scheduled_at:
                    return followup

            return None

        # For autonomous creation, one pending follow-up
        # is enough to prevent another duplicate.
        return existing[0]

    # ============================================================
    # CREATE MANUAL FOLLOW-UP
    # ============================================================

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

        await self.get_business(business_id)

        await self.validate_lead(
            business_id,
            lead_id,
        )

        duplicate = await self.check_duplicate(
            business_id,
            lead_id,
            scheduled_at=scheduled_at,
        )

        if duplicate:
            return duplicate

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

    # ============================================================
    # CREATE AUTONOMOUS FOLLOW-UP
    # ============================================================

    async def create_for_lead(
        self,
        business_id: UUID,
        lead_id: UUID,
        *,
        scheduled_at: datetime,
        reason: str | None = None,
        followup_type: str = "GENERAL",
        assigned_to: UUID | None = None,
    ) -> Followup:

        await self.get_business(business_id)

        lead = await self.validate_lead(
            business_id,
            lead_id,
        )

        # --------------------------------------------------------
        # AUTO FOLLOW-UP SETTING
        # --------------------------------------------------------

        enabled = await self.is_auto_followup_enabled(
            business_id
        )

        if not enabled:
            raise AppException(
                "Automatic follow-ups are disabled for this business",
                "AUTO_FOLLOWUPS_DISABLED",
                400,
            )

        # --------------------------------------------------------
        # DUPLICATE PROTECTION
        # --------------------------------------------------------

        duplicate = await self.check_duplicate(
            business_id,
            lead_id,
        )

        if duplicate:
            return duplicate

        # --------------------------------------------------------
        # BUSINESS HOURS
        # --------------------------------------------------------

        within_hours = await self.is_within_business_hours(
            business_id,
            scheduled_at,
        )

        if not within_hours:
            raise AppException(
                "Follow-up time is outside business hours",
                "OUTSIDE_BUSINESS_HOURS",
                400,
            )

        # --------------------------------------------------------
        # CREATE
        # --------------------------------------------------------

        followup = Followup(
            business_id=business_id,
            lead_id=lead.id,
            scheduled_at=scheduled_at,
            reason=reason,
            type=followup_type,
            assigned_to=assigned_to,
            status="PENDING",
        )

        self.db.add(followup)

        # Keep Lead.next_followup_at synchronized.
        lead.next_followup_at = scheduled_at

        await self.db.commit()
        await self.db.refresh(followup)

        return followup

    # ============================================================
    # DUE FOLLOW-UPS
    # ============================================================

    async def get_due_followups(
        self,
        business_id: UUID,
        *,
        now: datetime | None = None,
        limit: int = 100,
    ) -> list[Followup]:

        if now is None:
            now = datetime.now(timezone.utc)

        query = (
            select(Followup)
            .where(
                Followup.business_id == business_id,
                Followup.status == "PENDING",
                Followup.scheduled_at <= now,
            )
            .order_by(Followup.scheduled_at)
            .limit(limit)
        )

        result = await self.db.scalars(query)

        return list(result)

    # ============================================================
    # ATTEMPT COUNT
    # ============================================================

    async def get_attempt_count(
        self,
        business_id: UUID,
        followup_id: UUID,
    ) -> int:

        await self.get(
            business_id,
            followup_id,
        )

        count = await self.db.scalar(
            select(func.count(FollowupAttempt.id)).where(
                FollowupAttempt.business_id == business_id,
                FollowupAttempt.followup_id == followup_id,
            )
        )

        return int(count or 0)

    # ============================================================
    # ADD ATTEMPT
    # ============================================================

    async def add_attempt(
        self,
        business_id: UUID,
        followup_id: UUID,
        *,
        attempt_number: int | None = None,
        channel: str,
        status: str,
        notes: str | None = None,
    ) -> FollowupAttempt:

        followup = await self.get(
            business_id,
            followup_id,
        )

        if followup.status != "PENDING":
            raise AppException(
                "Cannot add an attempt to a closed follow-up",
                "FOLLOWUP_NOT_PENDING",
                400,
            )

        # --------------------------------------------------------
        # If an explicit attempt number is supplied, update the
        # existing attempt instead of creating a duplicate row.
        #
        # This allows:
        #
        # Attempt #1 STARTED
        #        ↓
        # Attempt #1 SUCCESS
        #
        # --------------------------------------------------------

        if attempt_number is not None:

            existing_attempt = await self.db.scalar(
                select(FollowupAttempt).where(
                    FollowupAttempt.business_id == business_id,
                    FollowupAttempt.followup_id == followup_id,
                    FollowupAttempt.attempt_number == attempt_number,
                )
            )

            if existing_attempt:

                existing_attempt.channel = channel
                existing_attempt.status = status

                if notes is not None:
                    existing_attempt.notes = notes

                await self.db.commit()
                await self.db.refresh(existing_attempt)

                return existing_attempt

        # --------------------------------------------------------
        # No existing attempt supplied.
        # Create a new attempt number.
        # --------------------------------------------------------

        if attempt_number is None:
            attempt_number = (
                await self.get_attempt_count(
                    business_id,
                    followup_id,
                )
                + 1
            )

        attempt = FollowupAttempt(
            followup_id=followup.id,
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

    # ============================================================
    # UPDATE
    # ============================================================

    async def update(
        self,
        business_id: UUID,
        followup_id: UUID,
        **fields,
    ) -> Followup:

        followup = await self.get(
            business_id,
            followup_id,
        )

        allowed = {
            "scheduled_at",
            "status",
            "reason",
            "type",
            "assigned_to",
        }

        for key, value in fields.items():
            if key in allowed and value is not None:
                setattr(
                    followup,
                    key,
                    value,
                )

        await self.db.commit()
        await self.db.refresh(followup)

        return followup

    # ============================================================
    # COMPLETE
    # ============================================================

    async def complete(
        self,
        business_id: UUID,
        followup_id: UUID,
    ) -> Followup:

        followup = await self.get(
            business_id,
            followup_id,
        )

        if followup.status == "COMPLETED":
            return followup

        if followup.status == "CANCELLED":
            raise AppException(
                "Cancelled follow-up cannot be completed",
                "FOLLOWUP_ALREADY_CANCELLED",
                400,
            )

        followup.status = "COMPLETED"

        await self.db.commit()
        await self.db.refresh(followup)

        return followup

    # ============================================================
    # CANCEL
    # ============================================================

    async def cancel(
        self,
        business_id: UUID,
        followup_id: UUID,
    ) -> Followup:

        followup = await self.get(
            business_id,
            followup_id,
        )

        if followup.status == "COMPLETED":
            raise AppException(
                "Completed follow-up cannot be cancelled",
                "FOLLOWUP_ALREADY_COMPLETED",
                400,
            )

        if followup.status == "CANCELLED":
            return followup

        followup.status = "CANCELLED"

        await self.db.commit()
        await self.db.refresh(followup)

        return followup