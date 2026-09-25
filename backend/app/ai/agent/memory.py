from __future__ import annotations

import json
from dataclasses import dataclass
import re
from typing import Any

from app.ai.agent.context import ConversationContext
from app.ai.providers.llm import get_llm_provider


@dataclass(frozen=True)
class MemoryConfig:
    """Token-efficient conversation-memory policy for MAYA sessions."""

    recent_turns: int = 8
    chunk_turns: int = 8
    max_retrieved_chunks: int = 2
    summary_trigger_turns: int = 16
    summary_interval_turns: int = 8


class ConversationMemoryManager:
    """Builds a small LLM context while retaining the full conversation.

    Memory has four layers:
      1. structured state (deterministic, no LLM)
      2. global summary (LLM, only periodically)
      3. old conversation chunks (deterministic snapshots, no LLM)
      4. recent exact turns

    Old chunks are retrieved lexically only when the current message overlaps
    with them. This avoids sending the entire historical transcript to the LLM.
    """

    STOPWORDS = {
        "the", "a", "an", "is", "are", "was", "were", "to", "of",
        "and", "or", "for", "in", "on", "at", "it", "this", "that",
        "i", "you", "we", "me", "my", "your", "our", "what", "how",
        "when", "where", "can", "could", "would", "will", "do", "did",
        "about", "please", "okay", "ok", "the",
    }

    def __init__(self, config: MemoryConfig | None = None):
        self.config = config or MemoryConfig()

    def sync_structured_state(self, context: ConversationContext) -> None:
        state: dict[str, Any] = {
            "customer_name": context.customer_name,
            "customer_phone": context.customer_phone,
            "customer_email": context.customer_email,
            "lead_id": str(context.lead_id) if context.lead_id else None,
            "intent": context.intent,
            "language": context.language,
            "appointment_start_time": (
                context.appointment_start_time.isoformat()
                if context.appointment_start_time else None
            ),
            "appointment_end_time": (
                context.appointment_end_time.isoformat()
                if context.appointment_end_time else None
            ),
            "pending_action": context.pending_action,
            "entities": dict(context.entities),
        }
        context.structured_state = {
            key: value for key, value in state.items()
            if value is not None and value != {} and value != ""
        }

    def recent_turns_text(self, context: ConversationContext) -> str:
        turns = context.history[-self.config.recent_turns:]
        if not turns:
            return "(none)"
        return "\n".join(f"{t['speaker']}: {t['message']}" for t in turns)

    @staticmethod
    def _terms(text: str) -> set[str]:
        words = re.findall(r"[a-zA-Z0-9]+", text.lower())
        terms = {w for w in words if len(w) > 2 and w not in ConversationMemoryManager.STOPWORDS}
        # Tiny deterministic normalization so "fee" matches "fees",
        # "appointment" matches "appointments", etc. No embedding/LLM call.
        normalized = set(terms)
        for word in terms:
            if word.endswith("ies") and len(word) > 3:
                normalized.add(word[:-3] + "y")
            elif word.endswith("s") and not word.endswith("ss") and len(word) > 3:
                normalized.add(word[:-1])
        return normalized

    def prepare_before_turn(self, context: ConversationContext) -> bool:
        """Freeze the previous 8-turn window before a new turn arrives."""
        if len(context.history) < self.config.chunk_turns:
            return False
        turns = context.history[:self.config.chunk_turns]
        chunk_number = len(context.conversation_chunks) + 1
        text = "\n".join(f"{t['speaker']}: {t['message']}" for t in turns)
        context.conversation_chunks.append({
            "chunk_id": chunk_number,
            "start_turn": context.turn_count - len(context.history) + 1,
            "end_turn": context.turn_count - len(context.history) + self.config.chunk_turns,
            "text": text,
            "terms": sorted(self._terms(text)),
        })
        context.history = context.history[self.config.chunk_turns:]
        return True

    def retrieve_relevant_chunks(self, context: ConversationContext, query: str) -> list[dict[str, Any]]:
        if not context.conversation_chunks or not query.strip():
            return []
        query_terms = self._terms(query)
        if not query_terms:
            return []
        scored = []
        for chunk in context.conversation_chunks:
            overlap = len(query_terms.intersection(set(chunk.get("terms", []))))
            if overlap:
                scored.append((overlap, chunk))
        scored.sort(key=lambda x: (x[0], x[1]["chunk_id"]), reverse=True)
        return [chunk for _, chunk in scored[:self.config.max_retrieved_chunks]]

    def _chunk_text(self, chunks: list[dict[str, Any]]) -> str:
        if not chunks:
            return "(none)"
        return "\n\n--- RETRIEVED MEMORY CHUNK ---\n".join(
            f"Chunk {c['chunk_id']} (turns {c['start_turn']}-{c['end_turn']}):\n{c['text']}"
            for c in chunks
        )

    def build_prompt_context(self, context: ConversationContext, query: str = "") -> str:
        self.sync_structured_state(context)
        summary = context.conversation_summary or "(none yet)"
        structured = json.dumps(context.structured_state, ensure_ascii=False, default=str)
        relevant = self.retrieve_relevant_chunks(context, query)
        return (
            "CONVERSATION SUMMARY:\n" f"{summary}\n\n"
            "STRUCTURED CONVERSATION STATE:\n" f"{structured}\n\n"
            "RELEVANT OLDER CONVERSATION (only when needed):\n"
            f"{self._chunk_text(relevant)}\n\n"
            "RECENT CONVERSATION:\n" f"{self.recent_turns_text(context)}"
        )

    def should_summarize(self, context: ConversationContext) -> bool:
        if context.turn_count < self.config.summary_trigger_turns:
            return False
        return (context.turn_count - context.summary_turn_count) >= self.config.summary_interval_turns

    async def maybe_summarize(self, context: ConversationContext) -> bool:
        """Periodically update the summary from only the newest chunk.

        This is deliberately one extra LLM call only at the configured
        interval. Full historical chunks remain available for retrieval.
        """
        if not self.should_summarize(context):
            return False
        if not context.conversation_chunks:
            return False
        provider = get_llm_provider()
        if provider is None:
            return False

        latest = context.conversation_chunks[-1]
        self.sync_structured_state(context)
        existing_summary = context.conversation_summary or "(none)"
        structured = json.dumps(context.structured_state, ensure_ascii=False, default=str)
        system_prompt = """
You maintain a concise factual memory of a customer conversation for MAYA,
a professional receptionist. Update the previous summary using ONLY the
new conversation chunk and structured state. Preserve customer identity,
language, intent, appointment details, lead details, requests, decisions,
unresolved questions, commitments, and important preferences. Do not invent
facts. Return only the concise summary.
""".strip()
        user_prompt = f"""
PREVIOUS SUMMARY:
{existing_summary}

STRUCTURED STATE:
{structured}

NEW CONVERSATION CHUNK:
{latest['text']}

Write the updated summary.
"""
        summary = await provider.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.0,
        )
        if not summary:
            return False
        context.conversation_summary = summary.strip()
        context.summary_turn_count = context.turn_count
        context.memory_compactions += 1
        return True
