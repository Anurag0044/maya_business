from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent.context import ConversationContext
from app.ai.agent.decision import AgentDecision, DecisionType
from app.ai.intent.classifier import IntentClassifier
from app.ai.intent.schemas import Intent
from app.ai.retrieval.retriever import KnowledgeRetriever


class AgentOrchestrator:
    """Provider-neutral V1 agent orchestration.

    The orchestrator owns conversation flow and tool selection. It does not write
    directly to the database; tools delegate to application services.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.classifier = IntentClassifier()
        self.retriever = KnowledgeRetriever(db)

    async def handle_message(
        self,
        context: ConversationContext,
        message: str,
    ) -> AgentDecision:
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

        results = await self.retriever.search_text(
            context.business_id,
            message,
            limit=3,
        )

        if not results:
            return AgentDecision(
                decision=DecisionType.HUMAN_HANDOFF,
                response="I don't have enough verified information to answer that accurately. I'll connect you with the team.",
                confidence=0.25,
                reason="No verified business knowledge was found.",
            )

        best = results[0]

        if best["score"] < 0.5:
            return AgentDecision(
                decision=DecisionType.CLARIFY,
                response="Could you please provide a little more detail about what you'd like to know?",
                confidence=best["score"],
                reason="Knowledge retrieval confidence is low.",
            )

        return AgentDecision(
            decision=DecisionType.ANSWER,
            response=best["content"],
            confidence=min(best["score"], 1.0),
            reason=f"Answered from verified {best['source_type'].lower()} knowledge.",
        )
