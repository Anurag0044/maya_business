from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge import FAQ, KnowledgeChunk, KnowledgeDocument


class KnowledgeRetriever:
    """Tenant-aware retrieval facade.

    Structured business data and FAQs can be incorporated ahead of vector search.
    Vector similarity is enabled when real embeddings are configured.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_text(
        self,
        business_id: UUID,
        query: str,
        limit: int = 5,
    ) -> list[dict]:
        # V1 fallback: lightweight lexical retrieval. This makes the agent usable
        # before an external embedding provider is selected.
        tokens = [token.lower() for token in query.split() if len(token) > 2]

        documents = await self.db.scalars(
            select(KnowledgeDocument)
            .where(
                KnowledgeDocument.business_id == business_id,
                KnowledgeDocument.content.is_not(None),
            )
        )
        faqs = await self.db.scalars(
            select(FAQ)
            .where(
                FAQ.business_id == business_id,
                FAQ.is_active.is_(True),
            )
        )

        candidates = []

        for document in documents:
            content = document.content or ""
            score = self._lexical_score(query, content, tokens)
            if score > 0:
                candidates.append({
                    "source_type": "DOCUMENT",
                    "source_id": str(document.id),
                    "title": document.title,
                    "content": content,
                    "score": score,
                })

        for faq in faqs:
            combined = f"{faq.question} {faq.answer}"
            score = self._lexical_score(query, combined, tokens)
            if score > 0:
                candidates.append({
                    "source_type": "FAQ",
                    "source_id": str(faq.id),
                    "title": faq.question,
                    "content": faq.answer,
                    "score": score + 0.05,
                })

        return sorted(candidates, key=lambda item: item["score"], reverse=True)[:limit]

    @staticmethod
    def _lexical_score(query: str, content: str, tokens: list[str]) -> float:
        haystack = content.lower()
        exact = 1.0 if query.lower() in haystack else 0.0
        overlap = sum(1 for token in tokens if token in haystack)
        return exact + (overlap / max(len(tokens), 1))
