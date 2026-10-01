from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.call import Call
from app.models.conversation import Conversation
from app.models.handoff import Handoff
from app.models.lead import Lead
from app.models.user import User
from app.services.notifications.service import NotificationService


ACTIVE_STATUSES = {"PENDING", "ASSIGNED", "IN_PROGRESS"}
TERMINAL_STATUSES = {"RESOLVED", "CANCELLED"}
ALLOWED_PRIORITIES = {"LOW", "NORMAL", "HIGH", "URGENT"}


class HandoffService:
    """Persistent human-escalation lifecycle for MAYA Front Desk."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(
        self,
        business_id: UUID,
        *,
        status: str | None = None,
        priority: str | None = None,
        assigned_to: UUID | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Handoff]:
        query = (
            select(Handoff)
            .where(Handoff.business_id == business_id)
            .order_by(Handoff.requested_at.desc())
            .limit(limit)
            .offset(offset)
        )

        if status:
            query = query.where(Handoff.status == status.upper())
        if priority:
            query = query.where(Handoff.priority == priority.upper())
        if assigned_to:
            query = query.where(Handoff.assigned_to == assigned_to)

        result = await self.db.scalars(query)
        return list(result)

    async def get(self, business_id: UUID, handoff_id: UUID) -> Handoff:
        handoff = await self.db.scalar(
            select(Handoff).where(
                Handoff.id == handoff_id,
                Handoff.business_id == business_id,
            )
        )
        if not handoff:
            raise AppException("Handoff not found", "HANDOFF_NOT_FOUND", 404)
        return handoff

    async def _validate_reference(
        self,
        business_id: UUID,
        *,
        conversation_id: UUID | None,
        lead_id: UUID | None,
        call_id: UUID | None,
        assigned_to: UUID | None,
    ) -> None:
        if conversation_id:
            conversation = await self.db.scalar(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.business_id == business_id,
                )
            )
            if not conversation:
                raise AppException("Conversation does not belong to this business", "HANDOFF_CONVERSATION_INVALID", 400)

        if lead_id:
            lead = await self.db.scalar(
                select(Lead).where(
                    Lead.id == lead_id,
                    Lead.business_id == business_id,
                )
            )
            if not lead:
                raise AppException("Lead does not belong to this business", "HANDOFF_LEAD_INVALID", 400)

        if call_id:
            call = await self.db.scalar(
                select(Call).where(
                    Call.id == call_id,
                    Call.business_id == business_id,
                )
            )
            if not call:
                raise AppException("Call does not belong to this business", "HANDOFF_CALL_INVALID", 400)

        if assigned_to:
            user = await self.db.scalar(
                select(User).where(
                    User.id == assigned_to,
                    User.business_id == business_id,
                    User.is_active.is_(True),
                )
            )
            if not user:
                raise AppException("Assigned staff member is invalid", "HANDOFF_ASSIGNEE_INVALID", 400)

    async def create(
        self,
        business_id: UUID,
        *,
        reason: str,
        channel: str = "CHAT",
        priority: str = "NORMAL",
        conversation_id: UUID | None = None,
        lead_id: UUID | None = None,
        call_id: UUID | None = None,
        assigned_to: UUID | None = None,
        customer_name: str | None = None,
        customer_phone: str | None = None,
        customer_email: str | None = None,
        metadata: dict | None = None,
        notify: bool = True,
    ) -> Handoff:
        priority = priority.upper()
        channel = channel.upper()

        if priority not in ALLOWED_PRIORITIES:
            raise AppException(
                f"Invalid handoff priority: {priority}",
                "HANDOFF_PRIORITY_INVALID",
                400,
            )

        await self._validate_reference(
            business_id,
            conversation_id=conversation_id,
            lead_id=lead_id,
            call_id=call_id,
            assigned_to=assigned_to,
        )

        # One active handoff per conversation prevents repeated escalations
        # when the customer continues messaging while staff is being alerted.
        if conversation_id:
            existing = await self.db.scalar(
                select(Handoff)
                .where(
                    Handoff.business_id == business_id,
                    Handoff.conversation_id == conversation_id,
                    Handoff.status.in_(ACTIVE_STATUSES),
                )
                .order_by(Handoff.requested_at.desc())
            )
            if existing:
                return existing

        now = datetime.now(timezone.utc)
        handoff = Handoff(
            business_id=business_id,
            conversation_id=conversation_id,
            lead_id=lead_id,
            call_id=call_id,
            assigned_to=assigned_to,
            status="ASSIGNED" if assigned_to else "PENDING",
            priority=priority,
            reason=reason.strip(),
            channel=channel,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            requested_at=now,
            assigned_at=now if assigned_to else None,
            metadata_json=metadata,
        )
        self.db.add(handoff)
        await self.db.commit()
        await self.db.refresh(handoff)

        if notify:
            await self._notify_staff(handoff)

        return handoff

    async def _notify_staff(self, handoff: Handoff) -> None:
        recipient = handoff.assigned_to
        customer = handoff.customer_name or handoff.customer_phone or "Customer"
        title = "Human assistance requested"
        message = (
            f"{customer} needs human assistance. "
            f"Reason: {handoff.reason}"
        )

        try:
            await NotificationService(self.db).create(
                handoff.business_id,
                title=title,
                message=message,
                notification_type="HUMAN_HANDOFF",
                user_id=recipient,
                channel="IN_APP",
                priority=handoff.priority,
                related_entity_type="HANDOFF",
                related_entity_id=handoff.id,
                metadata={
                    "handoff_id": str(handoff.id),
                    "conversation_id": str(handoff.conversation_id) if handoff.conversation_id else None,
                    "lead_id": str(handoff.lead_id) if handoff.lead_id else None,
                    "call_id": str(handoff.call_id) if handoff.call_id else None,
                    "channel": handoff.channel,
                    "reason": handoff.reason,
                },
            )
        except Exception:
            # Handoff itself is authoritative. Notification failure must not
            # erase or roll back the escalation record.
            return

    async def assign(
        self,
        business_id: UUID,
        handoff_id: UUID,
        *,
        assigned_to: UUID | None,
    ) -> Handoff:
        handoff = await self.get(business_id, handoff_id)

        if handoff.status in TERMINAL_STATUSES:
            raise AppException("Cannot assign a closed handoff", "HANDOFF_CLOSED", 400)

        await self._validate_reference(
            business_id,
            conversation_id=None,
            lead_id=None,
            call_id=None,
            assigned_to=assigned_to,
        )

        now = datetime.now(timezone.utc)
        handoff.assigned_to = assigned_to
        handoff.assigned_at = now if assigned_to else None
        handoff.status = "ASSIGNED" if assigned_to else "PENDING"

        await self.db.commit()
        await self.db.refresh(handoff)

        if assigned_to:
            await self._notify_staff(handoff)

        return handoff

    async def start(
        self,
        business_id: UUID,
        handoff_id: UUID,
        *,
        actor_id: UUID,
        actor_role: str,
    ) -> Handoff:
        handoff = await self.get(business_id, handoff_id)

        if handoff.status in TERMINAL_STATUSES:
            raise AppException("Cannot start a closed handoff", "HANDOFF_CLOSED", 400)

        # Staff can start their own assignment. Owner/Admin can take over an
        # unassigned handoff and become the assignee.
        if handoff.assigned_to and handoff.assigned_to != actor_id and actor_role not in {"OWNER", "ADMIN"}:
            raise AppException("Handoff is assigned to another staff member", "HANDOFF_NOT_ASSIGNED_TO_USER", 403)

        if handoff.assigned_to is None:
            handoff.assigned_to = actor_id
            handoff.assigned_at = datetime.now(timezone.utc)

        handoff.status = "IN_PROGRESS"
        handoff.started_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(handoff)
        return handoff

    async def resolve(
        self,
        business_id: UUID,
        handoff_id: UUID,
        *,
        actor_id: UUID,
        actor_role: str,
        resolution_notes: str | None = None,
    ) -> Handoff:
        handoff = await self.get(business_id, handoff_id)

        if handoff.status in TERMINAL_STATUSES:
            raise AppException("Handoff is already closed", "HANDOFF_ALREADY_CLOSED", 400)

        if (
            handoff.assigned_to
            and handoff.assigned_to != actor_id
            and actor_role not in {"OWNER", "ADMIN"}
        ):
            raise AppException(
                "Handoff is assigned to another staff member",
                "HANDOFF_NOT_ASSIGNED_TO_USER",
                403,
            )

        handoff.status = "RESOLVED"
        handoff.resolved_at = datetime.now(timezone.utc)
        handoff.resolution_notes = resolution_notes

        await self.db.commit()
        await self.db.refresh(handoff)
        return handoff

    async def cancel(
        self,
        business_id: UUID,
        handoff_id: UUID,
        *,
        actor_id: UUID,
        actor_role: str,
        resolution_notes: str | None = None,
    ) -> Handoff:
        handoff = await self.get(business_id, handoff_id)

        if handoff.status in TERMINAL_STATUSES:
            raise AppException("Handoff is already closed", "HANDOFF_ALREADY_CLOSED", 400)

        if (
            handoff.assigned_to
            and handoff.assigned_to != actor_id
            and actor_role not in {"OWNER", "ADMIN"}
        ):
            raise AppException(
                "Handoff is assigned to another staff member",
                "HANDOFF_NOT_ASSIGNED_TO_USER",
                403,
            )

        handoff.status = "CANCELLED"
        handoff.resolved_at = datetime.now(timezone.utc)
        handoff.resolution_notes = resolution_notes

        await self.db.commit()
        await self.db.refresh(handoff)
        return handoff
