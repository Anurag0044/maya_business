from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent.context import ConversationContext
from app.ai.agent.decision import AgentDecision, DecisionType
from app.ai.intent.classifier import IntentClassifier
from app.ai.intent.schemas import Intent
from app.ai.retrieval.generator import AnswerGenerator
from app.ai.retrieval.retriever import KnowledgeRetriever


class AgentOrchestrator:
    """V1 orchestration: intent → retrieval → grounded answer/handoff."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.classifier = IntentClassifier()
        self.retriever = KnowledgeRetriever(db)
        self.generator = AnswerGenerator()

    async def handle_message(self, context: ConversationContext, message: str) -> AgentDecision:
        context.add_turn("CUSTOMER", message)

        result = self.classifier.classify(message)
        context.intent = result.intent.value
        context.update_entities(result.entities)

        if result.intent == Intent.HUMAN_REQUEST:
            return AgentDecision(
                decision=DecisionType.HUMAN_HANDOFF,
                response="Certainly. I'll connect you with a member of the team.",
                confidence=result.confidence,
                reason="Customer explicitly requested a human.",
            )

        if result.intent in {
            Intent.APPOINTMENT_REQUEST,
            Intent.APPOINTMENT_CANCEL,
            Intent.APPOINTMENT_RESCHEDULE,
        }:
            return AgentDecision(
                decision=DecisionType.CLARIFY,
                response="Sure. Please tell me the date and preferred time for the appointment.",
                confidence=result.confidence,
                reason="Appointment flow requires structured date/time details.",
            )

        results = await self.retriever.search_text(context.business_id, message, limit=5)
        if not results:
            return AgentDecision(
                decision=DecisionType.HUMAN_HANDOFF,
                response="I don't have enough verified information to answer that accurately. I'll connect you with the team.",
                confidence=0.20,
                reason="No verified business knowledge was found.",
            )

        best = results[0]
        if best["score"] < 0.35:
            return AgentDecision(
                decision=DecisionType.CLARIFY,
                response="Could you please provide a little more detail about what you'd like to know?",
                confidence=best["score"],
                reason="Knowledge retrieval confidence is low.",
            )

        context_text = "\n\n---\n\n".join(
            f"Source: {item.get('title') or item['source_type']}\n{item['content']}"
            for item in results
        )
        history = "\n".join(
            f"{turn['speaker']}: {turn['message']}" for turn in context.history[-6:]
        )
        generated = await self.generator.generate(message, context_text, history)
        response = generated or best["content"]

        return AgentDecision(
            decision=DecisionType.ANSWER,
            response=response,
            confidence=min(best["score"], 1.0),
            reason=f"Answered from verified {best['source_type'].lower()} knowledge.",
        )
