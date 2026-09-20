from typing import Any

from pydantic import BaseModel, Field


class VoiceSessionRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=255)
    business_id: str
    caller_number: str = Field(min_length=3, max_length=50)
    channel: str = "VOICE"
    language: str = "en-IN"


class VoiceMessageRequest(BaseModel):
    session_id: str
    message: str = Field(min_length=1)
    language: str | None = None


class VoiceActionRequest(BaseModel):
    session_id: str
    action: str
    params: dict[str, Any] = Field(default_factory=dict)


class VoiceEndRequest(BaseModel):
    session_id: str
    call_id: str
    outcome: str | None = None
