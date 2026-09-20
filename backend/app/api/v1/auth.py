from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_database
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    UserResponse,
)
from app.services.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_database),
):
    user, access_token, refresh_token = await AuthService(db).register(
        business_name=payload.business_name,
        business_type=payload.business_type,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password=payload.password,
    )

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_database),
):
    user, access_token, refresh_token = await AuthService(db).authenticate(
        email=payload.email,
        password=payload.password,
    )

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=AuthResponse)
async def refresh(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_database),
):
    user, access_token, refresh_token = await AuthService(db).refresh(
        payload.refresh_token
    )

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def me(
    current_user=Depends(get_current_user),
):
    return UserResponse.model_validate(current_user)
