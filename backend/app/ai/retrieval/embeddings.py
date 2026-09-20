from typing import Protocol


class EmbeddingProvider(Protocol):
    async def embed(self, text: str) -> list[float]:
        ...


class PlaceholderEmbeddingProvider:
    """Provider-neutral placeholder.

    Replace this adapter with the selected embedding provider before enabling
    production vector ingestion/retrieval.
    """

    def __init__(self, dimensions: int = 1536):
        self.dimensions = dimensions

    async def embed(self, text: str) -> list[float]:
        # Deterministic zero vector keeps the interface testable without an
        # external AI provider. It must not be used as a production embedding.
        return [0.0] * self.dimensions
