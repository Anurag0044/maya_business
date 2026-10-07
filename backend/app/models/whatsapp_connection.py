from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WhatsAppConnection(Base):
    """Business-specific Meta WhatsApp Cloud API connection."""

    __tablename__ = "whatsapp_connections"
    __table_args__ = (
        Index(
            "ix_whatsapp_connections_phone_number_id",
            "phone_number_id",
        ),
        Index(
            "ix_whatsapp_connections_business_id",
            "business_id",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    business_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("businesses.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    phone_number_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
    )
    whatsapp_business_account_id: Mapped[str | None] = mapped_column(
        String(100)
    )
    display_phone_number: Mapped[str | None] = mapped_column(
        String(50)
    )
    access_token_encrypted: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    metadata_json: Mapped[dict | None] = mapped_column(
        JSONB,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
