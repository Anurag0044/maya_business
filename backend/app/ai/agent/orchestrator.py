from __future__ import annotations

from datetime import timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent.action import AgentAction
from app.ai.agent.appointment_parser import (
    parse_appointment_datetime_from_conversation,
)
from app.ai.agent.context import ConversationContext
from app.ai.agent.decision import AgentDecision, DecisionType
from app.ai.agent.greeting_detector import is_greeting
from app.ai.agent.planner import AgentPlanner
from app.ai.agent.response_generator import ResponseGenerator
from app.ai.intent.classifier import IntentClassifier
from app.ai.intent.schemas import Intent
from app.ai.retrieval.generator import AnswerGenerator
from app.ai.retrieval.retriever import KnowledgeRetriever
from app.ai.tools.appointments import (
    book_appointment,
    check_availability,
)


class AgentOrchestrator:
    """
    MAYA V1 orchestration layer.

    Responsibilities:
    - Maintain conversation context
    - Detect simple conversational greetings
    - Ask the LLM planner what action is appropriate
    - Execute only validated backend actions
    - Use RAG for verified business knowledge
    - Generate natural customer-facing responses

    Important architecture rule:

        LLM -> understands / plans / communicates
        Backend -> validates / executes / stores truth

    The LLM never writes directly to the database.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

        # ---------------------------------------------------------
        # LEGACY CLASSIFIER
        # ---------------------------------------------------------
        # Retained for:
        # - intent metadata
        # - entities such as phone/email
        # - fallback information
        self.classifier = IntentClassifier()

        # ---------------------------------------------------------
        # LLM ACTION PLANNER
        # ---------------------------------------------------------
        # Determines what MAYA should do.
        self.planner = AgentPlanner()

        # ---------------------------------------------------------
        # VERIFIED BUSINESS KNOWLEDGE
        # ---------------------------------------------------------
        self.retriever = KnowledgeRetriever(db)
        self.generator = AnswerGenerator()

        # ---------------------------------------------------------
        # NATURAL CUSTOMER-FACING RESPONSE GENERATOR
        # ---------------------------------------------------------
        self.response_generator = ResponseGenerator()

    # =============================================================
    # NATURAL RESPONSE
    # =============================================================

    async def _natural_response(
        self,
        *,
        context: ConversationContext,
        message: str,
        action: str | AgentAction,
        result: dict,
        fallback: str,
    ) -> str:
        """
        Convert an authoritative result into a natural,
        professional customer-facing response.

        The ResponseGenerator only controls wording.

        It does NOT decide whether an action actually happened.
        """

        # ---------------------------------------------------------
        # Normalize action
        # ---------------------------------------------------------
        # Most actions are AgentAction enum values.
        # GREETING is intentionally a conversational action and
        # does not need to be added to AgentAction.
        if isinstance(action, AgentAction):
            action_name = action.value
        else:
            action_name = action

        # ---------------------------------------------------------
        # Ask ResponseGenerator
        # ---------------------------------------------------------

        response = await self.response_generator.generate(
            context=context,
            customer_message=message,
            action=action_name,
            result=result,
        )

        # ---------------------------------------------------------
        # Deterministic fallback
        # ---------------------------------------------------------

        return response or fallback

    # =============================================================
    # MAIN MESSAGE HANDLER
    # =============================================================

    async def handle_message(
        self,
        context: ConversationContext,
        message: str,
    ) -> AgentDecision:

        # =========================================================
        # 1. SAVE CUSTOMER MESSAGE
        # =========================================================

        context.add_turn(
            "CUSTOMER",
            message,
        )

        # =========================================================
        # 2. LEGACY CLASSIFIER
        # =========================================================
        #
        # This is NOT the primary decision-maker anymore.
        #
        # It is retained for:
        # - intent metadata
        # - entities such as phone/email
        # - fallback information
        #
        # The LLM planner handles conversational understanding.
        # =========================================================

        classifier_result = self.classifier.classify(
            message
        )

        if (
            classifier_result.intent != Intent.GENERAL_FAQ
            or context.intent is None
        ):
            context.intent = classifier_result.intent.value

        context.update_entities(
            classifier_result.entities
        )

        # =========================================================
        # 3. GREETING
        # =========================================================
        #
        # Greetings are conversational and should NEVER go through
        # RAG.
        #
        # Example:
        #
        #     "hello"
        #
        # should NOT become:
        #
        #     hello -> RAG -> no knowledge -> HUMAN_HANDOFF
        #
        # Instead:
        #
        #     hello -> ResponseGenerator -> professional greeting
        #
        # This also happens before the planner because a simple
        # greeting does not require business-action planning.
        # =========================================================

        if is_greeting(message):

            greeting_result = {
                "success": True,
                "type": "GREETING",
                "message": "Customer greeted MAYA.",
            }

            response = await self._natural_response(
                context=context,
                message=message,
                action="GREETING",
                result=greeting_result,
                fallback=(
                    "Good morning. Welcome to MAYA Intelligence. "
                    "I'm MAYA. How may I assist you today?"
                ),
            )

            return AgentDecision(
                decision=DecisionType.ANSWER,
                response=response,
                confidence=1.0,
                reason="Customer greeting detected.",
            )

        # =========================================================
        # 4. LLM ACTION PLANNER
        # =========================================================

        plan = await self.planner.plan(
            context,
            message,
        )

        # =========================================================
        # 5. HUMAN HANDOFF
        # =========================================================

        if plan.action == AgentAction.HUMAN_HANDOFF:

            return AgentDecision(
                decision=DecisionType.HUMAN_HANDOFF,
                response=(
                    plan.response
                    or "Certainly. I'll connect you with a member of the team."
                ),
                confidence=0.95,
                reason=(
                    plan.reason
                    or "LLM selected human handoff."
                ),
            )

        # =========================================================
        # 6. GENERAL CLARIFICATION
        # =========================================================

        if plan.action == AgentAction.ASK_CLARIFICATION:

            response = await self._natural_response(
                context=context,
                message=message,
                action=AgentAction.ASK_CLARIFICATION,
                result={
                    "needs_clarification": True,
                    "reason": plan.reason,
                    "planner_response": plan.response,
                },
                fallback=(
                    plan.response
                    or "Could you tell me a little more about what you need?"
                ),
            )

            return AgentDecision(
                decision=DecisionType.CLARIFY,
                response=response,
                confidence=0.90,
                reason=(
                    plan.reason
                    or "Additional information is required."
                ),
            )

        # =========================================================
        # 7. CHECK APPOINTMENT AVAILABILITY
        # =========================================================

        if (
            plan.action
            == AgentAction.CHECK_APPOINTMENT_AVAILABILITY
        ):

            # -----------------------------------------------------
            # Try to extract datetime from current message and
            # recent conversation.
            # -----------------------------------------------------

            recent_conversation = "\n".join(
                f"{turn['speaker']}: {turn['message']}"
                for turn in context.history[-6:]
            )

            appointment_start = (
                parse_appointment_datetime_from_conversation(
                    message,
                    recent_conversation,
                )
            )

            if appointment_start is not None:

                context.appointment_start_time = (
                    appointment_start
                )

                # -------------------------------------------------
                # V1 default appointment duration:
                # 60 minutes.
                # -------------------------------------------------

                context.appointment_end_time = (
                    appointment_start
                    + timedelta(hours=1)
                )

            # -----------------------------------------------------
            # If no datetime was found in the current message,
            # use datetime already stored in the conversation.
            # -----------------------------------------------------

            if (
                context.appointment_start_time is None
                or context.appointment_end_time is None
            ):

                response = await self._natural_response(
                    context=context,
                    message=message,
                    action=AgentAction.CHECK_APPOINTMENT_AVAILABILITY,
                    result={
                        "available": None,
                        "needs_datetime": True,
                    },
                    fallback=(
                        "What day and time would work best for you?"
                    ),
                )

                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=response,
                    confidence=0.90,
                    reason="Appointment datetime is missing.",
                )

            # -----------------------------------------------------
            # Ask the REAL appointment backend.
            # -----------------------------------------------------

            available = await check_availability(
                self.db,
                context.business_id,
                start_time=context.appointment_start_time,
                end_time=context.appointment_end_time,
            )

            requested_time = (
                context.appointment_start_time.strftime(
                    "%A, %d %B at %I:%M %p"
                )
            )

            # -----------------------------------------------------
            # AVAILABLE
            # -----------------------------------------------------

            if available:

                context.pending_action = (
                    AgentAction.BOOK_APPOINTMENT.value
                )

                response = await self._natural_response(
                    context=context,
                    message=message,
                    action=AgentAction.CHECK_APPOINTMENT_AVAILABILITY,
                    result={
                        "available": True,
                        "start_time": (
                            context.appointment_start_time
                        ),
                        "end_time": (
                            context.appointment_end_time
                        ),
                    },
                    fallback=(
                        f"Yes, {requested_time} is available. "
                        "Would you like me to book the appointment?"
                    ),
                )

                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=response,
                    confidence=1.0,
                    reason=(
                        "Availability confirmed by the "
                        "appointment backend."
                    ),
                )

            # -----------------------------------------------------
            # UNAVAILABLE
            # -----------------------------------------------------

            context.pending_action = None

            response = await self._natural_response(
                context=context,
                message=message,
                action=AgentAction.CHECK_APPOINTMENT_AVAILABILITY,
                result={
                    "available": False,
                    "start_time": (
                        context.appointment_start_time
                    ),
                    "end_time": (
                        context.appointment_end_time
                    ),
                },
                fallback=(
                    f"Sorry, {requested_time} is not available. "
                    "Please tell me another preferred date and time."
                ),
            )

            return AgentDecision(
                decision=DecisionType.CLARIFY,
                response=response,
                confidence=1.0,
                reason=(
                    "The appointment backend reported "
                    "that the requested slot is unavailable."
                ),
            )

        # =========================================================
        # 8. BOOK APPOINTMENT
        # =========================================================

        if plan.action == AgentAction.BOOK_APPOINTMENT:

            # -----------------------------------------------------
            # Safety check: datetime must exist.
            # -----------------------------------------------------

            if (
                context.appointment_start_time is None
                or context.appointment_end_time is None
            ):

                response = await self._natural_response(
                    context=context,
                    message=message,
                    action=AgentAction.BOOK_APPOINTMENT,
                    result={
                        "success": False,
                        "reason": "Appointment datetime is missing.",
                    },
                    fallback=(
                        "Certainly. What date and time would "
                        "you like to book?"
                    ),
                )

                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=response,
                    confidence=0.95,
                    reason=(
                        "Booking requested without "
                        "an appointment time."
                    ),
                )

            # -----------------------------------------------------
            # Safety check: availability must have been confirmed.
            # -----------------------------------------------------

            if (
                context.pending_action
                != AgentAction.BOOK_APPOINTMENT.value
            ):

                response = await self._natural_response(
                    context=context,
                    message=message,
                    action=AgentAction.BOOK_APPOINTMENT,
                    result={
                        "success": False,
                        "reason": (
                            "Appointment availability has not "
                            "been confirmed."
                        ),
                    },
                    fallback=(
                        "I can help book that appointment. "
                        "Let me check the availability first."
                    ),
                )

                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=response,
                    confidence=0.90,
                    reason=(
                        "Booking requested without a "
                        "confirmed available slot."
                    ),
                )

            # -----------------------------------------------------
            # Actually create appointment.
            #
            # AppointmentService performs its own availability
            # check again, providing backend-level protection.
            # -----------------------------------------------------

            appointment = await book_appointment(
                self.db,
                context.business_id,
                title="MAYA Front Desk Appointment",
                start_time=(
                    context.appointment_start_time
                ),
                end_time=(
                    context.appointment_end_time
                ),
                lead_id=context.lead_id,
                appointment_type="COUNSELLING",
            )

            requested_time = (
                appointment.start_time.strftime(
                    "%A, %d %B at %I:%M %p"
                )
            )

            # -----------------------------------------------------
            # Booking succeeded.
            # -----------------------------------------------------

            context.pending_action = None

            response = await self._natural_response(
                context=context,
                message=message,
                action=AgentAction.BOOK_APPOINTMENT,
                result={
                    "success": True,
                    "appointment_id": str(
                        appointment.id
                    ),
                    "status": appointment.status,
                    "start_time": (
                        appointment.start_time
                    ),
                    "end_time": (
                        appointment.end_time
                    ),
                },
                fallback=(
                    f"Done. Your appointment is booked "
                    f"for {requested_time}."
                ),
            )

            return AgentDecision(
                decision=DecisionType.ANSWER,
                response=response,
                confidence=1.0,
                reason=(
                    "Appointment successfully created "
                    "by the appointment backend."
                ),
            )

        # =========================================================
        # 9. LEAD ACTIONS
        # =========================================================
        #
        # Deliberately not implemented yet.
        #
        # This is the next major development phase.
        # =========================================================

        if plan.action in {
            AgentAction.CREATE_LEAD,
            AgentAction.UPDATE_LEAD,
        }:

            return AgentDecision(
                decision=DecisionType.HUMAN_HANDOFF,
                response=(
                    "I have your request, but that action "
                    "is not available yet. I'll connect you "
                    "with the team."
                ),
                confidence=0.90,
                reason=(
                    "Lead action selected by planner, "
                    "but lead execution is not connected yet."
                ),
            )

        # =========================================================
        # 10. CANCEL / RESCHEDULE
        # =========================================================
        #
        # Tools already exist, but we will connect them properly
        # after the basic booking flow is stable.
        # =========================================================

        if plan.action in {
            AgentAction.CANCEL_APPOINTMENT,
            AgentAction.RESCHEDULE_APPOINTMENT,
        }:

            response = await self._natural_response(
                context=context,
                message=message,
                action=plan.action,
                result={
                    "success": False,
                    "requires_additional_information": True,
                    "reason": (
                        "Appointment modification is not "
                        "connected yet."
                    ),
                },
                fallback=(
                    "I can help with that. I need a few more "
                    "details to safely update the appointment."
                ),
            )

            return AgentDecision(
                decision=DecisionType.CLARIFY,
                response=response,
                confidence=0.90,
                reason=(
                    "Appointment modification requires "
                    "additional structured information."
                ),
            )

        # =========================================================
        # 11. ANSWER FROM VERIFIED RAG KNOWLEDGE
        # =========================================================

        results = await self.retriever.search_text(
            context.business_id,
            message,
            limit=5,
        )

        # ---------------------------------------------------------
        # No verified knowledge
        # ---------------------------------------------------------

        if not results:

            return AgentDecision(
                decision=DecisionType.HUMAN_HANDOFF,
                response=(
                    "I don't have enough verified information "
                    "to answer that accurately. "
                    "I'll connect you with the team."
                ),
                confidence=0.20,
                reason=(
                    "No verified business knowledge was found."
                ),
            )

        # ---------------------------------------------------------
        # Low retrieval confidence
        # ---------------------------------------------------------

        best = results[0]

        if best["score"] < 0.35:

            response = await self._natural_response(
                context=context,
                message=message,
                action="RAG_CLARIFICATION",
                result={
                    "knowledge_found": True,
                    "confidence": best["score"],
                    "needs_clarification": True,
                    "reason": (
                        "Knowledge retrieval confidence "
                        "is low."
                    ),
                },
                fallback=(
                    "Could you please provide a little more "
                    "detail about what you'd like to know?"
                ),
            )

            return AgentDecision(
                decision=DecisionType.CLARIFY,
                response=response,
                confidence=best["score"],
                reason=(
                    "Knowledge retrieval confidence is low."
                ),
            )

        # ---------------------------------------------------------
        # Build verified context
        # ---------------------------------------------------------

        context_text = "\n\n---\n\n".join(
            f"Source: "
            f"{item.get('title') or item['source_type']}\n"
            f"{item['content']}"
            for item in results
        )

        history = "\n".join(
            f"{turn['speaker']}: {turn['message']}"
            for turn in context.history[-10:]
        )

        # ---------------------------------------------------------
        # Generate grounded answer
        # ---------------------------------------------------------

        generated = await self.generator.generate(
            message,
            context_text,
            history,
        )

        response = generated or best["content"]

        return AgentDecision(
            decision=DecisionType.ANSWER,
            response=response,
            confidence=min(
                best["score"],
                1.0,
            ),
            reason=(
                "Answered from verified "
                f"{best['source_type'].lower()} knowledge."
            ),
        )