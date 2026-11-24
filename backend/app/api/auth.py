"""
SentiaMind — Authentication API Endpoints
"""
from datetime import datetime, timedelta, timezone
from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.dependencies import get_current_active_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_user_salt,
    hash_password,
    hash_token,
    verify_password,
)
from app.database import get_db
from app.models.emotion_score import RefreshToken
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UpdateProfileRequest,
    UserProfileResponse,
)

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Register a new user account with unique encryption salt."""
    normalized_email = request.email.lower().strip()

    # Check for existing email
    stmt = select(User).where(User.email == normalized_email)
    existing_user = (await db.execute(stmt)).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    user = User(
        email=normalized_email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name.strip(),
        country_code=request.country_code.upper().strip(),
        encryption_salt=generate_user_salt(),
        counselor_consent=False,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user and issue JWT tokens",
)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Validate credentials and return access + refresh tokens."""
    normalized_email = request.email.lower().strip()
    stmt = select(User).where(User.email == normalized_email)
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated.",
        )

    user_id_str = str(user.id)
    access_token = create_access_token(user_id_str)
    raw_refresh_token = create_refresh_token(user_id_str)

    refresh_expiry = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(raw_refresh_token),
        expires_at=refresh_expiry,
        revoked=False,
    )
    db.add(db_refresh_token)

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh_token,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token using token rotation",
)
async def refresh(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Verify refresh token, revoke it, and issue a fresh pair."""
    try:
        payload = decode_token(request.refresh_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject.",
        )

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user id in token.",
        )

    token_hash = hash_token(request.refresh_token)
    stmt = select(RefreshToken).where(
        RefreshToken.token_hash == token_hash,
        RefreshToken.user_id == user_uuid,
    )
    stored_token = (await db.execute(stmt)).scalar_one_or_none()

    if not stored_token or stored_token.revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token revoked or invalid.",
        )

    # Check expiry
    now_utc = datetime.now(timezone.utc)
    if stored_token.expires_at.tzinfo is None:
        stored_expires_at = stored_token.expires_at.replace(tzinfo=timezone.utc)
    else:
        stored_expires_at = stored_token.expires_at

    if stored_expires_at < now_utc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired.",
        )

    # Rotate: Revoke current token
    stored_token.revoked = True

    # Issue new pair
    new_access = create_access_token(user_id_str)
    new_refresh = create_refresh_token(user_id_str)
    new_refresh_expiry = now_utc + timedelta(days=settings.refresh_token_expire_days)

    db.add(
        RefreshToken(
            user_id=user_uuid,
            token_hash=hash_token(new_refresh),
            expires_at=new_refresh_expiry,
            revoked=False,
        )
    )

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user profile",
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Retrieve profile of currently authenticated user."""
    return current_user


@router.put(
    "/me",
    response_model=UserProfileResponse,
    summary="Update current user profile",
)
async def update_current_user_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update profile attributes."""
    if request.full_name is not None:
        current_user.full_name = request.full_name.strip()
    if request.country_code is not None:
        current_user.country_code = request.country_code.upper().strip()
    if request.counselor_consent is not None:
        current_user.counselor_consent = request.counselor_consent

    db.add(current_user)
    await db.flush()
    await db.refresh(current_user)
    return current_user
