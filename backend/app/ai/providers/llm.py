from __future__ import annotations

from typing import Protocol

from app.core.config import settings


class LLMProvider(Protocol):
    """Provider-neutral interface used by MAYA's AI layer."""

    async def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
    ) -> str | None:
        ...


class OpenAICompatibleLLMProvider:
    """Adapter for OpenAI-compatible chat-completions APIs.

    This deliberately keeps provider-specific HTTP/SDK details behind one
    boundary so the rest of MAYA does not care which model is running.
    """

    def __init__(self, *, api_key: str, base_url: str, model: str) -> None:
        from openai import AsyncOpenAI

        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=90.0,  # seconds — default is 600s which causes silent hangs
        )
        self.model = model

    async def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.2,
    ) -> str | None:
        response = await self.client.chat.completions.create(
            model=self.model,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        content = response.choices[0].message.content
        return content.strip() if content else None


class GroqProvider(OpenAICompatibleLLMProvider):
    """Groq LPU adapter — Llama 3.1 / other open-source models via Groq.

    Groq's inference is OpenAI-compatible, extremely fast (800+ tokens/sec),
    and has a generous free tier — making it the recommended provider for
    development and early production.
    """

    def __init__(self) -> None:
        if not settings.groq_api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not configured. "
                "Get a free key at https://console.groq.com/keys "
                "and add it to backend/.env"
            )
        super().__init__(
            api_key=settings.groq_api_key,
            base_url=settings.groq_base_url,
            model=settings.groq_chat_model,
        )


class NVIDIAProvider(OpenAICompatibleLLMProvider):
    """NVIDIA NIM adapter — works with any NVIDIA-hosted model."""

    def __init__(self) -> None:
        if not settings.nvidia_api_key:
            raise RuntimeError("NVIDIA_API_KEY is not configured")
        super().__init__(
            api_key=settings.nvidia_api_key,
            base_url=settings.nvidia_base_url,
            model=settings.nvidia_chat_model,
        )


# Backwards-compatible alias kept in case other code references the old name.
NVIDIAKimiProvider = NVIDIAProvider


class OpenAIProvider(OpenAICompatibleLLMProvider):
    """Optional OpenAI adapter retained for development/fallback use."""

    def __init__(self) -> None:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured")
        super().__init__(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            model=settings.chat_model,
        )


def get_llm_provider() -> LLMProvider | None:
    """Return the configured LLM provider without leaking provider details."""

    provider = settings.llm_provider.lower().strip()

    if provider == "groq":
        if not settings.groq_api_key:
            return None
        return GroqProvider()

    if provider == "nvidia":
        if not settings.nvidia_api_key:
            return None
        return NVIDIAProvider()

    if provider == "openai":
        if not settings.openai_api_key:
            return None
        return OpenAIProvider()

    if provider in {"none", "disabled", ""}:
        return None

    raise ValueError(f"Unsupported LLM_PROVIDER: {settings.llm_provider}")
