from dataclasses import dataclass, field
from typing import Any
from uuid import UUID


@dataclass
class ConversationContext:
    session_id: str
    business_id: UUID
    customer_name: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None
    lead_id: UUID | None = None
    intent: str | None = None
    entities: dict[str, Any] = field(default_factory=dict)
    turn_count: int = 0
    language: str = "en-IN"
    history: list[dict[str, str]] = field(default_factory=list)

    def add_turn(self, speaker: str, message: str) -> None:
        self.history.append({
            "speaker": speaker,
            "message": message,
        })
        self.turn_count += 1

    def update_entities(self, entities: dict[str, Any]) -> None:
        self.entities.update(entities)

        if entities.get("name"):
            self.customer_name = entities["name"]
        if entities.get("phone"):
            self.customer_phone = entities["phone"]
        if entities.get("email"):
            self.customer_email = entities["email"]
