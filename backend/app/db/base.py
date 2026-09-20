from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models so Alembic sees all tables in Base.metadata.
from app.models import (  # noqa: E402,F401
    Appointment,
    Business,
    BusinessHours,
    BusinessSettings,
    Call,
    CallEvent,
    CallTranscript,
    Course,
    FAQ,
    Followup,
    FollowupAttempt,
    KnowledgeChunk,
    KnowledgeDocument,
    Lead,
    LeadActivity,
    Notification,
    User,
)
