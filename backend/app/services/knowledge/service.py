from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.models.knowledge import FAQ, KnowledgeDocument


class KnowledgeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_documents(self, business_id: UUID) -> list[KnowledgeDocument]:
        result = await self.db.scalars(
            select(KnowledgeDocument)
            .where(KnowledgeDocument.business_id == business_id)
            .order_by(KnowledgeDocument.created_at.desc())
        )
        return list(result)

    async def get_document(self, business_id: UUID, document_id: UUID) -> KnowledgeDocument:
        document = await self.db.scalar(
            select(KnowledgeDocument).where(
                KnowledgeDocument.id == document_id,
                KnowledgeDocument.business_id == business_id,
            )
        )
        if not document:
            raise AppException("Knowledge document not found", "KNOWLEDGE_NOT_FOUND", 404)
        return document

    async def create_document(
        self,
        business_id: UUID,
        *,
        title: str,
        document_type: str,
        source: str | None = None,
        content: str | None = None,
        metadata_json: dict | None = None,
    ) -> KnowledgeDocument:
        document = KnowledgeDocument(
            business_id=business_id,
            title=title,
            document_type=document_type,
            source=source,
            content=content,
            metadata_json=metadata_json,
            status="PENDING",
        )
        self.db.add(document)
        await self.db.commit()
        await self.db.refresh(document)
        return document

    async def delete_document(self, business_id: UUID, document_id: UUID) -> None:
        document = await self.get_document(business_id, document_id)
        await self.db.delete(document)
        await self.db.commit()

    async def list_faqs(self, business_id: UUID) -> list[FAQ]:
        result = await self.db.scalars(
            select(FAQ)
            .where(FAQ.business_id == business_id)
            .order_by(FAQ.created_at.desc())
        )
        return list(result)

    async def create_faq(
        self,
        business_id: UUID,
        *,
        question: str,
        answer: str,
        category: str | None = None,
    ) -> FAQ:
        faq = FAQ(
            business_id=business_id,
            question=question,
            answer=answer,
            category=category,
        )
        self.db.add(faq)
        await self.db.commit()
        await self.db.refresh(faq)
        return faq
