from __future__ import annotations


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
}


def is_greeting(message: str) -> bool:
    """
    Detect simple conversational greetings.

    This is intentionally conservative so that normal
    business questions are not treated as greetings.
    """

    text = message.strip().lower()

    if text in GREETING_PHRASES:
        return True

    return False