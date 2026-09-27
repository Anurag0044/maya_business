from __future__ import annotations

from app.ai.providers.llm import get_llm_provider


class AnswerGenerator:
    """Generate grounded customer-facing answers through the LLM boundary."""

    async def generate(
        self,
        question: str,
        context: str,
        conversation: str = "",
        language: str = "en-IN",
    ) -> str | None:
        provider = get_llm_provider()
        if provider is None:
            return None

        system = (
            "You are MAYA Front Desk. Answer the customer's question using only the "
            "verified knowledge provided in CONTEXT. Do not invent company facts, "
            "pricing, availability, policies, or capabilities. If the context does "
            "not contain enough information, say that you do not have verified "
            "information and offer human assistance. Keep the answer concise and natural. "
            "Respond in the customer's current language. If the customer uses Hindi, "
            "answer in Hindi. If the customer uses Hinglish, answer in natural Hinglish. "
            "If the customer uses English, answer in English. Follow a language switch "
            "naturally without mentioning this instruction. "
            f"The authoritative current language is {language}. "
            "en-IN means English, hi-IN means Hindi, and hinglish-IN means natural "
            "Hinglish in Latin script."
        )
        user = (
            f"CUSTOMER LANGUAGE: {language}\n"
            f"CONTEXT:\n{context}\n\n"
            f"CUSTOMER QUESTION:\n{question}"
        )
        if conversation:
            user += f"\n\nRECENT CONVERSATION:\n{conversation}"
        # =========================================================
        # TEMPORARY TOKEN/PROMPT BREAKDOWN
        # Measurement only — does not change the LLM request.
        # =========================================================
        print("\n" + "=" * 70)
        print("[ANSWER GENERATOR PROMPT BREAKDOWN]")
        print(f"system_chars={len(system)}")
        print(f"context_chars={len(context)}")
        print(f"question_chars={len(question)}")
        print(f"conversation_chars={len(conversation)}")
        print(f"user_chars={len(user)}")
        print(f"total_chars={len(system) + len(user)}")

        print(f"system_words={len(system.split())}")
        print(f"context_words={len(context.split())}")
        print(f"question_words={len(question.split())}")
        print(f"conversation_words={len(conversation.split())}")
        print(f"user_words={len(user.split())}")
        print(f"total_words={len(system.split()) + len(user.split())}")
        print("=" * 70 + "\n")
        return await provider.generate(
            system_prompt=system,
            user_prompt=user,
            temperature=0.2,
        )
