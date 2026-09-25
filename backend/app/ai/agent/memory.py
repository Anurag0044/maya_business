from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any

from app.ai.agent.context import ConversationContext
from app.ai.providers.llm import get_llm_provider


@dataclass(frozen=True)
class MemoryConfig:
    """Token-efficient conversation-memory policy."""

    recent_turns: int = 8
    chunk_turns: int = 8

    # Never send more than this many historical chunks to the LLM.
    max_retrieved_chunks: int = 2

    # Minimum overlap required before an old chunk is considered relevant.
    minimum_chunk_score: int = 1

    summary_trigger_turns: int = 16
    summary_interval_turns: int = 8


class ConversationMemoryManager:
    """
    Token-efficient conversation memory.

    Memory has four layers:

    1. Structured state
       Durable deterministic customer/conversation facts.

    2. Conversation summary
       Compact LLM-generated working memory.

    3. Historical chunks
       Deterministic snapshots of older conversation windows.

    4. Recent turns
       Exact current dialogue.

    Historical chunks are NEVER dumped into the prompt wholesale.
    Only relevant chunks are retrieved.
    """

    STOPWORDS = {
        "the", "a", "an", "is", "are", "was", "were",
        "to", "of", "and", "or", "for", "in", "on", "at",
        "it", "this", "that", "i", "you", "we", "me",
        "my", "your", "our", "what", "how", "when",
        "where", "can", "could", "would", "will", "do",
        "did", "does", "about", "please", "okay", "ok",
        "tell", "let", "like", "want", "need", "just",
    }

    # Lightweight semantic aliases.
    # This is deterministic and costs zero LLM tokens.
    TERM_ALIASES = {
        "fee": {"fee", "fees", "price", "prices", "cost", "costs",
                "charge", "charges", "pricing", "amount"},
        "price": {"fee", "fees", "price", "prices", "cost", "costs",
                  "charge", "charges", "pricing", "amount"},
        "cost": {"fee", "fees", "price", "prices", "cost", "costs",
                 "charge", "charges", "pricing", "amount"},

        "appointment": {"appointment", "appointments", "booking",
                        "book", "schedule", "scheduled", "slot",
                        "meeting", "consultation"},

        "book": {"appointment", "appointments", "booking",
                 "book", "schedule", "scheduled", "slot"},

        "timing": {"timing", "time", "times", "hours",
                   "open", "opening", "close", "closing"},

        "location": {"location", "address", "where",
                     "office", "branch", "place"},

        "phone": {"phone", "mobile", "number", "contact",
                  "call", "calling"},

        "followup": {"followup", "follow", "contact",
                     "callback", "call", "later"},

        "course": {"course", "courses", "program",
                   "programs", "class", "classes"},
    }

    def __init__(self, config: MemoryConfig | None = None):
        self.config = config or MemoryConfig()

    # ---------------------------------------------------------
    # STRUCTURED STATE
    # ---------------------------------------------------------

    def sync_structured_state(
        self,
        context: ConversationContext,
    ) -> None:

        state: dict[str, Any] = {
            "customer_name": context.customer_name,
            "customer_phone": context.customer_phone,
            "customer_email": context.customer_email,
            "lead_id": (
                str(context.lead_id)
                if context.lead_id
                else None
            ),
            "intent": context.intent,
            "language": context.language,

            "appointment_start_time": (
                context.appointment_start_time.isoformat()
                if context.appointment_start_time
                else None
            ),

            "appointment_end_time": (
                context.appointment_end_time.isoformat()
                if context.appointment_end_time
                else None
            ),

            "pending_action": context.pending_action,

            "entities": dict(context.entities),
        }

        context.structured_state = {
            key: value
            for key, value in state.items()
            if value is not None
            and value != {}
            and value != ""
        }

    # ---------------------------------------------------------
    # TERM PROCESSING
    # ---------------------------------------------------------

    @classmethod
    def _terms(cls, text: str) -> set[str]:

        words = re.findall(
            r"[a-zA-Z0-9]+",
            text.lower(),
        )

        terms = {
            word
            for word in words
            if len(word) > 2
            and word not in cls.STOPWORDS
        }

        normalized = set(terms)

        for word in terms:

            # appointments -> appointment
            if word.endswith("ies") and len(word) > 3:
                normalized.add(
                    word[:-3] + "y"
                )

            # fees -> fee
            elif (
                word.endswith("s")
                and not word.endswith("ss")
                and len(word) > 3
            ):
                normalized.add(
                    word[:-1]
                )

        return normalized

    @classmethod
    def _expanded_terms(cls, text: str) -> set[str]:

        base_terms = cls._terms(text)

        expanded = set(base_terms)

        for term in base_terms:

            for canonical, aliases in cls.TERM_ALIASES.items():

                if term in aliases:
                    expanded.add(canonical)
                    expanded.update(aliases)

        return expanded

    # ---------------------------------------------------------
    # CHUNK CREATION
    # ---------------------------------------------------------

    def prepare_before_turn(
        self,
        context: ConversationContext,
    ) -> bool:
        """
        Freeze the oldest complete chunk before a new turn.

        A chunk contains exactly `chunk_turns` turns.

        Example:

        turns 1-8   -> chunk 1
        turns 9-16  -> chunk 2
        turns 17-24 -> chunk 3
        """

        if len(context.history) < self.config.chunk_turns:
            return False

        turns = context.history[
            : self.config.chunk_turns
        ]

        text = "\n".join(
            f"{turn['speaker']}: {turn['message']}"
            for turn in turns
        )

        start_turn = (
            context.turn_count
            - len(context.history)
            + 1
        )

        end_turn = (
            start_turn
            + self.config.chunk_turns
            - 1
        )

        # Derive the chunk id from the absolute turn range rather than from
        # the number of chunks currently loaded in memory. Historical chunks
        # are intentionally loaded lazily, so len(context.conversation_chunks)
        # is no longer a reliable sequence number.
        chunk_number = ((start_turn - 1) // self.config.chunk_turns) + 1

        context.conversation_chunks.append(
            {
                "chunk_id": chunk_number,
                "start_turn": start_turn,
                "end_turn": end_turn,
                "text": text,
                "terms": sorted(
                    self._expanded_terms(text)
                ),
            }
        )

        # Remove frozen turns from working memory.
        context.history = context.history[
            self.config.chunk_turns:
        ]

        return True

    # ---------------------------------------------------------
    # HISTORICAL RETRIEVAL
    # ---------------------------------------------------------

    @classmethod
    def query_terms(cls, query: str) -> set[str]:
        """Return deterministic retrieval terms for database-side lookup."""
        return cls._expanded_terms(query)

    def retrieve_relevant_chunks(
        self,
        context: ConversationContext,
        query: str,
    ) -> list[dict[str, Any]]:

        if (
            not context.conversation_chunks
            or not query.strip()
        ):
            return []

        query_terms = self._expanded_terms(query)

        if not query_terms:
            return []

        scored: list[
            tuple[int, int, dict[str, Any]]
        ] = []

        for chunk in context.conversation_chunks:

            chunk_terms = set(
                chunk.get("terms", [])
            )

            overlap = query_terms.intersection(
                chunk_terms
            )

            score = len(overlap)

            if score >= self.config.minimum_chunk_score:
                scored.append(
                    (
                        score,
                        chunk["chunk_id"],
                        chunk,
                    )
                )

        # Highest relevance first.
        # Newer chunk wins when relevance is equal.
        scored.sort(
            key=lambda item: (
                item[0],
                item[1],
            ),
            reverse=True,
        )

        return [
            chunk
            for _, _, chunk in scored[
                : self.config.max_retrieved_chunks
            ]
        ]

    # ---------------------------------------------------------
    # PROMPT CONTEXT
    # ---------------------------------------------------------

    def _chunk_text(
        self,
        chunks: list[dict[str, Any]],
    ) -> str:

        if not chunks:
            return "(none)"

        return "\n\n".join(
            (
                f"Historical chunk "
                f"{chunk['chunk_id']} "
                f"(turns "
                f"{chunk['start_turn']}-"
                f"{chunk['end_turn']}):\n"
                f"{chunk['text']}"
            )
            for chunk in chunks
        )

    def recent_turns_text(
        self,
        context: ConversationContext,
    ) -> str:

        turns = context.history[
            -self.config.recent_turns:
        ]

        if not turns:
            return "(none)"

        return "\n".join(
            f"{turn['speaker']}: "
            f"{turn['message']}"
            for turn in turns
        )

    def build_prompt_context(
        self,
        context: ConversationContext,
        query: str = "",
    ) -> str:

        self.sync_structured_state(context)

        summary = (
            context.conversation_summary
            or "(none yet)"
        )

        structured = json.dumps(
            context.structured_state,
            ensure_ascii=False,
            default=str,
        )

        relevant_chunks = (
            self.retrieve_relevant_chunks(
                context,
                query,
            )
        )

        return (
            "CONVERSATION SUMMARY:\n"
            f"{summary}\n\n"

            "STRUCTURED CONVERSATION STATE:\n"
            f"{structured}\n\n"

            "RELEVANT OLDER CONVERSATION:\n"
            f"{self._chunk_text(relevant_chunks)}\n\n"

            "RECENT CONVERSATION:\n"
            f"{self.recent_turns_text(context)}"
        )

    # ---------------------------------------------------------
    # SUMMARY
    # ---------------------------------------------------------

    def should_summarize(
        self,
        context: ConversationContext,
    ) -> bool:

        if (
            context.turn_count
            < self.config.summary_trigger_turns
        ):
            return False

        return (
            context.turn_count
            - context.summary_turn_count
            >= self.config.summary_interval_turns
        )

    async def maybe_summarize(
        self,
        context: ConversationContext,
    ) -> bool:

        if not self.should_summarize(context):
            return False

        if not context.conversation_chunks:
            return False

        provider = get_llm_provider()

        if provider is None:
            return False

        latest_chunk = (
            context.conversation_chunks[-1]
        )

        self.sync_structured_state(context)

        existing_summary = (
            context.conversation_summary
            or "(none)"
        )

        structured = json.dumps(
            context.structured_state,
            ensure_ascii=False,
            default=str,
        )

        system_prompt = """
You maintain concise factual memory for MAYA,
a professional business receptionist.

Update the previous summary using ONLY the
previous summary, structured state, and new
conversation chunk.

Preserve important customer identity,
language preference, intent, appointments,
lead information, requests, decisions,
unresolved questions, commitments and
important preferences.

Do not invent facts.

Return only the updated concise summary.
""".strip()

        user_prompt = f"""
PREVIOUS SUMMARY:
{existing_summary}

STRUCTURED STATE:
{structured}

NEW CONVERSATION CHUNK:
{latest_chunk["text"]}

Write the updated summary.
"""

        summary = await provider.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.0,
        )

        if not summary:
            return False

        context.conversation_summary = (
            summary.strip()
        )

        context.summary_turn_count = (
            context.turn_count
        )

        context.memory_compactions += 1

        return True