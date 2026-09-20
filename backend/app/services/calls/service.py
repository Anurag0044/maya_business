from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.call import Call, CallEvent, CallTranscript


class CallService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        business_id: UUID,
        *,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Call]:
        result = await self.db.scalars(
            select(Call)
            .where(Call.business_id == business_id)
            .order_by(Call.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result)

    async def get(self, business_id: UUID, call_id: UUID) -> Call:
        call = await self.db.scalar(
            select(Call).where(
                Call.id == call_id,
                Call.business_id == business_id,
            )
        )
        if not call:
            raise AppException("Call not found", "CALL_NOT_FOUND", 404)
        return call

    async def create(
        self,
        business_id: UUID,
        *,
        session_id: str,
        caller_number: str,
        caller_name: str | None = None,
    ) -> Call:
        existing = await self.db.scalar(
            select(Call).where(Call.session_id == session_id)
        )
        if existing:
            if existing.business_id != business_id:
                raise AppException("Invalid call session", "CALL_SESSION_CONFLICT", 409)
            return existing

        call = Call(
            business_id=business_id,
            session_id=session_id,
            caller_number=caller_number,
            caller_name=caller_name,
            started_at=datetime.now(timezone.utc),
            status="RINGING",
            transferred=False,
        )
        self.db.add(call)
        await self.db.commit()
        await self.db.refresh(call)
        return call

    async def add_event(
        self,
        business_id: UUID,
        call_id: UUID,
        *,
        event_type: str,
        event_data: dict | None = None,
    ) -> CallEvent:
        await self.get(business_id, call_id)

        event = CallEvent(
            call_id=call_id,
            business_id=business_id,
            event_type=event_type,
            event_data=event_data,
        )
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        return event

    async def add_transcript(
        self,
        business_id: UUID,
        call_id: UUID,
        *,
        speaker: str,
        message: str,
        sequence_number: int,
        confidence: float | None = None,
    ) -> CallTranscript:
        await self.get(business_id, call_id)

        transcript = CallTranscript(
            call_id=call_id,
            speaker=speaker,
            message=message,
            sequence_number=sequence_number,
            confidence=confidence,
        )
        self.db.add(transcript)
        await self.db.commit()
        await self.db.refresh(transcript)
        return transcript

    async def end(
        self,
        business_id: UUID,
        call_id: UUID,
        *,
        status: str = "COMPLETED",
        outcome: str | None = None,
        transferred: bool | None = None,
        transfer_reason: str | None = None,
    ) -> Call:
        call = await self.get(business_id, call_id)

        call.ended_at = datetime.now(timezone.utc)
        call.status = status
        call.outcome = outcome

        if call.started_at:
            call.duration_seconds = max(
                0,
                int((call.ended_at - call.started_at).total_seconds()),
            )

        if transferred is not None:
            call.transferred = transferred
        if transfer_reason is not None:
            call.transfer_reason = transfer_reason

        await self.db.commit()
        await self.db.refresh(call)
        return call
