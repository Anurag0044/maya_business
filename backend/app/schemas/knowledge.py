from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class KnowledgeDocumentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    document_type: str = Field(default="GENERAL_INFO", max_length=50)
    source: str | None = Field(default=None, max_length=500)
    content: str | None = None
    metadata_json: dict | None = None


class KnowledgeDocumentResponse(KnowledgeDocumentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    status: str


class FAQCreate(BaseModel):
    question: str = Field(min_length=1)
    answer: str = Field(min_length=1)
    category: str | None = Field(default=None, max_length=100)


class FAQResponse(FAQCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    business_id: UUID
    is_active: bool
