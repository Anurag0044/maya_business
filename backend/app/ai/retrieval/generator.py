from __future__ import annotations

from app.ai.providers.llm import get_llm_provider


class AnswerGenerator:
    """Generate grounded customer-facing answers through the LLM boundary."""

    async def generate(self, question: str, context: str, conversation: str = "") -> str | None:
        provider = get_llm_provider()
        if provider is None:
            return None

        system = (
            "You are MAYA Front Desk. Answer the customer's question using only the "
            "verified knowledge provided in CONTEXT. Do not invent company facts, "
            "pricing, availability, policies, or capabilities. If the context does "
            "not contain enough information, say that you do not have verified "
            "information and offer human assistance. Keep the answer concise and natural."
        )
        user = f"CONTEXT:\n{context}\n\nCUSTOMER QUESTION:\n{question}"
        if conversation:
            user += f"\n\nRECENT CONVERSATION:\n{conversation}"

        return await provider.generate(
            system_prompt=system,
            user_prompt=user,
            temperature=0.2,
        )
