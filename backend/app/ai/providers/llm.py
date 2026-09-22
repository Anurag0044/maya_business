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

        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
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


class NVIDIAKimiProvider(OpenAICompatibleLLMProvider):
    """NVIDIA NIM adapter for Moonshot Kimi K3 (reasoning model).

    Kimi K3 is a chain-of-thought / reasoning model — the same family as
    OpenAI o1/o3.  These models do NOT accept a ``temperature`` parameter
    (any value other than 1 returns a 400 from the API).  Instead they
    expose ``reasoning_effort`` to trade off latency against answer quality.
    """

    def __init__(self) -> None:
        if not settings.nvidia_api_key:
            raise RuntimeError("NVIDIA_API_KEY is not configured")
        super().__init__(
            api_key=settings.nvidia_api_key,
            base_url=settings.nvidia_base_url,
            model=settings.nvidia_chat_model,
        )

    async def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 1.0,          # accepted value for reasoning models; kept for interface compat
        reasoning_effort: str = "low",     # "low" | "medium" | "max"
    ) -> str | None:
        response = await self.client.chat.completions.create(
            model=self.model,
            # temperature is intentionally omitted — reasoning models reject any value != 1
            # and the OpenAI SDK still sends it even when set to 1, causing API errors.
            extra_body={"reasoning_effort": reasoning_effort},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
        )
        content = response.choices[0].message.content
        return content.strip() if content else None


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

    if provider == "nvidia":
        if not settings.nvidia_api_key:
            return None
        return NVIDIAKimiProvider()

    if provider == "openai":
        if not settings.openai_api_key:
            return None
        return OpenAIProvider()

    if provider in {"none", "disabled", ""}:
        return None

    raise ValueError(f"Unsupported LLM_PROVIDER: {settings.llm_provider}")
