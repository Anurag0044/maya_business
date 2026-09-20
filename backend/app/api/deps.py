from collections.abc import AsyncGenerator

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User


security_scheme = HTTPBearer(auto_error=False)


async def get_database() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db():
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: AsyncSession = Depends(get_database),
) -> User:
    if credentials is None:
        raise AppException(
            "Authentication required",
            error_code="AUTHENTICATION_REQUIRED",
            status_code=401,
        )

    payload = decode_access_token(credentials.credentials)

    from uuid import UUID

    try:
        user_id = UUID(str(payload["sub"]))
    except ValueError as exc:
        raise AppException(
            "Invalid user identifier",
            error_code="INVALID_USER_ID",
            status_code=401,
        ) from exc

    user = await db.get(User, user_id)

    if not user or not user.is_active:
        raise AppException(
            "User account is unavailable",
            error_code="USER_UNAVAILABLE",
            status_code=401,
        )

    return user


def require_roles(*allowed_roles: str):
    async def dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in allowed_roles:
            raise AppException(
                "You do not have permission to perform this action",
                error_code="FORBIDDEN",
                status_code=403,
            )
        return current_user

    return dependency
