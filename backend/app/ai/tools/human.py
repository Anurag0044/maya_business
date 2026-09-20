from uuid import UUID


def request_human(
    *,
    reason: str,
    business_id: UUID,
) -> dict:
    return {
        "handoff_required": True,
        "business_id": str(business_id),
        "reason": reason,
    }
