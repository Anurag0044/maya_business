from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    password = "StrongPassword123!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("WrongPassword123!", hashed)


def test_access_token_roundtrip():
    token = create_access_token(
        "00000000-0000-0000-0000-000000000001",
        {"business_id": "00000000-0000-0000-0000-000000000002", "role": "OWNER"},
    )
    payload = decode_access_token(token)

    assert payload["sub"] == "00000000-0000-0000-0000-000000000001"
    assert payload["business_id"] == "00000000-0000-0000-0000-000000000002"
    assert payload["role"] == "OWNER"
