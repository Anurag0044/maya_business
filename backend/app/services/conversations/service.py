from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import ARRAY, Text, cast, delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.call import Call, CallEvent, CallTranscript
from app.models.conversation import Conversation, ConversationChunk, ConversationMessage
from app.models.lead import Lead
from app.models.settings import BusinessSettings


class ConversationService:
    """Persistent conversation memory with explicit retention boundaries.

    Conversation content is temporary. Lead/customer intelligence is durable
    and lives on Lead, so retention cleanup never removes it.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def _retention_days(self, business_id: UUID) -> int:
        settings = await self.db.scalar(
            select(BusinessSettings).where(BusinessSettings.business_id == business_id)
        )
        return max(1, int(settings.conversation_retention_days if settings else 90))

    async def get_or_create(
        self,
        business_id: UUID,
        session_id: str,
        *,
        lead_id: UUID | None = None,
        channel: str = "CHAT",
    ) -> Conversation:
        conversation = await self.db.scalar(
            select(Conversation).where(
                Conversation.business_id == business_id,
                Conversation.session_id == session_id,
            )
        )
        now = datetime.now(timezone.utc)
        if conversation:
            conversation.last_activity_at = now
            if lead_id and conversation.lead_id != lead_id:
                conversation.lead_id = lead_id
            return conversation

        retention = await self._retention_days(business_id)
        conversation = Conversation(
            business_id=business_id,
            session_id=session_id,
            lead_id=lead_id,
            channel=channel,
            status="ACTIVE",
            expires_at=now + timedelta(days=retention),
        )
        self.db.add(conversation)
        await self.db.flush()
        return conversation


    async def hydrate_context(self, conversation: Conversation, context) -> None:
        """Restore durable working memory into the in-process session cache."""
        from app.ai.agent.context import ConversationContext

        if not isinstance(context, ConversationContext):
            return
        context.conversation_summary = conversation.conversation_summary
        context.structured_state = conversation.structured_state or {}
        context.summary_turn_count = conversation.summary_turn_count
        state = context.structured_state
        context.customer_name = state.get("customer_name")
        context.customer_phone = state.get("customer_phone")
        context.customer_email = state.get("customer_email")
        context.intent = state.get("intent")
        context.language = state.get("language") or context.language
        context.pending_action = state.get("pending_action")
        if conversation.lead_id:
            context.lead_id = conversation.lead_id

        recent = await self.db.scalars(
            select(ConversationMessage)
            .where(ConversationMessage.conversation_id == conversation.id)
            .order_by(ConversationMessage.turn_number.desc())
            .limit(8)
        )
        recent_messages = list(reversed(list(recent)))
        context.history = [
            {"speaker": item.speaker, "message": item.message}
            for item in recent_messages
        ]
        context.turn_count = recent_messages[-1].turn_number if recent_messages else 0

        # Historical chunks are loaded lazily after the current customer
        # message is known. Loading every chunk here defeats the bounded-memory
        # design for long conversations.
        context.conversation_chunks = []

    async def load_relevant_chunks(
        self,
        conversation: Conversation,
        context,
        *,
        query: str,
        max_results: int = 2,
        candidate_limit: int = 12,
    ) -> list[dict]:
        """Load only relevant historical chunks from PostgreSQL.

        PostgreSQL first narrows candidates using the JSONB terms array. A
        small candidate set is then scored deterministically in Python so the
        final prompt receives at most ``max_results`` chunks. Chunks already
        created during the current request are preserved.
        """
        from app.ai.agent.memory import ConversationMemoryManager
        from app.ai.agent.context import ConversationContext

        if not isinstance(context, ConversationContext):
            return []

        memory = ConversationMemoryManager()
        query_terms = memory.query_terms(query)

        # Preserve a chunk frozen during this request. It is not in Cloud SQL
        # yet; sync_memory() will persist it after the response is generated.
        local_chunks = list(context.conversation_chunks)
        if not query_terms:
            context.conversation_chunks = local_chunks
            return local_chunks[:max_results]

        # JSONB array overlap operator (?|) asks PostgreSQL for chunks whose
        # stored term array contains at least one retrieval term. We fetch a
        # small candidate set rather than the entire conversation history.
        term_array = cast(sorted(query_terms), ARRAY(Text))
        result = await self.db.scalars(
            select(ConversationChunk)
            .where(
                ConversationChunk.conversation_id == conversation.id,
                ConversationChunk.terms.is_not(None),
                ConversationChunk.terms.op("?|")(term_array),
            )
            .order_by(ConversationChunk.chunk_index.desc())
            .limit(max(candidate_limit, max_results)),
        )
        candidates = list(result)

        scored: list[tuple[int, int, dict]] = []
        seen_ids = set()
        for item in candidates:
            chunk = {
                "chunk_id": item.chunk_index,
                "start_turn": item.start_turn,
                "end_turn": item.end_turn,
                "text": item.content,
                "terms": item.terms or [],
            }
            seen_ids.add(item.chunk_index)
            overlap = len(query_terms.intersection(set(chunk["terms"])))
            if overlap:
                scored.append((overlap, item.chunk_index, chunk))

        # Include a newly created in-memory chunk even though it has not been
        # flushed to the database yet.
        for chunk in local_chunks:
            if chunk["chunk_id"] in seen_ids:
                continue
            overlap = len(query_terms.intersection(set(chunk.get("terms", []))))
            if overlap:
                scored.append((overlap, chunk["chunk_id"], chunk))

        scored.sort(key=lambda item: (item[0], item[1]), reverse=True)
        selected = [chunk for _, _, chunk in scored[:max_results]]

        # Keep newly frozen chunks in context even when they are not relevant
        # to the current query. They must still reach sync_memory() so the
        # durable chunk is written to Cloud SQL after this turn.
        merged = list(local_chunks)
        merged.extend(
            chunk
            for chunk in selected
            if chunk["chunk_id"] not in {c["chunk_id"] for c in local_chunks}
        )
        context.conversation_chunks = merged
        return merged

    async def append_turn(
        self,
        conversation: Conversation,
        *,
        speaker: str,
        message: str,
        turn_number: int,
    ) -> ConversationMessage:
        item = ConversationMessage(
            conversation_id=conversation.id,
            speaker=speaker,
            message=message,
            turn_number=turn_number,
        )
        self.db.add(item)
        conversation.last_activity_at = datetime.now(timezone.utc)
        await self.db.flush()
        return item

    async def sync_lead_intelligence(
        self,
        business_id: UUID,
        lead_id: UUID | None,
        *,
        summary: str | None,
        structured_state: dict | None,
    ) -> None:
        if not lead_id:
            return
        lead = await self.db.scalar(
            select(Lead).where(Lead.id == lead_id, Lead.business_id == business_id)
        )
        if not lead:
            return
        if summary:
            lead.customer_intelligence_summary = summary.strip()
        if structured_state:
            lead.customer_intelligence = structured_state
        lead.last_contact_at = datetime.now(timezone.utc)
        await self.db.flush()

    async def sync_memory(
        self,
        conversation: Conversation,
        *,
        summary: str | None,
        structured_state: dict | None,
        summary_turn_count: int,
        chunks: list[dict],
    ) -> None:
        conversation.conversation_summary = summary
        conversation.structured_state = structured_state
        conversation.summary_turn_count = summary_turn_count
        conversation.last_activity_at = datetime.now(timezone.utc)

        existing_indexes = set(
            await self.db.scalars(
                select(ConversationChunk.chunk_index).where(
                    ConversationChunk.conversation_id == conversation.id
                )
            )
        )
        for chunk in chunks:
            if chunk["chunk_id"] in existing_indexes:
                continue
            self.db.add(
                ConversationChunk(
                    conversation_id=conversation.id,
                    chunk_index=chunk["chunk_id"],
                    start_turn=chunk["start_turn"],
                    end_turn=chunk["end_turn"],
                    content=chunk["text"],
                    terms=chunk.get("terms", []),
                )
            )
        await self.db.flush()

    async def cleanup_expired(self, *, business_id: UUID | None = None) -> int:
        """Delete temporary conversation data and old voice content.

        Durable lead/customer intelligence is never touched here. Voice call
        rows remain as anonymized operational records; transcripts/events and
        caller identity are removed after the configured retention period.
        """
        now = datetime.now(timezone.utc)
        query = delete(Conversation).where(Conversation.expires_at <= now)
        if business_id is not None:
            query = query.where(Conversation.business_id == business_id)
        conversation_result = await self.db.execute(query)

        settings_query = select(BusinessSettings)
        if business_id is not None:
            settings_query = settings_query.where(BusinessSettings.business_id == business_id)
        settings_rows = list(await self.db.scalars(settings_query))
        calls_cleaned = 0
        for settings in settings_rows:
            cutoff = now - timedelta(days=max(1, int(settings.conversation_retention_days)))
            call_ids = list(await self.db.scalars(
                select(Call.id).where(
                    Call.business_id == settings.business_id,
                    Call.created_at < cutoff,
                )
            ))
            if not call_ids:
                continue
            await self.db.execute(
                delete(CallTranscript).where(CallTranscript.call_id.in_(call_ids))
            )
            await self.db.execute(
                delete(CallEvent).where(CallEvent.call_id.in_(call_ids))
            )
            await self.db.execute(
                update(Call)
                .where(Call.id.in_(call_ids))
                .values(caller_number="[deleted]", caller_name=None, lead_id=None)
            )
            calls_cleaned += len(call_ids)

        await self.db.commit()
        return int(conversation_result.rowcount or 0) + calls_cleaned

    async def delete_history_for_conversation(self, business_id: UUID, conversation_id: UUID) -> None:
        conversation = await self.db.scalar(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.business_id == business_id,
            )
        )
        if not conversation:
            raise AppException("Conversation not found", "CONVERSATION_NOT_FOUND", 404)
        await self.db.delete(conversation)
        await self.db.commit()

    async def delete_history_for_lead(self, business_id: UUID, lead_id: UUID) -> int:
        await self.db.execute(
            delete(Conversation).where(
                Conversation.business_id == business_id,
                Conversation.lead_id == lead_id,
            )
        )
        call_ids = await self.db.scalars(
            select(Call.id).where(Call.business_id == business_id, Call.lead_id == lead_id)
        )
        ids = list(call_ids)
        await self.db.execute(
            update(Call)
            .where(Call.business_id == business_id, Call.lead_id == lead_id)
            .values(caller_number="[deleted]", caller_name=None, lead_id=None)
        )
        # Voice transcripts/events can contain personal conversation content.
        if ids:
            await self.db.execute(delete(CallTranscript).where(CallTranscript.call_id.in_(ids)))
            await self.db.execute(delete(CallEvent).where(CallEvent.call_id.in_(ids)))
        await self.db.commit()
        return len(ids)

    async def delete_all_history(self, business_id: UUID) -> int:
        # Conversations are the generic temporary memory store. Existing
        # voice call records are anonymized rather than deleted so operational
        # analytics can remain without retaining caller identity/content.
        result = await self.db.execute(
            delete(Conversation).where(Conversation.business_id == business_id)
        )
        calls = await self.db.scalars(select(Call).where(Call.business_id == business_id))
        call_list = list(calls)
        call_ids = [c.id for c in call_list]
        for call in call_list:
            call.caller_number = "[deleted]"
            call.caller_name = None
            call.lead_id = None
        if call_ids:
            await self.db.execute(delete(CallTranscript).where(CallTranscript.call_id.in_(call_ids)))
            await self.db.execute(delete(CallEvent).where(CallEvent.call_id.in_(call_ids)))
        await self.db.commit()
        return int(result.rowcount or 0)

    async def apply_retention_to_existing(self, business_id: UUID) -> int:
        retention = await self._retention_days(business_id)
        cutoff = datetime.now(timezone.utc) - timedelta(days=retention)
        result = await self.db.execute(
            delete(Conversation).where(
                Conversation.business_id == business_id,
                Conversation.last_activity_at < cutoff,
            )
        )
        await self.db.commit()
        return int(result.rowcount or 0)
