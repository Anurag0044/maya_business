from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.retrieval.ingestion import ingest_document
from app.api.deps import get_current_user, get_database, require_roles
from app.core.exceptions import AppException
from app.models.user import User
from app.schemas.knowledge import (
    FAQCreate,
    FAQResponse,
    KnowledgeDocumentCreate,
    KnowledgeDocumentResponse,
    KnowledgeIngestResponse,
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


@router.post("/upload", response_model=KnowledgeDocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    title: str | None = Form(default=None),
    document_type: str = Form(default="GENERAL_INFO"),
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    filename = file.filename or "knowledge-document"
    content_type = (file.content_type or "").lower()
    raw = await file.read()

    if content_type == "text/plain" or filename.lower().endswith(".txt"):
        content = raw.decode("utf-8", errors="replace")
    elif filename.lower().endswith(".docx"):
        from io import BytesIO
        from docx import Document

        parsed = Document(BytesIO(raw))
        content = "\n\n".join(
            paragraph.text.strip()
            for paragraph in parsed.paragraphs
            if paragraph.text.strip()
        )
    else:
        raise AppException(
            "Only .docx and .txt knowledge files are supported in V1",
            "UNSUPPORTED_KNOWLEDGE_FILE",
            400,
        )

    if not content.strip():
        raise AppException("Knowledge file is empty", "EMPTY_KNOWLEDGE_FILE", 400)

    return await KnowledgeService(db).create_document(
        current_user.business_id,
        title=title or filename,
        document_type=document_type,
        source=filename,
        content=content,
        metadata_json={"filename": filename, "content_type": content_type},
    )


@router.post("/{document_id}/ingest", response_model=KnowledgeIngestResponse)
async def reingest_document(
    document_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN", "STAFF")),
    db: AsyncSession = Depends(get_database),
):
    document = await KnowledgeService(db).get_document(current_user.business_id, document_id)
    chunks = await ingest_document(db, current_user.business_id, document)
    return {
        "document_id": document.id,
        "chunks_created": chunks,
        "status": document.status,
    }


@router.get("/{document_id}", response_model=KnowledgeDocumentResponse)
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    return await KnowledgeService(db).get_document(current_user.business_id, document_id)


@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(require_roles("OWNER", "ADMIN")),
    db: AsyncSession = Depends(get_database),
):
    await KnowledgeService(db).delete_document(current_user.business_id, document_id)


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
