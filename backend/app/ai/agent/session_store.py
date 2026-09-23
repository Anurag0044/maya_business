from uuid import UUID

from app.ai.agent.context import ConversationContext


_contexts: dict[tuple[UUID, str], ConversationContext] = {}


def get_context(
    business_id: UUID,
    session_id: str,
) -> ConversationContext | None:
    return _contexts.get((business_id, session_id))


def create_context(
    business_id: UUID,
    session_id: str,
    *,
    customer_phone: str | None = None,
    language: str = "en-IN",
) -> ConversationContext:
    context = ConversationContext(
        session_id=session_id,
        business_id=business_id,
        customer_phone=customer_phone,
        language=language,
    )

    _contexts[(business_id, session_id)] = context

    return context


def get_or_create_context(
    business_id: UUID,
    session_id: str,
) -> ConversationContext:
    context = get_context(business_id, session_id)

    if context is None:
        context = create_context(
            business_id,
            session_id,
        )

    return context


def delete_context(
    business_id: UUID,
    session_id: str,
) -> None:
    _contexts.pop((business_id, session_id), None)