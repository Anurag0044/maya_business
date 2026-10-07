from __future__ import annotations

import base64
import hashlib
from uuid import UUID

from cryptography.fernet import Fernet
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.whatsapp_connection import WhatsAppConnection


class WhatsAppConnectionService:
    """Persists and retrieves business-specific WhatsApp credentials."""

    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def _fernet() -> Fernet:
        return Fernet(
            base64.urlsafe_b64encode(
                hashlib.sha256(
                    settings.jwt_secret_key.encode("utf-8")
                ).digest()
            )
        )

    @classmethod
    def encrypt(cls, value: str) -> str:
        return cls._fernet().encrypt(value.encode("utf-8")).decode("utf-8")

    @classmethod
    def decrypt(cls, value: str) -> str:
        return cls._fernet().decrypt(value.encode("utf-8")).decode("utf-8")

    async def get_for_business(
        self,
        business_id: UUID,
    ) -> WhatsAppConnection | None:
        return await self.db.scalar(
            select(WhatsAppConnection).where(
                WhatsAppConnection.business_id == business_id
            )
        )

    async def get_by_phone_number_id(
        self,
        phone_number_id: str,
    ) -> WhatsAppConnection | None:
        return await self.db.scalar(
            select(WhatsAppConnection).where(
                WhatsAppConnection.phone_number_id == phone_number_id,
                WhatsAppConnection.is_active.is_(True),
            )
        )

    async def upsert(
        self,
        business_id: UUID,
        *,
        phone_number_id: str,
        whatsapp_business_account_id: str | None,
        display_phone_number: str | None,
        access_token: str,
        metadata: dict,
    ) -> WhatsAppConnection:
        connection = await self.get_for_business(business_id)

        if connection is None:
            connection = WhatsAppConnection(
                business_id=business_id,
                phone_number_id=phone_number_id,
                whatsapp_business_account_id=whatsapp_business_account_id,
                display_phone_number=display_phone_number,
                access_token_encrypted=self.encrypt(access_token),
                is_active=True,
                metadata_json=metadata,
            )
            self.db.add(connection)
        else:
            connection.phone_number_id = phone_number_id
            connection.whatsapp_business_account_id = (
                whatsapp_business_account_id
            )
            connection.display_phone_number = display_phone_number
            connection.access_token_encrypted = self.encrypt(access_token)
            connection.is_active = True
            connection.metadata_json = metadata

        await self.db.commit()
        await self.db.refresh(connection)
        return connection

    async def status(self, business_id: UUID) -> dict:
        connection = await self.get_for_business(business_id)
        if not connection:
            return {"connected": False}

        return {
            "connected": True,
            "phone_number_id": connection.phone_number_id,
            "whatsapp_business_account_id": (
                connection.whatsapp_business_account_id
            ),
            "display_phone_number": connection.display_phone_number,
            "is_active": connection.is_active,
        }

    async def disconnect(self, business_id: UUID) -> bool:
        """Disable WhatsApp for a business without deleting its credentials."""
        connection = await self.get_for_business(business_id)
        if connection is None:
            return False

        connection.is_active = False
        await self.db.commit()
        return True

