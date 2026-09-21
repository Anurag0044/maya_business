from __future__ import annotations

from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.retrieval.chunker import chunk_text
from app.ai.retrieval.embeddings import get_embedding_provider
from app.models.knowledge import KnowledgeChunk, KnowledgeDocument


async def ingest_document(
    db: AsyncSession,
    business_id: UUID,
    document: KnowledgeDocument,
) -> int:
    """Chunk and embed a knowledge document for tenant-scoped retrieval."""
    if document.business_id != business_id:
        raise ValueError("Document does not belong to business")

    await db.execute(delete(KnowledgeChunk).where(KnowledgeChunk.document_id == document.id))

    chunks = chunk_text(document.content or "")
    provider = get_embedding_provider()

    for index, content in enumerate(chunks):
        embedding = await provider.embed(content) if provider else None
        db.add(
            KnowledgeChunk(
                document_id=document.id,
                business_id=business_id,
                content=content,
                chunk_index=index,
                embedding=embedding,
                metadata_json={
                    "title": document.title,
                    "document_type": document.document_type,
                    "source": document.source,
                },
            )
        )

    document.status = "READY" if chunks else "EMPTY"
    await db.commit()
    return len(chunks)
