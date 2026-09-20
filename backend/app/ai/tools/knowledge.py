from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.retrieval.retriever import KnowledgeRetriever
from app.models.course import Course
from sqlalchemy import select


async def search_knowledge(
    db: AsyncSession,
    business_id: UUID,
    query: str,
    limit: int = 5,
) -> list[dict]:
    return await KnowledgeRetriever(db).search_text(
        business_id=business_id,
        query=query,
        limit=limit,
    )


async def get_course_details(
    db: AsyncSession,
    business_id: UUID,
    course_id: UUID,
) -> Course | None:
    return await db.scalar(
        select(Course).where(
            Course.id == course_id,
            Course.business_id == business_id,
            Course.is_active.is_(True),
        )
    )
