from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.business import Business
from app.models.settings import BusinessSettings
from app.models.user import User


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(
        self,
        *,
        business_name: str,
        business_type: str,
        name: str,
        email: str,
        phone: str | None,
        password: str,
    ) -> tuple[User, str, str]:
        normalized_email = email.strip().lower()

        existing = await self.db.scalar(
            select(User).where(User.email == normalized_email)
        )
        if existing:
            raise AppException(
                "An account with this email already exists",
                error_code="EMAIL_ALREADY_EXISTS",
                status_code=409,
            )

        business = Business(
            name=business_name.strip(),
            business_type=business_type.strip().upper(),
        )
        self.db.add(business)
        await self.db.flush()

        user = User(
            business_id=business.id,
            name=name.strip(),
            email=normalized_email,
            phone=phone,
            password_hash=hash_password(password),
            role="OWNER",
            is_active=True,
        )
        self.db.add(user)

        settings = BusinessSettings(
            business_id=business.id,
            ai_enabled=True,
            voice_enabled=True,
            auto_lead_creation=True,
            auto_followups=True,
            human_handoff=True,
            default_language="en-IN",
            timezone=business.timezone,
        )
        self.db.add(settings)

        await self.db.commit()
        await self.db.refresh(user)

        return self._issue_tokens(user)

    async def authenticate(self, *, email: str, password: str) -> tuple[User, str, str]:
        normalized_email = email.strip().lower()

        user = await self.db.scalar(
            select(User).where(User.email == normalized_email)
        )

        if not user or not verify_password(password, user.password_hash):
            raise AppException(
                "Invalid email or password",
                error_code="INVALID_CREDENTIALS",
                status_code=401,
            )

        if not user.is_active:
            raise AppException(
                "User account is inactive",
                error_code="USER_INACTIVE",
                status_code=403,
            )

        from datetime import datetime, timezone

        user.last_login_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(user)

        return self._issue_tokens(user)

    async def refresh(self, refresh_token: str) -> tuple[User, str, str]:
        payload = decode_refresh_token(refresh_token)

        try:
            user_id = UUID(str(payload["sub"]))
        except ValueError as exc:
            raise AppException(
                "Invalid token subject",
                error_code="INVALID_TOKEN_SUBJECT",
                status_code=401,
            ) from exc

        user = await self.db.get(User, user_id)

        if not user or not user.is_active:
            raise AppException(
                "User account is unavailable",
                error_code="USER_UNAVAILABLE",
                status_code=401,
            )

        return self._issue_tokens(user)

    @staticmethod
    def _issue_tokens(user: User) -> tuple[User, str, str]:
        claims = {
            "business_id": str(user.business_id),
            "role": user.role,
        }

        access_token = create_access_token(str(user.id), claims)
        refresh_token = create_refresh_token(str(user.id), claims)

        return user, access_token, refresh_token
