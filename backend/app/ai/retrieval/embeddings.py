from __future__ import annotations

from typing import Protocol

from app.core.config import settings


class EmbeddingProvider(Protocol):
    async def embed(self, text: str) -> list[float]:
        ...


class OpenAIEmbeddingProvider:
    """OpenAI embedding adapter used for production RAG."""

    def __init__(self) -> None:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        from openai import AsyncOpenAI

        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.embedding_model
        self.dimensions = settings.embedding_dimensions

    async def embed(self, text: str) -> list[float]:
        kwargs = {"model": self.model, "input": text}
        # text-embedding-3 models support configurable dimensions.
        if self.dimensions:
            kwargs["dimensions"] = self.dimensions
        response = await self.client.embeddings.create(**kwargs)
        return response.data[0].embedding


class PlaceholderEmbeddingProvider:
    """Development-only fallback when no external embedding provider is configured."""

    def __init__(self, dimensions: int = 1536):
        self.dimensions = dimensions

    async def embed(self, text: str) -> list[float]:
        return [0.0] * self.dimensions


def get_embedding_provider() -> EmbeddingProvider | None:
    if settings.openai_api_key:
        return OpenAIEmbeddingProvider()
    return None
