from __future__ import annotations

import re


GREETING_PHRASES = {
    "hello",
    "hi",
    "hey",
    "yo",
    "hi there",
    "hello there",
    "heya",
    "greetings",
    "salutations",
    "howdy",
    "good day",
    "hiya",
    "hiya!",
    "hiya!!",
    "hiya!!!",
    "namaste",
    "namaskar",
    "good morning",
    "good afternoon",
    "good evening",
    "hi ji",
    "hello ji",
    "namaste ji",
    "namaskar ji",
    "namastey",
    "namastey ji",
    "सुप्रभात",
    "शुभ प्रभात",
    "नमस्ते",
    "नमस्ते जी",
    "नमस्कार",
    "नमस्कार जी",
}


def is_greeting(message: str) -> bool:
    """
    Detect simple conversational greetings.

    This is intentionally conservative so that normal
    business questions are not treated as greetings.
    """

    text = re.sub(r"[.!?,;:]+$", "", message.strip().lower())
    text = " ".join(text.split())

    if text in GREETING_PHRASES:
        return True

    return False