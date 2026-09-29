from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID
import re

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agent.action import AgentAction, ActionPlan
from app.ai.agent.appointment_parser import (
    parse_appointment_datetime_from_conversation,
)
from app.ai.agent.memory import ConversationMemoryManager
from app.ai.agent.context import ConversationContext
from app.ai.agent.decision import AgentDecision, DecisionType
from app.ai.agent.greeting_detector import is_greeting
from app.ai.agent.planner import AgentPlanner
from app.ai.agent.response_generator import ResponseGenerator
from app.ai.intent.classifier import IntentClassifier
from app.ai.intent.schemas import Intent
from app.ai.retrieval.generator import AnswerGenerator
from app.ai.retrieval.retriever import KnowledgeRetriever
from app.services.conversations.service import ConversationService
from app.ai.tools.appointments import (
    book_appointment,
    check_availability,
    cancel_appointment,
    reschedule_appointment,
)
from app.services.appointments.service import AppointmentService
from app.ai.tools.leads import (
    create_or_update_lead,
    get_lead,
    get_lead_by_phone,
    update_lead,
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
        self.memory = ConversationMemoryManager()

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

    @staticmethod
    def _greeting_fallback() -> str:
        """Deterministic first greeting for every business/user."""
        return (
            "Namaste! MAYA Intelligence mein aapka swagat hai. "
            "Main MAYA hoon. Main aapki kaise help kar sakti hoon?"
        )

    @staticmethod
    def _extract_name_from_name_request(
        context: ConversationContext,
        message: str,
    ) -> str | None:
        """Capture a short bare-name reply after MAYA asks for the name."""
        if len(context.history) < 2:
            return None

        previous_assistant = next(
            (
                turn["message"]
                for turn in reversed(context.history[:-1])
                if turn.get("speaker") == "ASSISTANT"
            ),
            "",
        )
        if not previous_assistant:
            return None

        previous_lower = previous_assistant.lower()
        if "name" not in previous_lower and "नाम" not in previous_assistant:
            return None

        candidate = " ".join(message.strip().split()).strip(" .,!?:;")
        words = candidate.split()

        if not 1 <= len(words) <= 3:
            return None

        if not all(
            re.fullmatch(r"[A-Za-z][A-Za-z.'-]*", word)
            for word in words
        ):
            return None

        common_non_names = {
            "yes", "yeah", "yep", "sure", "okay", "ok", "haan", "han",
            "ji", "no", "nahi", "nahin", "thanks", "thank", "please",
            "book", "appointment", "schedule", "continue",
        }
        if candidate.lower() in common_non_names:
            return None

        return candidate

    @staticmethod
    def _lead_phone_request(language: str) -> str:
        if language == "hi-IN":
            return "ज़रूर। कृपया अपना मोबाइल नंबर बता दीजिए, ताकि मैं आपकी जानकारी सुरक्षित कर सकूँ।"
        if language == "hinglish-IN":
            return "Sure. Please apna mobile number bata dijiye, taaki main aapki details save kar sakun."
        return "Sure. May I have your phone number so I can save your details?"

    @staticmethod
    def _lead_not_found_response(language: str) -> str:
        if language == "hi-IN":
            return "मुझे इस नंबर से कोई मौजूदा रिकॉर्ड नहीं मिल रहा है। क्या आप नया रिकॉर्ड बनवाना चाहेंगे?"
        if language == "hinglish-IN":
            return "Mujhe is number se koi existing record nahi mil raha. Kya aap naya record banwana chahenge?"
        return "I couldn't find an existing record for this phone number. Would you like me to create a new one?"

    @staticmethod
    def _extract_lead_interest(message: str) -> str | None:
        text = " ".join(message.strip().split())
        lowered = text.lower()
        if any(term in lowered for term in (
            "pricing", "price", "fee", "fees", "cost", "charge", "charges",
        )):
            return None
        if re.search(
            r"\b(?:interested|interest|chahiye|lena|len|buy|purchase|use|adopt|start)\b",
            lowered,
        ) and re.search(
            r"\b(?:maya|front\s*desk|service|services|product|solution|receptionist)\b",
            lowered,
        ):
            return text[:500]
        return None

    @staticmethod
    def _lead_phone_request(language: str) -> str:
        if language == "hi-IN":
            return "ज़रूर। कृपया अपना मोबाइल नंबर बता दीजिए, ताकि मैं आपकी जानकारी सुरक्षित कर सकूँ।"
        if language == "hinglish-IN":
            return "Sure. Please apna mobile number bata dijiye, taaki main aapki details save kar sakun."
        return "Sure. May I have your phone number so I can save your details?"

    async def _resolve_customer_appointment(self, context: ConversationContext):
        if context.appointment_id:
            try:
                return await AppointmentService(self.db).get(
                    context.business_id, context.appointment_id
                )
            except Exception:
                context.appointment_id = None

        lead_id = context.lead_id
        if not lead_id and context.customer_phone:
            lead = await get_lead_by_phone(
                self.db, context.business_id, phone=context.customer_phone
            )
            if lead:
                context.lead_id = lead.id
                lead_id = lead.id

        if lead_id:
            appointment = await AppointmentService(self.db).get_latest_upcoming_for_lead(
                context.business_id, lead_id
            )
            if appointment:
                context.appointment_id = appointment.id
            return appointment

        return None

    # =============================================================
    # MAIN MESSAGE HANDLER
    # =============================================================

    async def handle_message(
        self,
        context: ConversationContext,
        message: str,
        conversation=None,
    ) -> AgentDecision:

        # =========================================================
        # 1. PREPARE MEMORY BEFORE SAVING CUSTOMER MESSAGE
        # =========================================================
        # Freeze a completed 8-turn window as a deterministic memory chunk.
        # Chunk creation uses no LLM and therefore adds no token cost.
        self.memory.prepare_before_turn(context)

        # =========================================================
        # 2. SAVE CUSTOMER MESSAGE
        # =========================================================

        context.add_turn(
            "CUSTOMER",
            message,
        )

        # If MAYA just asked for the customer's name, accept a short
        # natural reply such as "Rahul" or "Siddharth Sagar".
        bare_name = self._extract_name_from_name_request(
            context,
            message,
        )
        if bare_name:
            context.customer_name = bare_name
            context.entities["name"] = bare_name

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

        # Current-turn intent is authoritative for routing. Never retain a
        # stale FEE_ENQUIRY/FAQ intent simply because the new message is
        # generic. Pending lead capture is the one deliberate continuation
        # state: a phone number completes the lead workflow.
        context.intent = classifier_result.intent.value
        context.update_entities(classifier_result.entities)

        detected_interest = classifier_result.entities.get("lead_interest")
        if detected_interest:
            context.lead_interest = detected_interest

        if (
            context.pending_action in {
                AgentAction.CREATE_LEAD.value,
                AgentAction.UPDATE_LEAD.value,
            }
            and context.customer_phone
        ):
            context.intent = "LEAD_CAPTURE"

        # ---------------------------------------------------------
        # BOUNDED CONVERSATION MEMORY
        # ---------------------------------------------------------
        # Long calls are represented as: structured state + summary +
        # recent turns. Older turns are compacted only after a successful
        # summary generation.
        await self.memory.maybe_summarize(context)
        self.memory.sync_structured_state(context)

        if conversation is not None:
            await ConversationService(self.db).load_relevant_chunks(
                conversation,
                context,
                query=message,
                max_results=self.memory.config.max_retrieved_chunks,
            )

        # The in-memory context now contains only the small relevant set needed
        # for this turn; the full historical chunk table stays in Cloud SQL.

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

            # The FIRST customer greeting is deterministic and always uses
            # the product's Latin-script Hinglish greeting. Later greetings
            # follow the customer's current language preference.
            if context.turn_count == 1:
                return AgentDecision(
                    decision=DecisionType.ANSWER,
                    response=self._greeting_fallback(),
                    confidence=1.0,
                    reason="First customer greeting detected.",
                )

            response = await self._natural_response(
                context=context,
                message=message,
                action="GREETING",
                result={"first_greeting": False},
                fallback=(
                    "Bilkul. Main aapki kaise help kar sakti hoon?"
                    if context.language == "hinglish-IN"
                    else "Of course. How can I help you?"
                ),
            )
            return AgentDecision(
                decision=DecisionType.ANSWER,
                response=response,
                confidence=1.0,
                reason="Subsequent customer greeting detected.",
            )

        # =========================================================
        # 4. LLM ACTION PLANNER
        # =========================================================

        pending_lead_action = context.pending_action
        if (
            pending_lead_action in {
                AgentAction.CREATE_LEAD.value,
                AgentAction.UPDATE_LEAD.value,
            }
            and context.customer_phone
        ):
            # The previous turn explicitly asked for the contact number.
            # Once the number arrives, do not ask the LLM to rediscover
            # the pending CRM action from a short message such as
            # "9876543210". Execute the already-authorized next step.
            plan = ActionPlan(
                action=AgentAction(pending_lead_action),
                arguments={},
                reason="Continuing the pending lead action after contact details were provided.",
            )
        else:
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

            # Name collection is a deterministic identity requirement.
            # Return the planner's language-specific request directly so
            # the LLM cannot accidentally skip or rewrite the required ask.
            if (
                plan.reason
                == "Customer name is required before starting appointment booking."
                and plan.response
            ):
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=plan.response,
                    confidence=1.0,
                    reason=plan.reason,
                )

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

            recent_conversation = self.memory.recent_turns_text(context)

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
            context.appointment_id = appointment.id
            self.memory.sync_structured_state(context)

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
        # Lead execution is backend-authoritative. The planner may
        # select CREATE_LEAD / UPDATE_LEAD, but only values already
        # captured in deterministic conversation state are written.
        # =========================================================

        if plan.action in {
            AgentAction.CREATE_LEAD,
            AgentAction.UPDATE_LEAD,
        }:

            phone = context.customer_phone

            # A new lead must have a contact identifier. In the future
            # Voice Intelligence will normally supply this from caller ID.
            if plan.action == AgentAction.CREATE_LEAD and not phone:
                context.pending_action = plan.action.value
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=self._lead_phone_request(context.language),
                    confidence=1.0,
                    reason="Phone number is required before creating a lead.",
                )

            # -----------------------------------------------------
            # CREATE / UPSERT LEAD
            # -----------------------------------------------------
            if plan.action == AgentAction.CREATE_LEAD:
                arguments = plan.arguments or {}
                interest = arguments.get("interest") or context.lead_interest
                notes = arguments.get("notes")

                if not isinstance(interest, str):
                    interest = None
                if not isinstance(notes, str):
                    notes = None

                lead = await create_or_update_lead(
                    self.db,
                    context.business_id,
                    phone=phone,
                    name=context.customer_name,
                    email=context.customer_email,
                    source="AI_FRONTDESK",
                    interest=interest,
                    notes=notes,
                )

                context.lead_id = lead.id
                context.lead_interest = lead.interest or context.lead_interest
                context.pending_action = None
                self.memory.sync_structured_state(context)

                response = await self._natural_response(
                    context=context,
                    message=message,
                    action=AgentAction.CREATE_LEAD,
                    result={
                        "success": True,
                        "created_or_updated": True,
                        "lead_name": lead.name,
                        "lead_phone": lead.phone,
                        "lead_id": str(lead.id),
                        "status": lead.status,
                    },
                    fallback=(
                        "Thanks. I've saved your details. "
                        "How else may I help you?"
                    ),
                )

                return AgentDecision(
                    decision=DecisionType.ANSWER,
                    response=response,
                    confidence=1.0,
                    reason="Lead created or updated by the lead backend.",
                )

            # -----------------------------------------------------
            # UPDATE EXISTING LEAD
            # -----------------------------------------------------
            lead = None

            if context.lead_id:
                lead = await get_lead_by_phone(
                    self.db,
                    context.business_id,
                    phone=phone,
                ) if phone else None

                if lead is None:
                    # Context already has the authoritative lead ID, so
                    # use the ID-based update path when caller ID is absent.
                    lead = await get_lead(
                        self.db,
                        context.business_id,
                        context.lead_id,
                    )
            elif phone:
                lead = await get_lead_by_phone(
                    self.db,
                    context.business_id,
                    phone=phone,
                )

            if lead is None:
                context.pending_action = AgentAction.CREATE_LEAD.value
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=self._lead_not_found_response(context.language),
                    confidence=1.0,
                    reason="Existing lead was not found for update.",
                )

            arguments = plan.arguments or {}
            fields = {}

            # Only customer/contact fields may be changed by the AI.
            # CRM workflow fields such as status, priority and assignment
            # remain under the business/admin API.
            if context.customer_name:
                fields["name"] = context.customer_name
            if context.customer_phone:
                fields["phone"] = context.customer_phone
            if context.customer_email:
                fields["email"] = context.customer_email

            for key in ("interest", "notes"):
                value = arguments.get(key)
                if isinstance(value, str) and value.strip():
                    fields[key] = value.strip()

            updated = await update_lead(
                self.db,
                context.business_id,
                lead.id,
                **fields,
            )

            context.lead_id = updated.id
            context.pending_action = None
            self.memory.sync_structured_state(context)

            response = await self._natural_response(
                context=context,
                message=message,
                action=AgentAction.UPDATE_LEAD,
                result={
                    "success": True,
                    "lead_name": updated.name,
                    "lead_phone": updated.phone,
                    "lead_id": str(updated.id),
                    "updated_fields": list(fields.keys()),
                },
                fallback="Done. I've updated your details. How else may I help you?",
            )

            return AgentDecision(
                decision=DecisionType.ANSWER,
                response=response,
                confidence=1.0,
                reason="Lead updated by the lead backend.",
            )

        # =========================================================
        # 10. CANCEL / RESCHEDULE
        # =========================================================

        if plan.action == AgentAction.CANCEL_APPOINTMENT:
            if context.channel == "CHAT" and not context.customer_phone and not context.lead_id:
                context.pending_action = AgentAction.CANCEL_APPOINTMENT.value
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=self._lead_phone_request(context.language),
                    confidence=1.0,
                    reason="Phone number is required to locate the appointment in chat.",
                )

            appointment = await self._resolve_customer_appointment(context)
            if not appointment:
                response = await self._natural_response(
                    context=context,
                    message=message,
                    action=plan.action,
                    result={"success": False, "needs_appointment_reference": True},
                    fallback=(
                        "I can help cancel it. Please share the phone number "
                        "used for the appointment or the appointment details."
                    ),
                )
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=response,
                    confidence=0.90,
                    reason="No active customer appointment could be resolved.",
                )

            if appointment.status not in {"SCHEDULED", "CONFIRMED"}:
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=(
                        "That appointment is no longer active. If you have another "
                        "appointment, please share its details."
                    ),
                    confidence=1.0,
                    reason="Resolved appointment is not cancellable.",
                )

            cancelled = await cancel_appointment(
                self.db, context.business_id, appointment.id
            )
            context.appointment_id = cancelled.id
            context.appointment_start_time = cancelled.start_time
            context.appointment_end_time = cancelled.end_time
            context.pending_action = None
            self.memory.sync_structured_state(context)

            response = await self._natural_response(
                context=context,
                message=message,
                action=plan.action,
                result={
                    "success": True,
                    "appointment_id": str(cancelled.id),
                    "status": cancelled.status,
                    "start_time": cancelled.start_time,
                },
                fallback="Done. Your appointment has been cancelled.",
            )
            return AgentDecision(
                decision=DecisionType.ANSWER,
                response=response,
                confidence=1.0,
                reason="Appointment cancelled by the appointment backend.",
            )

        if plan.action == AgentAction.RESCHEDULE_APPOINTMENT:
            if context.channel == "CHAT" and not context.customer_phone and not context.lead_id:
                context.pending_action = AgentAction.RESCHEDULE_APPOINTMENT.value
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=self._lead_phone_request(context.language),
                    confidence=1.0,
                    reason="Phone number is required to locate the appointment in chat.",
                )

            appointment = await self._resolve_customer_appointment(context)
            if not appointment:
                response = await self._natural_response(
                    context=context,
                    message=message,
                    action=plan.action,
                    result={"success": False, "needs_appointment_reference": True},
                    fallback=(
                        "I can reschedule it. Please share the phone number "
                        "used for the appointment or the appointment details."
                    ),
                )
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=response,
                    confidence=0.90,
                    reason="No active customer appointment could be resolved.",
                )

            # For rescheduling, only a NEW datetime in the current message
            # may replace the existing appointment time. Do not reuse the old
            # appointment datetime from conversation memory as the new slot.
            new_start = parse_appointment_datetime_from_conversation(
                message, ""
            )
            if new_start is None:
                response = await self._natural_response(
                    context=context,
                    message=message,
                    action=plan.action,
                    result={"success": False, "needs_datetime": True},
                    fallback="Sure. What new day and time would you like?",
                )
                context.pending_action = AgentAction.RESCHEDULE_APPOINTMENT.value
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=response,
                    confidence=0.95,
                    reason="New appointment datetime is required for rescheduling.",
                )

            new_end = new_start + timedelta(hours=1)
            if not await check_availability(
                self.db, context.business_id, start_time=new_start, end_time=new_end
            ):
                response = await self._natural_response(
                    context=context,
                    message=message,
                    action=plan.action,
                    result={"success": False, "available": False, "start_time": new_start},
                    fallback="That new time is not available. Please choose another time.",
                )
                return AgentDecision(
                    decision=DecisionType.CLARIFY,
                    response=response,
                    confidence=0.95,
                    reason="Requested reschedule slot is unavailable.",
                )

            updated = await reschedule_appointment(
                self.db,
                context.business_id,
                appointment.id,
                start_time=new_start,
                end_time=new_end,
            )
            context.appointment_id = updated.id
            context.appointment_start_time = updated.start_time
            context.appointment_end_time = updated.end_time
            context.pending_action = None
            self.memory.sync_structured_state(context)

            requested_time = updated.start_time.strftime("%A, %d %B at %I:%M %p")
            response = await self._natural_response(
                context=context,
                message=message,
                action=plan.action,
                result={
                    "success": True,
                    "appointment_id": str(updated.id),
                    "status": updated.status,
                    "start_time": updated.start_time,
                    "end_time": updated.end_time,
                },
                fallback=f"Done. Your appointment has been rescheduled to {requested_time}.",
            )
            return AgentDecision(
                decision=DecisionType.ANSWER,
                response=response,
                confidence=1.0,
                reason="Appointment rescheduled by the appointment backend.",
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

        history = self.memory.build_prompt_context(context, query=message)

        # ---------------------------------------------------------
        # Generate grounded answer
        # ---------------------------------------------------------

        generated = await self.generator.generate(
            message,
            context_text,
            history,
            language=context.language,
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