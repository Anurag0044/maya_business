from __future__ import annotations

import json

from app.ai.agent.action import ActionPlan, AgentAction
from app.ai.agent.context import ConversationContext
from app.ai.agent.memory import ConversationMemoryManager
from app.ai.providers.llm import get_llm_provider


class AgentPlanner:
    """
    Uses the LLM to understand the customer's message
    and select exactly one structured business action.

    The planner does NOT execute business operations.
    """

    def __init__(self) -> None:
        self.memory = ConversationMemoryManager()

    @staticmethod
    def _name_request_response(language: str | None) -> str:
        """Ask for the customer's name in their current language."""
        if language == "hi-IN":
            return "बिल्कुल। आपका नाम बता सकते हैं?"
        if language == "hinglish-IN":
            return "Bilkul. Aapka naam bata sakte hain?"
        return "Sure. May I have your name, please?"


    @staticmethod
    def _phone_request_response(language: str | None) -> str:
        """Ask for the customer's phone number in their current language."""

        if language == "hi-IN":
            return "ज़रूर। कृपया अपना मोबाइल नंबर बता सकते हैं?"

        if language == "hinglish-IN":
            return "Bilkul. Aap apna mobile number bata sakte hain?"

        return "Sure. May I have your mobile number, please?"

    async def plan(
        self,
        context: ConversationContext,
        message: str,
    ) -> ActionPlan:

        # ---------------------------------------------------------
        # Required customer identity for appointment booking
        # ---------------------------------------------------------
        # A name is collected contextually when the customer first
        # asks to book an appointment. We do not force name
        # collection at the beginning of every conversation.
        # This check is deterministic so the LLM cannot accidentally
        # skip a required identity field.
        if (
            context.intent == "APPOINTMENT_REQUEST"
            and not context.customer_name
        ):
            return ActionPlan(
                action=AgentAction.ASK_CLARIFICATION,
                response=self._name_request_response(context.language),
                reason="Customer name is required before starting appointment booking.",
            )


        # ---------------------------------------------------------
        # Required customer phone for lead capture
        # ---------------------------------------------------------
        # A lead must have a phone number so MAYA can identify,
        # contact, and follow up with the customer.
        #
        # For inbound voice calls, customer_phone may already come
        # from caller ID. In that case, do NOT ask the customer
        # for their phone number again.
        if (
            context.intent == "LEAD_CAPTURE"
            and context.channel == "CHAT"
            and not context.customer_phone
        ):
            return ActionPlan(
                action=AgentAction.ASK_CLARIFICATION,
                response=self._phone_request_response(context.language),
                reason="Customer phone number is required before creating a lead.",
            )

        

        # Deterministic V1 routing for intents where the backend has a
        # concrete workflow. This prevents the LLM from turning an explicit
        # service-interest signal into a fee enquiry or generic FAQ.
        if context.intent == "LEAD_CAPTURE":
            return ActionPlan(
                action=AgentAction.CREATE_LEAD,
                arguments={
                    "interest": context.lead_interest,
                },
                reason="Current turn is an explicit service/product interest signal.",
            )

        if context.intent == "APPOINTMENT_CANCEL" or context.pending_action == AgentAction.CANCEL_APPOINTMENT.value:
            return ActionPlan(
                action=AgentAction.CANCEL_APPOINTMENT,
                reason="Current turn requests appointment cancellation or continues a pending cancellation.",
            )

        if context.intent == "APPOINTMENT_RESCHEDULE" or context.pending_action == AgentAction.RESCHEDULE_APPOINTMENT.value:
            return ActionPlan(
                action=AgentAction.RESCHEDULE_APPOINTMENT,
                reason="Current turn requests appointment rescheduling or continues a pending reschedule.",
            )

        provider = get_llm_provider()

        if provider is None:
            return ActionPlan(
                action=AgentAction.HUMAN_HANDOFF,
                response=(
                    "I'm unable to process that request right now. "
                    "I'll connect you with the team."
                ),
                reason="No LLM provider is configured.",
            )

        # ---------------------------------------------------------
        # Bounded conversation memory
        # ---------------------------------------------------------

        memory_context = self.memory.build_prompt_context(context, query=message)

        # ---------------------------------------------------------
        # Current appointment context
        # ---------------------------------------------------------

        appointment_context = {
            "start_time": (
                context.appointment_start_time.isoformat()
                if context.appointment_start_time
                else None
            ),
            "end_time": (
                context.appointment_end_time.isoformat()
                if context.appointment_end_time
                else None
            ),
            "pending_action": context.pending_action,
        }

        # ---------------------------------------------------------
        # System prompt
        # ---------------------------------------------------------

        system_prompt = """
You are the action-planning brain of MAYA Front Desk.

Your job is to understand the customer's CURRENT message
using the RECENT CONVERSATION and CURRENT CONTEXT, then
select exactly ONE business action.

You do NOT execute actions.

You do NOT claim that an action succeeded.

You only produce a structured JSON action plan.

AVAILABLE ACTIONS:

ANSWER
ASK_CLARIFICATION
CHECK_APPOINTMENT_AVAILABILITY
BOOK_APPOINTMENT
CANCEL_APPOINTMENT
RESCHEDULE_APPOINTMENT
CREATE_LEAD
UPDATE_LEAD
HUMAN_HANDOFF


CONVERSATIONAL UNDERSTANDING:

Use the conversation history to understand short replies
and natural conversational language.

LANGUAGE UNDERSTANDING:

Customers may speak in English, Hindi, or Hinglish (Hindi written
in Latin/English script), and they may switch languages during a
conversation. Understand the customer's meaning regardless of the
language or mix used. Do not ask the customer to translate.
Use the current conversation and the stored language preference
when interpreting short follow-up messages.

Examples of affirmations include:

- yes
- yeah
- yep
- sure
- okay
- alright
- go ahead
- book it
- that works
- sounds good
- yes please
- please do

An affirmation does NOT automatically mean BOOK_APPOINTMENT.

Only choose BOOK_APPOINTMENT when the conversation clearly
shows that:

1. An appointment time has already been established.
2. The requested time has been confirmed available.
3. MAYA is waiting for the customer's booking confirmation.

If MAYA is not waiting for booking confirmation, do not
interpret an isolated "yes" as a booking request.

TIME EXPRESSION RULES:

A customer does not need to provide an exact formal time format.

Treat conversational expressions such as:
- "around 5"
- "about 5"
- "at 5"
- "5-ish"
- "around 5 pm"
- "about 5:30"
or somethink like this
treat as a usable appointment time.

When the customer has already established the appointment date
in the conversation and then provides a conversational time such as
"around 5", choose CHECK_APPOINTMENT_AVAILABILITY.

Do not choose ASK_CLARIFICATION merely because the time contains
words such as "around" or "about".

The deterministic appointment parser/backend will normalize and
validate the actual time.

Only ask for clarification when there is genuinely no usable
date or time information.


CONVERSATIONAL DATETIME CONTEXT:

Use information from previous conversation turns.

If a previous turn establishes a date and the current turn
provides a time, combine them.

Example:
Previous: "I'd like an appointment tomorrow."
Current: "around 5"

Interpret this as:
tomorrow at approximately 5 PM

and choose CHECK_APPOINTMENT_AVAILABILITY.

Do not ask the customer to repeat the date.

APPOINTMENT RULES:

1. If the customer wants an appointment but has not provided
   a date/time, choose ASK_CLARIFICATION.

2. If the customer provides a date/time for an appointment,
   choose CHECK_APPOINTMENT_AVAILABILITY.

3. If the customer changes the requested appointment time,
   choose CHECK_APPOINTMENT_AVAILABILITY again.

4. If MAYA previously confirmed that the requested slot is
   available and asks whether the customer wants to book it,
   then an affirmative response should choose BOOK_APPOINTMENT.

5. If the customer asks to cancel an existing appointment,
   choose CANCEL_APPOINTMENT.

6. If the customer asks to move/change an existing appointment,
   choose RESCHEDULE_APPOINTMENT.


LEAD RULES:

7. If the customer wants to provide their details or become
   a potential customer and lead creation is appropriate,
   choose CREATE_LEAD.

8. If an existing lead needs its information changed,
   choose UPDATE_LEAD.

9. Do not invent lead information.


HUMAN HANDOFF:

10. If the customer explicitly asks to speak to a human,
    staff member, representative, or person, choose
    HUMAN_HANDOFF.


GENERAL QUESTIONS:

11. If the customer asks a normal business-information question
    that should be answered using verified business knowledge,
    choose ANSWER.


SAFETY:

12. Never claim an appointment is booked merely because the
    customer requested one.

13. Never claim availability has been confirmed.

14. Availability is determined only by the backend.

15. Booking is performed only by the backend.

16. Never invent business information.

17. Never invent appointment IDs, prices, availability,
    policies, or customer details.

18. If the customer's request is ambiguous and cannot safely
    be resolved from the conversation, choose ASK_CLARIFICATION.


OUTPUT:

Return ONLY valid JSON.

Use exactly this structure:

{
  "action": "ACTION_NAME",
  "arguments": {},
  "response": null,
  "reason": "short explanation"
}

The "action" value MUST be one of the available actions.

The "arguments" object should contain only information
that can be reliably extracted from the conversation.

The "response" field should normally be null because the
customer-facing response is generated separately.
"""

        # ---------------------------------------------------------
        # User prompt
        # ---------------------------------------------------------

        user_prompt = f"""
CURRENT CUSTOMER MESSAGE:

{message}


{memory_context}

CURRENT APPOINTMENT CONTEXT:

{json.dumps(appointment_context, default=str)}


CURRENT GENERAL CONTEXT:

{json.dumps(
    {
        "intent": context.intent,
        "customer_name": context.customer_name,
        "customer_phone": context.customer_phone,
        "customer_email": context.customer_email,
        "language": context.language,
        "lead_id": str(context.lead_id)
        if context.lead_id
        else None,
    },
    default=str,
)}


Determine exactly ONE action.

Return ONLY valid JSON.
"""

        # ---------------------------------------------------------
        # Call LLM
        # ---------------------------------------------------------

        raw = await provider.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.0,
        )

        if not raw:
            return ActionPlan(
                action=AgentAction.HUMAN_HANDOFF,
                response=(
                    "I couldn't process that request accurately. "
                    "I'll connect you with the team."
                ),
                reason="LLM returned no action plan.",
            )

        # ---------------------------------------------------------
        # Parse structured response
        # ---------------------------------------------------------

        try:
            data = json.loads(raw)

            return ActionPlan.model_validate(data)

        except Exception:
            return ActionPlan(
                action=AgentAction.HUMAN_HANDOFF,
                response=(
                    "I couldn't process that request accurately. "
                    "I'll connect you with the team."
                ),
                reason="LLM returned an invalid action plan.",
            )