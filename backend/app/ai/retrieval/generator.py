from __future__ import annotations

from app.core.config import settings


class AnswerGenerator:
    """Generate grounded customer-facing answers from retrieved knowledge."""

    async def generate(self, question: str, context: str, conversation: str = "") -> str | None:
        if not settings.openai_api_key:
            return None

        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=settings.openai_api_key)
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

        response = await client.chat.completions.create(
            model=settings.chat_model,
            temperature=0.2,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        return response.choices[0].message.content.strip()
