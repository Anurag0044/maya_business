import re

from app.ai.intent.schemas import Intent, IntentResult


class IntentClassifier:
    """Deterministic V1 intent classifier.

    This is deliberately provider-independent. A future LLM classifier can replace
    or augment this implementation without changing the agent/tool contracts.
    """

    PATTERNS: list[tuple[Intent, tuple[str, ...]]] = [
        (Intent.HUMAN_REQUEST, ("human", "agent", "person", "staff", "representative", "talk to someone")),
        (Intent.APPOINTMENT_RESCHEDULE, ("reschedule", "change my appointment", "change the appointment")),
        (Intent.APPOINTMENT_CANCEL, ("cancel my appointment", "cancel appointment", "cancel the appointment")),
        (Intent.APPOINTMENT_REQUEST, ("book", "appointment", "counselling", "counseling", "schedule", "visit")),
        (Intent.FEE_ENQUIRY, ("fee", "fees", "price", "cost", "tuition", "charges")),
        (Intent.COURSE_ENQUIRY, ("course", "courses", "program", "programs", "class", "classes")),
        (Intent.TIMING_ENQUIRY, ("timing", "timings", "time", "batch", "batches", "when")),
        (Intent.LOCATION_ENQUIRY, ("location", "address", "where are you", "branch", "branches")),
        (Intent.ADMISSION_ENQUIRY, ("admission", "admissions", "enroll", "enrol", "registration", "eligibility")),
        (Intent.SCHOLARSHIP_ENQUIRY, ("scholarship", "discount", "concession", "financial aid")),
        (Intent.FOLLOWUP_REQUEST, ("follow up", "follow-up", "call me", "contact me later", "remind me")),
    ]

    def classify(self, message: str) -> IntentResult:
        text = re.sub(r"\s+", " ", message.lower().strip())

        for intent, phrases in self.PATTERNS:
            if any(phrase in text for phrase in phrases):
                entities = self._extract_entities(text)
                return IntentResult(
                    intent=intent,
                    confidence=0.90,
                    entities=entities,
                )

        return IntentResult(
            intent=Intent.GENERAL_FAQ,
            confidence=0.45,
            entities=self._extract_entities(text),
        )

    @staticmethod
    def _extract_entities(text: str) -> dict:
        entities: dict = {}

        phone = re.search(r"(?:\+?\d[\d\s().-]{7,}\d)", text)
        if phone:
            entities["phone"] = phone.group(0).strip()

        email = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text, re.I)
        if email:
            entities["email"] = email.group(0)

        return entities
