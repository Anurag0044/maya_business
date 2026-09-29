import re

from app.ai.intent.schemas import Intent, IntentResult


class IntentClassifier:
    """Deterministic V1 intent classifier plus lightweight entity/language extraction."""

    PATTERNS: list[tuple[Intent, tuple[str, ...]]] = [
        # ---------------------------------------------------------
        # HUMAN HANDOFF
        # ---------------------------------------------------------
        (
            Intent.HUMAN_REQUEST,
            (
                "human",
                "agent",
                "person",
                "staff",
                "representative",
                "talk to someone",
            ),
        ),

        # ---------------------------------------------------------
        # APPOINTMENTS
        # ---------------------------------------------------------
        (
            Intent.APPOINTMENT_RESCHEDULE,
            (
                "reschedule",
                "change my appointment",
                "change the appointment",
            ),
        ),

        (
            Intent.APPOINTMENT_CANCEL,
            (
                "cancel my appointment",
                "cancel appointment",
                "cancel the appointment",
            ),
        ),

        (
            Intent.APPOINTMENT_REQUEST,
            (
                "book",
                "appointment",
                "counselling",
                "counseling",
                "schedule",
                "visit",
            ),
        ),

        # ---------------------------------------------------------
        # GENERAL BUSINESS / SERVICE QUESTIONS
        #
        # Put this BEFORE FEE_ENQUIRY so queries such as:
        #
        # "what services do you provide?"
        # "kya kya services provide karte ho?"
        #
        # are not interpreted as pricing questions.
        # ---------------------------------------------------------
        
        (
            Intent.LEAD_CAPTURE,
            (
        "i'm interested",
        "i am interested",
        "interested in your services",
        "interested in your service",
        "interested in your course",
        "interested in your courses",
        "want to know more",
        "would like to know more",
        "want more information",
        "want information",
        "need more information",
        "i want to enquire",
        "i want to inquire",
        "make an enquiry",
        "make an inquiry",
        "i'd like to enquire",
        "i'd like to inquire",
           ),
        ),

        (
            Intent.GENERAL_FAQ,
            (
                "service",
                "services",
                "provide",
                "provides",
                "offering",
                "offerings",
                "what do you provide",
                "what services",
                "which services",
                "kya kya services",
                "kya services",
                "kaunsi services",
                "konsi services",
                "kis tarah ki services",
                "kya provide",
                "kya offer",
            ),
        ),


        # ---------------------------------------------------------
        # FEES / PRICING
        # ---------------------------------------------------------
        (
            Intent.FEE_ENQUIRY,
            (
                "fee",
                "fees",
                "price",
                "pricing",
                "cost",
                "tuition",
                "charge",
                "charges",
            ),
        ),

        # ---------------------------------------------------------
        # COURSES
        # ---------------------------------------------------------
        (
            Intent.COURSE_ENQUIRY,
            (
                "course",
                "courses",
                "program",
                "programs",
                "class",
                "classes",
            ),
        ),

        # ---------------------------------------------------------
        # TIMING
        # ---------------------------------------------------------
        (
            Intent.TIMING_ENQUIRY,
            (
                "timing",
                "timings",
                "time",
                "batch",
                "batches",
                "when",
            ),
        ),

        # ---------------------------------------------------------
        # LOCATION
        # ---------------------------------------------------------
        (
            Intent.LOCATION_ENQUIRY,
            (
                "location",
                "address",
                "where are you",
                "branch",
                "branches",
            ),
        ),

        # ---------------------------------------------------------
        # ADMISSION
        # ---------------------------------------------------------
        (
            Intent.ADMISSION_ENQUIRY,
            (
                "admission",
                "admissions",
                "enroll",
                "enrol",
                "registration",
                "eligibility",
            ),
        ),

        # ---------------------------------------------------------
        # SCHOLARSHIP
        # ---------------------------------------------------------
        (
            Intent.SCHOLARSHIP_ENQUIRY,
            (
                "scholarship",
                "discount",
                "concession",
                "financial aid",
            ),
        ),

        # ---------------------------------------------------------
        # FOLLOW-UP
        # ---------------------------------------------------------
        (
            Intent.FOLLOWUP_REQUEST,
            (
                "follow up",
                "follow-up",
                "call me",
                "contact me later",
                "remind me",
            ),
        ),
    ]

    # -------------------------------------------------------------
    # NAME EXTRACTION
    # -------------------------------------------------------------

    NAME_PATTERNS = (
        re.compile(
            r"\bmy\s+name\s+is\s+([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,2})",
            re.I,
        ),
        re.compile(
            r"\bthis\s+is\s+([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,2})",
            re.I,
        ),
        re.compile(
            r"\bi(?:'m| am)\s+([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,2})",
            re.I,
        ),
        re.compile(
            r"\bmera\s+naam\s+([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,2})\s+hai\b",
            re.I,
        ),
        re.compile(
            r"\bnaam\s+([A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*){0,2})\s+hai\b",
            re.I,
        ),
        re.compile(
            r"मेरा\s+नाम\s+([^,.!?\n]+?)\s+है"
        ),
    )

    NAME_REJECTIONS = {
        "looking",
        "interested",
        "calling",
        "here",
        "trying",
        "happy",
        "sorry",
        "fine",
        "good",
        "from",
        "a",
        "an",
        "the",
        "and",
        "but",
        "speaking",
        "i",
        "my",
        "we",
        "you",
    }

    # -------------------------------------------------------------
    # HINGLISH LANGUAGE MARKERS
    # -------------------------------------------------------------

    HINGLISH_MARKERS = {
        "haan",
        "han",
        "mujhe",
        "mera",
        "meri",
        "mere",
        "aap",
        "apka",
        "aapka",
        "apki",
        "kal",
        "aaj",
        "chahiye",
        "karna",
        "karni",
        "karte",
        "krte",
        "karta",
        "karti",
        "sakta",
        "sakti",
        "hai",
        "hain",
        "ho",
        "kya",
        "kaise",
        "kitna",
        "kitni",
        "kab",
        "kahan",
        "batao",
        "bataiye",
        "mil",
        "milega",
        "chalega",
        "kripya",
        "ji",
        "theek",
        "thik",
        "acha",
        "achha",
        "nahi",
        "nahin",
        "kyunki",
        "liye",
        "se",
        "ko",
        "par",
        "mein",
        "me",
        "wala",
        "wali",
        
        
    }

    # -------------------------------------------------------------
    # CLASSIFICATION
    # -------------------------------------------------------------

    LEAD_INTEREST_PATTERNS = (
        re.compile(r"\b(?:i am|i'm|im)\s+(?:very\s+)?interested\b", re.I),
        re.compile(r"\binterested\s+in\s+(?:your|the|maya)?\s*(?:services?|product|solution|front\s*desk|receptionist)\b", re.I),
        re.compile(r"\b(?:mujhe|hume|humko)\b.{0,90}\b(?:service|services|front\s*desk|product|solution)\b.{0,40}\b(?:interest|interested|chahiye|lena|len|use|karna|chahta|chahti|pasand)\b", re.I),
        re.compile(r"\b(?:main|mai|hum)\b.{0,70}\b(?:service|services|front\s*desk|product|solution)\b.{0,40}\b(?:interested|interest|lena|len|chahiye|karna|chahta|chahti)\b", re.I),
        re.compile(r"\b(?:i|we)\s+(?:want|would like|need)\s+(?:to\s+)?(?:get|buy|use|start|take|adopt)\b.{0,80}\b(?:service|services|product|solution|front\s*desk|maya)\b", re.I),
        re.compile(r"\b(?:i|we)\s+(?:want|would like)\s+(?:more\s+information|to\s+know\s+more)\b.{0,80}\b(?:service|services|product|solution|front\s*desk|maya)\b", re.I),
        re.compile(r"\b(?:mujhe|hume)\b.{0,80}\b(?:aapki|aapke|maya)\b.{0,60}\b(?:service|services|front\s*desk)\b.{0,40}\b(?:chahiye|lena|len|use|karna)\b", re.I),
    )

    FEE_TERMS = re.compile(
        r"\b(?:fee|fees|price|pricing|cost|charge|charges|rate|rates|subscription)\b|\bper\s+month\b",
        re.I,
    )

    @classmethod
    def _has_lead_interest(cls, text: str) -> bool:
        return any(pattern.search(text) for pattern in cls.LEAD_INTEREST_PATTERNS)

    @classmethod
    def _has_fee_term(cls, text: str) -> bool:
        return bool(cls.FEE_TERMS.search(text))

    @staticmethod
    def _phrase_matches(text: str, phrase: str) -> bool:
        escaped = re.escape(phrase).replace(r"\ ", r"\s+")
        return bool(re.search(rf"(?<!\w){escaped}(?!\w)", text, re.I))

    def classify(self, message: str) -> IntentResult:
        text = re.sub(r"\s+", " ", message.lower().strip())
        entities = self._extract_entities(message)

        # Explicit appointment modification intents must beat the generic
        # "appointment" keyword (e.g. "reschedule my appointment").
        if any(self._phrase_matches(text, phrase) for phrase in (
            "reschedule", "change my appointment", "change the appointment",
        )):
            return IntentResult(
                intent=Intent.APPOINTMENT_RESCHEDULE,
                confidence=0.98,
                entities=entities,
                reasoning="Explicit appointment reschedule language detected.",
            )

        if any(self._phrase_matches(text, phrase) for phrase in (
            "cancel my appointment", "cancel appointment", "cancel the appointment",
        )):
            return IntentResult(
                intent=Intent.APPOINTMENT_CANCEL,
                confidence=0.98,
                entities=entities,
                reasoning="Explicit appointment cancellation language detected.",
            )

        # Explicit commercial intent wins over generic interest language.
        # Example: "I'm interested in pricing" is a fee enquiry, not a lead.
        if self._has_fee_term(text):
            return IntentResult(
                intent=Intent.FEE_ENQUIRY,
                confidence=0.96,
                entities=entities,
                reasoning="Explicit pricing/fee language detected.",
            )

        # Service/product interest is a lead signal, including Hinglish.
        if self._has_lead_interest(text):
            entities["lead_interest"] = self._extract_lead_interest(message)
            return IntentResult(
                intent=Intent.LEAD_CAPTURE,
                confidence=0.96,
                entities=entities,
                reasoning="Customer expressed interest in a product/service.",
            )

        # Score phrase matches rather than using raw substring precedence.
        # Longer phrases are stronger evidence than one generic word.
        candidates: list[tuple[int, int, Intent]] = []
        for pattern_index, (intent, phrases) in enumerate(self.PATTERNS):
            for phrase in phrases:
                if self._phrase_matches(text, phrase):
                    candidates.append((len(phrase), -pattern_index, intent))

        if candidates:
            candidates.sort(reverse=True)
            best_len, _, best_intent = candidates[0]
            confidence = 0.90 if best_len >= 8 else 0.84
            return IntentResult(
                intent=best_intent,
                confidence=confidence,
                entities=entities,
                reasoning="Matched a normalized intent phrase.",
            )

        return IntentResult(
            intent=Intent.GENERAL_FAQ,
            confidence=0.45,
            entities=entities,
            reasoning="No explicit deterministic intent matched.",
        )

    @staticmethod
    def _extract_lead_interest(message: str) -> str:
        text = " ".join(message.strip().split())
        # Store a concise deterministic description instead of relying on the
        # planner to invent CRM data. The original customer wording remains in
        # conversation history as the source of truth.
        return text[:500]

    # -------------------------------------------------------------
    # ENTITY EXTRACTION
    # -------------------------------------------------------------

    @classmethod
    def _extract_entities(
        cls,
        message: str,
    ) -> dict:

        entities: dict = {}

        phone = re.search(
            r"(?:\+?\d[\d\s().-]{7,}\d)",
            message,
        )

        if phone:
            entities["phone"] = phone.group(0).strip()

        email = re.search(
            r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}",
            message,
            re.I,
        )

        if email:
            entities["email"] = email.group(0)

        name = cls._extract_name(message)

        if name:
            entities["name"] = name

        language = cls._detect_language(message)

        if language:
            entities["language"] = language

        return entities

    # -------------------------------------------------------------
    # NAME EXTRACTION
    # -------------------------------------------------------------

    @classmethod
    def _extract_name(
        cls,
        message: str,
    ) -> str | None:

        for pattern in cls.NAME_PATTERNS:

            match = pattern.search(
                message.strip()
            )

            if not match:
                continue

            candidate = re.sub(
                r"\s+",
                " ",
                match.group(1).strip(
                    " \t.,!?;:"
                ),
            )

            words = candidate.split()

            clean_words: list[str] = []

            for word in words:

                if (
                    word.lower().strip(
                        ".,!?;:"
                    )
                    in cls.NAME_REJECTIONS
                ):
                    break

                clean_words.append(
                    word.strip(".,!?;:")
                )

            if not clean_words:
                continue

            if len(clean_words) > 3:
                continue

            return " ".join(clean_words)

        return None

    # -------------------------------------------------------------
    # ENGLISH LANGUAGE MARKERS
    # -------------------------------------------------------------

    ENGLISH_MARKERS = {
        "i",
        "you",
        "we",
        "can",
        "could",
        "would",
        "will",
        "want",
        "need",
        "please",
        "book",
        "appointment",
        "schedule",
        "available",
        "price",
        "cost",
        "fee",
        "fees",
        "course",
        "courses",
        "today",
        "tomorrow",
        "when",
        "where",
        "what",
        "how",
        "why",
        "which",
        "is",
        "are",
        "am",
        "do",
        "does",
        "did",
        "may",
        "hello",
        "thanks",
        "thank",
        "yes",
        "sure",
        "okay",
        "ok",
    }

    # -------------------------------------------------------------
    # LANGUAGE DETECTION
    # -------------------------------------------------------------

    @classmethod
    def _detect_language(
        cls,
        message: str,
    ) -> str | None:

        text = re.sub(
            r"\s+",
            " ",
            message.strip().lower(),
        )

        if not text:
            return None

        # ---------------------------------------------------------
        # EXPLICIT ENGLISH
        # ---------------------------------------------------------

        if re.search(
            r"\b(?:speak|talk|reply|answer|respond|baat)\s+in\s+english\b"
            r"|\benglish\s+(?:mein|me)\b"
            r"|\bin\s+english\b"
            r"|\benglish\s+please\b",
            text,
        ):
            return "en-IN"

        # ---------------------------------------------------------
        # EXPLICIT HINDI
        # ---------------------------------------------------------

        if re.search(
            r"\b(?:speak|talk|reply|answer|respond|baat)\s+in\s+hindi\b"
            r"|\bhindi\s+(?:mein|me)\b"
            r"|\bin\s+hindi\b"
            r"|\bhindi\s+please\b",
            text,
        ) or re.search(
            r"हिंदी",
            text,
        ):
            return "hinglish-IN"

        # ---------------------------------------------------------
        # EXPLICIT HINGLISH
        # ---------------------------------------------------------

        if re.search(
            r"\b(?:speak|talk|reply|answer|respond|baat)\s+in\s+hinglish\b"
            r"|\bhinglish\s+(?:mein|me)\b"
            r"|\bhinglish\b",
            text,
        ):
            return "hinglish-IN"

        # ---------------------------------------------------------
        # DEVANAGARI
        # ---------------------------------------------------------

        if re.search(
            r"[\u0900-\u097F]",
            text,
        ):
            return "hinglish-IN"

        # ---------------------------------------------------------
        # LATIN-SCRIPT HINDI GREETINGS
        # ---------------------------------------------------------

        if re.search(
            r"\b(?:namaste|namaskar|namastey)\b",
            text,
        ):
            return "hi-IN"

        # ---------------------------------------------------------
        # HINGLISH MARKERS
        # ---------------------------------------------------------

        words = re.findall(
            r"[A-Za-z]+",
            text,
        )

        word_set = set(words)

        marker_count = len(
            word_set & cls.HINGLISH_MARKERS
        )

        if marker_count >= 1:
            return "hinglish-IN"

        # Keep previous language for tiny ambiguous messages.
        if len(words) < 2:
            return None

        # Multi-word Latin-script text with no Hindi markers.
        if marker_count == 0:
            return "en-IN"

        return None