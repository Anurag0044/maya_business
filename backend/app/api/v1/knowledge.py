from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database, require_roles
from app.models.user import User
from app.schemas.knowledge import (
    FAQCreate,
    FAQResponse,
    KnowledgeDocumentCreate,
    KnowledgeDocumentResponse,
)
from app.services.knowledge.service import KnowledgeService

router = APIRouter(prefix="/knowledge", tags=["Knowledge"])


@router.get("", response_model=list[KnowledgeDocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await KnowledgeService(db).list_documents(current_user.business_id)


@router.post("", response_model=KnowledgeDocumentResponse, status_code=201)
async def create_document(
    payload: KnowledgeDocumentCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await KnowledgeService(db).create_document(
        current_user.business_id,
        **payload.model_dump(),
    )


@router.get("/{document_id}", response_model=KnowledgeDocumentResponse)
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await KnowledgeService(db).get_document(
        current_user.business_id,
        document_id,
    )


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    await KnowledgeService(db).delete_document(
        current_user.business_id,
        document_id,
    )


@router.get("/faqs/list", response_model=list[FAQResponse])
async def list_faqs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await KnowledgeService(db).list_faqs(current_user.business_id)


@router.post("/faqs", response_model=FAQResponse, status_code=201)
async def create_faq(
    payload: FAQCreate,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    return await KnowledgeService(db).create_faq(
        current_user.business_id,
        **payload.model_dump(),
    )
