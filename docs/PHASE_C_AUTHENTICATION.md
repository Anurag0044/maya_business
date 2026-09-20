# Phase C — Authentication

Implemented:

- User registration
- Business creation during owner registration
- Default business settings creation
- Secure password hashing with Argon2 through `pwdlib`
- JWT access tokens
- JWT refresh tokens
- Token type validation
- Token expiry validation
- Current-user dependency
- Role authorization dependency
- Tenant context embedded in JWT (`business_id`)
- `/api/v1/auth/register`
- `/api/v1/auth/login`
- `/api/v1/auth/refresh`
- `/api/v1/auth/me`

## Registration flow

`register → create business → create OWNER user → create default settings → issue tokens`

## Security boundary

Authenticated API code should use `get_current_user` and derive `business_id`
from the authenticated user rather than trusting a client-provided business ID.

## Next

Phase D — Application Services:
- Business service
- Knowledge service
- Lead service
- Call service
- Appointment service
- Follow-up service
- Notification service
- Dashboard service
