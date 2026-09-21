from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.retrieval.embeddings import get_embedding_provider
from app.models.knowledge import FAQ, KnowledgeChunk, KnowledgeDocument


class KnowledgeRetriever:
    """Tenant-aware semantic retrieval with lexical fallback."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_text(self, business_id: UUID, query: str, limit: int = 5) -> list[dict]:
        provider = get_embedding_provider()
        if provider:
            query_embedding = await provider.embed(query)
            similarity = (1 - KnowledgeChunk.embedding.cosine_distance(query_embedding)).label("score")
            rows = await self.db.execute(
                select(
                    KnowledgeChunk,
                    KnowledgeDocument.title,
                    KnowledgeDocument.document_type,
                    similarity,
                )
                .join(KnowledgeDocument, KnowledgeDocument.id == KnowledgeChunk.document_id)
                .where(
                    KnowledgeChunk.business_id == business_id,
                    KnowledgeChunk.embedding.is_not(None),
                    KnowledgeDocument.status == "READY",
                )
                .order_by(KnowledgeChunk.embedding.cosine_distance(query_embedding))
                .limit(limit)
            )
            results = []
            for chunk, title, document_type, score in rows.all():
                results.append({
                    "source_type": "DOCUMENT_CHUNK",
                    "source_id": str(chunk.id),
                    "document_id": str(chunk.document_id),
                    "title": title,
                    "document_type": document_type,
                    "content": chunk.content,
                    "score": max(0.0, min(1.0, float(score or 0.0))),
                })
            if results:
                return results

        return await self._lexical_search(business_id, query, limit)

    async def _lexical_search(self, business_id: UUID, query: str, limit: int) -> list[dict]:
        tokens = [token.lower() for token in query.split() if len(token) > 2]
        chunks = await self.db.scalars(
            select(KnowledgeChunk).where(KnowledgeChunk.business_id == business_id)
        )
        faqs = await self.db.scalars(
            select(FAQ).where(FAQ.business_id == business_id, FAQ.is_active.is_(True))
        )
        candidates = []
        for chunk in chunks:
            score = self._lexical_score(query, chunk.content, tokens)
            if score > 0:
                candidates.append({
                    "source_type": "DOCUMENT_CHUNK",
                    "source_id": str(chunk.id),
                    "document_id": str(chunk.document_id),
                    "title": (chunk.metadata_json or {}).get("title"),
                    "content": chunk.content,
                    "score": min(1.0, score),
                })
        for faq in faqs:
            score = self._lexical_score(query, f"{faq.question} {faq.answer}", tokens)
            if score > 0:
                candidates.append({
                    "source_type": "FAQ",
                    "source_id": str(faq.id),
                    "title": faq.question,
                    "content": faq.answer,
                    "score": min(1.0, score + 0.05),
                })
        return sorted(candidates, key=lambda item: item["score"], reverse=True)[:limit]

    @staticmethod
    def _lexical_score(query: str, content: str, tokens: list[str]) -> float:
        haystack = content.lower()
        exact = 1.0 if query.lower() in haystack else 0.0
        overlap = sum(1 for token in tokens if token in haystack)
        return exact + (overlap / max(len(tokens), 1))
