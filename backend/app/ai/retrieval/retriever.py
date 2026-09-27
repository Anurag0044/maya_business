from __future__ import annotations

import re
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.retrieval.embeddings import get_embedding_provider
from app.models.knowledge import FAQ, KnowledgeChunk, KnowledgeDocument


class KnowledgeRetriever:
    """Tenant-aware semantic retrieval with robust lexical fallback."""

    # =============================================================
    # STOPWORDS
    # =============================================================

    # Common conversational words that should not influence
    # business-knowledge lexical ranking.
    STOPWORDS = {
        # ---------------------------------------------------------
        # English conversational words
        # ---------------------------------------------------------
        "a",
        "an",
        "and",
        "are",
        "can",
        "could",
        "do",
        "does",
        "did",
        "for",
        "from",
        "how",
        "i",
        "in",
        "is",
        "it",
        "me",
        "of",
        "on",
        "or",
        "please",
        "tell",
        "the",
        "to",
        "what",
        "whats",
        "what's",
        "would",
        "you",
        "your",
        "we",
        "our",
        "my",
        "this",
        "that",
        "these",
        "those",
        "about",
        "just",
        "want",
        "need",
        "give",
        "let",
        "know",

        # ---------------------------------------------------------
        # Common Hinglish conversational words
        # ---------------------------------------------------------
        "aap",
        "apka",
        "apki",
        "apke",
        "aapko",
        "aaplog",
        "bata",
        "batao",
        "bataiye",
        "bataye",
        "hai",
        "hain",
        "ho",
        "hoga",
        "hogi",
        "honge",
        "ka",
        "ke",
        "ki",
        "ko",
        "me",
        "mein",
        "mera",
        "mere",
        "meri",
        "mujh",
        "mujhe",
        "mujhko",
        "kya",
        "kyaa",
        "kyun",
        "kyunki",
        "kaise",
        "kab",
        "kahan",
        "kis",
        "kisko",
        "kitna",
        "kitni",
        "kitne",
        "krte",
        "karte",
        "karta",
        "karti",
        "karna",
        "karni",
        "kar",
        "sakte",
        "sakta",
        "sakti",
        "chahiye",
        "bhi",
        "toh",
        "to",
        "ya",
        "aur",
        "ek",
        "ye",
        "yeh",
        "woh",
        "wo",
        "mujhse",
        "aapke",
        "tarah",
        "wala",
        "wali",
        "wale",
        "ji",
    }

    # =============================================================
    # BUSINESS QUERY CONCEPT GROUPS
    # =============================================================

    # These groups allow lexical retrieval to understand that
    # different words can represent the same business concept.
    #
    # Example:
    #
    #   user:     "mujhe price batao"
    #   document: "MAYA Front Desk costs ₹3,000 per month"
    #
    # "price" and "costs" belong to the same concept.

    SYNONYM_GROUPS = [
        # ---------------------------------------------------------
        # PRICING
        # ---------------------------------------------------------
        {
            "price",
            "pricing",
            "cost",
            "costs",
            "fee",
            "fees",
            "charge",
            "charges",
            "amount",
            "rate",
            "rates",
        },

        # ---------------------------------------------------------
        # SERVICES
        # ---------------------------------------------------------
        {
            "service",
            "services",
            "provide",
            "provides",
            "provided",
            "providing",
            "offer",
            "offers",
            "offered",
            "offering",
            "solution",
            "solutions",
            "capability",
            "capabilities",
            "feature",
            "features",
        },

        # ---------------------------------------------------------
        # APPOINTMENTS
        # ---------------------------------------------------------
        {
            "appointment",
            "appointments",
            "booking",
            "bookings",
            "book",
            "schedule",
            "scheduling",
            "scheduled",
            "visit",
            "visits",
        },

        # ---------------------------------------------------------
        # LEADS / CUSTOMERS
        # ---------------------------------------------------------
        {
            "lead",
            "leads",
            "customer",
            "customers",
            "client",
            "clients",
            "enquiry",
            "enquiries",
            "inquiry",
            "inquiries",
        },

        # ---------------------------------------------------------
        # FOLLOW-UP
        # ---------------------------------------------------------
        {
            "followup",
            "follow-up",
            "follow",
            "reminder",
            "reminders",
            "remind",
            "contact",
            "contacts",
        },

        # ---------------------------------------------------------
        # CALL / PHONE
        # ---------------------------------------------------------
        {
            "call",
            "calls",
            "calling",
            "phone",
            "phones",
            "voice",
            "voices",
        },

        # ---------------------------------------------------------
        # HUMAN HANDOFF
        # ---------------------------------------------------------
        {
            "human",
            "agent",
            "staff",
            "representative",
            "person",
            "handoff",
            "transfer",
        },
    ]

    def __init__(self, db: AsyncSession):
        self.db = db

    # =============================================================
    # MAIN SEARCH
    # =============================================================

    async def search_text(
        self,
        business_id: UUID,
        query: str,
        limit: int = 5,
    ) -> list[dict]:

        provider = get_embedding_provider()

        # =========================================================
        # SEMANTIC / VECTOR SEARCH
        # =========================================================

        if provider:
            try:
                query_embedding = await provider.embed(query)

                similarity = (
                    1
                    - KnowledgeChunk.embedding.cosine_distance(
                        query_embedding
                    )
                ).label("score")

                rows = await self.db.execute(
                    select(
                        KnowledgeChunk,
                        KnowledgeDocument.title,
                        KnowledgeDocument.document_type,
                        similarity,
                    )
                    .join(
                        KnowledgeDocument,
                        KnowledgeDocument.id == KnowledgeChunk.document_id,
                    )
                    .where(
                        KnowledgeChunk.business_id == business_id,
                        KnowledgeChunk.embedding.is_not(None),
                        KnowledgeDocument.status == "READY",
                    )
                    .order_by(
                        KnowledgeChunk.embedding.cosine_distance(
                            query_embedding
                        )
                    )
                    .limit(limit)
                )

                results = []

                for chunk, title, document_type, score in rows.all():
                    results.append(
                        {
                            "source_type": "DOCUMENT_CHUNK",
                            "source_id": str(chunk.id),
                            "document_id": str(chunk.document_id),
                            "title": title,
                            "document_type": document_type,
                            "content": chunk.content,
                            "score": max(
                                0.0,
                                min(1.0, float(score or 0.0)),
                            ),
                        }
                    )

                if results:
                    print(
                        f"[RAG] Semantic retrieval returned "
                        f"{len(results)} result(s)."
                    )

                    return results

            except Exception as exc:
                print(
                    "[RAG] Semantic retrieval unavailable; "
                    "falling back to lexical search."
                )
                print(f"[RAG] Semantic retrieval error: {exc}")

        # =========================================================
        # LEXICAL FALLBACK
        # =========================================================

        return await self._lexical_search(
            business_id,
            query,
            limit,
        )

    # =============================================================
    # LEXICAL SEARCH
    # =============================================================

    async def _lexical_search(
        self,
        business_id: UUID,
        query: str,
        limit: int,
    ) -> list[dict]:

        # ---------------------------------------------------------
        # NORMALIZE QUERY
        # ---------------------------------------------------------

        tokens = self._tokenize(query)

        print("\n" + "=" * 70)
        print("[RAG LEXICAL SEARCH]")
        print(f"query={query}")
        print(f"tokens={tokens}")

        # ---------------------------------------------------------
        # LOAD READY DOCUMENT CHUNKS
        # ---------------------------------------------------------

        chunks = await self.db.scalars(
            select(KnowledgeChunk)
            .join(
                KnowledgeDocument,
                KnowledgeDocument.id == KnowledgeChunk.document_id,
            )
            .where(
                KnowledgeChunk.business_id == business_id,
                KnowledgeDocument.status == "READY",
            )
        )

        # ---------------------------------------------------------
        # LOAD ACTIVE FAQS
        # ---------------------------------------------------------

        faqs = await self.db.scalars(
            select(FAQ).where(
                FAQ.business_id == business_id,
                FAQ.is_active.is_(True),
            )
        )

        candidates = []

        # =========================================================
        # KNOWLEDGE CHUNKS
        # =========================================================

        for chunk in chunks:

            title = (
                (chunk.metadata_json or {}).get("title")
                or ""
            )

            score = self._lexical_score(
                query=query,
                content=chunk.content,
                title=title,
                tokens=tokens,
            )

            if score > 0:

                candidates.append(
                    {
                        "source_type": "DOCUMENT_CHUNK",
                        "source_id": str(chunk.id),
                        "document_id": str(chunk.document_id),
                        "title": title,
                        "content": chunk.content,
                        "score": min(1.0, score),
                    }
                )

        # =========================================================
        # FAQS
        # =========================================================

        for faq in faqs:

            faq_text = f"{faq.question} {faq.answer}"

            score = self._lexical_score(
                query=query,
                content=faq_text,
                title=faq.question,
                tokens=tokens,
            )

            if score > 0:

                candidates.append(
                    {
                        "source_type": "FAQ",
                        "source_id": str(faq.id),
                        "title": faq.question,
                        "content": faq.answer,
                        "score": min(1.0, score + 0.05),
                    }
                )

        # =========================================================
        # RANK
        # =========================================================

        ranked = sorted(
            candidates,
            key=lambda item: item["score"],
            reverse=True,
        )[:limit]

        # =========================================================
        # DEBUG
        # =========================================================

        print(f"candidates={len(candidates)}")
        print(f"results={len(ranked)}")

        for i, item in enumerate(ranked, start=1):

            print(
                f"\n--- RESULT {i} ---\n"
                f"type={item['source_type']}\n"
                f"title={item.get('title')}\n"
                f"score={item['score']:.4f}\n"
                f"chars={len(item['content'])}\n"
                f"words={len(item['content'].split())}\n"
                f"content={item['content'][:700]}"
            )

        print("=" * 70 + "\n")

        return ranked

    # =============================================================
    # TOKENIZATION
    # =============================================================

    @staticmethod
    def _tokenize(text: str) -> list[str]:

        text = text.lower()

        # Keep words and numbers.
        # Remove punctuation.

        raw_tokens = re.findall(
            r"[a-z0-9]+",
            text,
        )

        # ---------------------------------------------------------
        # Remove stopwords + duplicates
        # ---------------------------------------------------------
        #
        # Example:
        #
        # "kya kya services provide krte ho?"
        #
        # becomes:
        #
        # ["services", "provide"]
        #
        # instead of:
        #
        # ["kya", "kya", "services", "provide", "krte", "ho"]

        tokens = []

        for token in raw_tokens:

            if len(token) <= 2:
                continue

            if token in KnowledgeRetriever.STOPWORDS:
                continue

            if token not in tokens:
                tokens.append(token)

        return tokens

    # =============================================================
    # LEXICAL SCORING
    # =============================================================

    @classmethod
    def _lexical_score(
        cls,
        query: str,
        content: str,
        title: str,
        tokens: list[str],
    ) -> float:

        content_tokens = set(
            cls._tokenize(content)
        )

        title_tokens = set(
            cls._tokenize(title)
        )

        if not tokens:
            return 0.0

        # ---------------------------------------------------------
        # EXACT NORMALIZED PHRASE
        # ---------------------------------------------------------

        query_normalized = " ".join(tokens)

        content_normalized = " ".join(
            cls._tokenize(content)
        )

        exact_phrase_score = (
            0.60
            if (
                query_normalized
                and query_normalized in content_normalized
            )
            else 0.0
        )

        # ---------------------------------------------------------
        # DIRECT + CONCEPT MATCHING
        # ---------------------------------------------------------

        matched_terms = 0

        for token in tokens:

            # Direct word match.
            matched = token in content_tokens

            # -----------------------------------------------------
            # Concept match
            # -----------------------------------------------------
            #
            # Example:
            #
            # query token = "services"
            # content token = "provides"
            #
            # Both belong to the SERVICE concept group.

            if not matched:

                for group in cls.SYNONYM_GROUPS:

                    if (
                        token in group
                        and content_tokens.intersection(group)
                    ):
                        matched = True
                        break

            if matched:
                matched_terms += 1

        relevance = (
            matched_terms / len(tokens)
        )

        # ---------------------------------------------------------
        # TITLE MATCHING
        # ---------------------------------------------------------

        title_matches = sum(
            1
            for token in tokens
            if token in title_tokens
        )

        title_overlap = (
            title_matches / len(tokens)
        )

        # ---------------------------------------------------------
        # WEIGHTED SCORE
        # ---------------------------------------------------------

        score = (
            (relevance * 0.75)
            + (title_overlap * 0.15)
            + exact_phrase_score
        )

        return min(1.0, score)