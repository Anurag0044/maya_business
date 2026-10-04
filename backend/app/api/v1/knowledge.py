from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.retrieval.ingestion import ingest_document
from app.api.deps import get_current_user, get_database, require_roles
from app.core.config import settings
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

# ---------------------------------------------------------------------------
# RAG diagnostics
# ---------------------------------------------------------------------------

from sqlalchemy import func, select

from app.ai.retrieval.embeddings import get_embedding_provider
from app.ai.retrieval.retriever import KnowledgeRetriever
from app.models.knowledge import KnowledgeChunk


@router.get("/rag/status")
async def rag_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """Show whether this business has usable semantic RAG data."""

    total_chunks = await db.scalar(
        select(func.count(KnowledgeChunk.id)).where(
            KnowledgeChunk.business_id == current_user.business_id
        )
    )

    embedded_chunks = await db.scalar(
        select(func.count(KnowledgeChunk.id)).where(
            KnowledgeChunk.business_id == current_user.business_id,
            KnowledgeChunk.embedding.is_not(None),
        )
    )

    provider_configured = get_embedding_provider() is not None

    semantic_ready = (
        provider_configured
        and (embedded_chunks or 0) > 0
    )

    if semantic_ready:
        retrieval_mode = "SEMANTIC_WITH_LEXICAL_FALLBACK"
    else:
        retrieval_mode = "LEXICAL_FALLBACK"

    return {
        "success": True,
        "data": {
            "embedding_provider_configured": provider_configured,
            "embedding_model": (
                settings.embedding_model
                if provider_configured
                else None
            ),
            "total_chunks": total_chunks or 0,
            "embedded_chunks": embedded_chunks or 0,
            "semantic_ready": semantic_ready,
            "retrieval_mode": retrieval_mode,
        },
        "message": "RAG status",
    }


@router.get("/rag/search")
async def rag_search(
    query: str,
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_database),
):
    """Run tenant-scoped MAYA knowledge retrieval for diagnostics."""

    query = query.strip()

    if not query:
        raise AppException(
            "Query cannot be empty",
            "INVALID_RAG_QUERY",
            422,
        )

    if limit < 1 or limit > 20:
        raise AppException(
            "Limit must be between 1 and 20",
            "INVALID_RAG_LIMIT",
            422,
        )

    results = await KnowledgeRetriever(db).search_text(
        current_user.business_id,
        query,
        limit=limit,
    )

    return {
        "success": True,
        "data": {
            "query": query,
            "results": results,
        },
        "message": "RAG search completed",
    }
