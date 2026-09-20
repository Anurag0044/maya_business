from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.business import Business
from app.models.settings import BusinessHours, BusinessSettings


class BusinessService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_business(self, business_id: UUID) -> Business:
        business = await self.db.get(Business, business_id)
        if not business or not business.is_active:
            raise AppException("Business not found", "BUSINESS_NOT_FOUND", 404)
        return business

    async def update_business(self, business_id: UUID, **fields) -> Business:
        business = await self.get_business(business_id)

        allowed = {
            "name", "business_type", "description", "phone", "email",
            "website", "address", "city", "state", "country", "timezone",
        }
        for key, value in fields.items():
            if key in allowed and value is not None:
                setattr(business, key, value)

        await self.db.commit()
        await self.db.refresh(business)
        return business

    async def get_settings(self, business_id: UUID) -> BusinessSettings:
        settings = await self.db.scalar(
            select(BusinessSettings).where(
                BusinessSettings.business_id == business_id
            )
        )
        if not settings:
            raise AppException("Business settings not found", "SETTINGS_NOT_FOUND", 404)
        return settings

    async def update_settings(self, business_id: UUID, **fields) -> BusinessSettings:
        settings = await self.get_settings(business_id)

        allowed = {
            "ai_enabled", "voice_enabled", "auto_lead_creation",
            "auto_followups", "human_handoff", "welcome_message",
            "fallback_message", "handoff_message", "default_language", "timezone",
        }
        for key, value in fields.items():
            if key in allowed and value is not None:
                setattr(settings, key, value)

        await self.db.commit()
        await self.db.refresh(settings)
        return settings

    async def get_hours(self, business_id: UUID) -> list[BusinessHours]:
        await self.get_business(business_id)
        result = await self.db.scalars(
            select(BusinessHours)
            .where(BusinessHours.business_id == business_id)
            .order_by(BusinessHours.day_of_week)
        )
        return list(result)

    async def replace_hours(
        self,
        business_id: UUID,
        hours: list[dict],
    ) -> list[BusinessHours]:
        await self.get_business(business_id)

        existing = await self.db.scalars(
            select(BusinessHours).where(BusinessHours.business_id == business_id)
        )
        for item in existing:
            await self.db.delete(item)

        for item in hours:
            self.db.add(
                BusinessHours(
                    business_id=business_id,
                    day_of_week=item["day_of_week"],
                    is_open=item.get("is_open", True),
                    open_time=item.get("open_time"),
                    close_time=item.get("close_time"),
                )
            )

        await self.db.commit()
        return await self.get_hours(business_id)
