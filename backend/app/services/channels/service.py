from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent.orchestrator import AgentOrchestrator
from app.ai.agent.session_store import get_or_create_context
from app.models.channel_message import ChannelMessage
from app.services.conversations.service import ConversationService
from app.services.channels.types import (
    ChannelType,
    NormalizedInboundMessage,
    NormalizedOutboundMessage,
)


class ChannelMessageService:
    """Single AI message pipeline shared by every customer channel."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def find_existing_inbound(
        self,
        business_id: UUID,
        channel: ChannelType,
        external_message_id: str | None,
    ) -> ChannelMessage | None:
        if not external_message_id:
            return None

        return await self.db.scalar(
            select(ChannelMessage).where(
                ChannelMessage.business_id == business_id,
                ChannelMessage.channel == channel.value,
                ChannelMessage.external_message_id == external_message_id,
            )
        )

    async def process_ai_message(
        self,
        inbound: NormalizedInboundMessage,
        *,
        conversation_service: ConversationService | None = None,
    ) -> dict:
        # Provider webhooks normally supply an external message ID.
        # If it is present, use it for idempotency before invoking MAYA.
        existing = await self.find_existing_inbound(
            inbound.business_id,
            inbound.channel,
            inbound.external_message_id,
        )

        if existing:
            return {
                "duplicate": True,
                "channel_message_id": existing.id,
                "conversation_id": existing.conversation_id,
                "response": None,
                "decision": "DUPLICATE",
            }

        session_id = (
            inbound.session_id
            or f"{inbound.channel.value}:{inbound.external_user_id}"
        )

        context = get_or_create_context(
            inbound.business_id,
            session_id,
        )
        context.channel = inbound.channel.value

        conversation_service = (
            conversation_service or ConversationService(self.db)
        )

        conversation = await conversation_service.get_or_create(
            inbound.business_id,
            session_id,
            lead_id=context.lead_id,
            channel=inbound.channel.value,
        )
        await conversation_service.hydrate_context(
            conversation,
            context,
        )

        inbound_record = ChannelMessage(
            business_id=inbound.business_id,
            conversation_id=conversation.id,
            channel=inbound.channel.value,
            direction="INBOUND",
            external_user_id=inbound.external_user_id,
            external_message_id=inbound.external_message_id,
            message=inbound.message,
            status="PROCESSING",
            metadata_json=inbound.metadata or None,
        )

        self.db.add(inbound_record)
        await self.db.flush()

        decision = await AgentOrchestrator(self.db).handle_message(
            context,
            inbound.message,
            conversation=conversation,
        )

        customer_turn_number = context.turn_count

        if decision.response:
            context.add_turn(
                "ASSISTANT",
                decision.response,
            )

        # Durable transcript.
        await conversation_service.append_turn(
            conversation,
            speaker="CUSTOMER",
            message=inbound.message,
            turn_number=customer_turn_number,
        )

        if decision.response:
            await conversation_service.append_turn(
                conversation,
                speaker="ASSISTANT",
                message=decision.response,
                turn_number=context.turn_count,
            )

        conversation.lead_id = context.lead_id

        await conversation_service.sync_memory(
            conversation,
            summary=context.conversation_summary,
            structured_state=context.structured_state,
            summary_turn_count=context.summary_turn_count,
            chunks=context.conversation_chunks,
        )

        await conversation_service.sync_lead_intelligence(
            inbound.business_id,
            context.lead_id,
            summary=context.conversation_summary,
            structured_state=context.structured_state,
        )

        inbound_record.status = "PROCESSED"

        outbound_record = None

        if decision.response:
            outbound_record = ChannelMessage(
                business_id=inbound.business_id,
                conversation_id=conversation.id,
                channel=inbound.channel.value,
                direction="OUTBOUND",
                external_user_id=inbound.external_user_id,
                message=decision.response,
                status="GENERATED",
                metadata_json={
                    "decision": decision.decision.value,
                    "confidence": decision.confidence,
                },
            )
            self.db.add(outbound_record)

        await self.db.commit()

        return {
            "duplicate": False,
            "channel_message_id": inbound_record.id,
            "outbound_channel_message_id": (
                outbound_record.id if outbound_record else None
            ),
            "conversation_id": conversation.id,
            "response": decision.response,
            "intent": context.intent,
            "decision": decision.decision.value,
            "confidence": decision.confidence,
            "reason": decision.reason,
        }

    @staticmethod
    def build_outbound(
        business_id: UUID,
        channel: ChannelType,
        external_user_id: str,
        message: str,
        *,
        conversation_id: UUID | None = None,
        reply_to_external_message_id: str | None = None,
        metadata: dict | None = None,
    ) -> NormalizedOutboundMessage:
        return NormalizedOutboundMessage(
            business_id=business_id,
            channel=channel,
            external_user_id=external_user_id,
            message=message,
            conversation_id=conversation_id,
            reply_to_external_message_id=reply_to_external_message_id,
            metadata=metadata or {},
        )
