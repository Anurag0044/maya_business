from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings
from app.core.exceptions import AppException


password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def _create_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }

    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_access_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    return _create_token(
        subject=subject,
        token_type="access",
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        extra_claims=extra_claims,
    )


def create_refresh_token(
    subject: str,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    return _create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
        extra_claims=extra_claims,
    )


def decode_token(token: str, expected_type: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except InvalidTokenError as exc:
        raise AppException(
            "Invalid or expired token",
            error_code="INVALID_TOKEN",
            status_code=401,
        ) from exc

    if payload.get("type") != expected_type:
        raise AppException(
            "Invalid token type",
            error_code="INVALID_TOKEN_TYPE",
            status_code=401,
        )

    if not payload.get("sub"):
        raise AppException(
            "Token subject is missing",
            error_code="INVALID_TOKEN_SUBJECT",
            status_code=401,
        )

    return payload


def decode_access_token(token: str) -> dict[str, Any]:
    return decode_token(token, "access")


def decode_refresh_token(token: str) -> dict[str, Any]:
    return decode_token(token, "refresh")
