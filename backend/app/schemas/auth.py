"""
SentiaMind — Pydantic schemas for authentication endpoints.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Registration ──────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=200)
    country_code: str = Field(default="IN", min_length=2, max_length=3)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit.")
        return v


class RegisterResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Login ─────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


# ── Refresh ───────────────────────────────────────────────────────

class RefreshRequest(BaseModel):
    refresh_token: str


# ── User Profile ──────────────────────────────────────────────────

class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    country_code: str
    counselor_consent: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=200)
    country_code: str | None = Field(None, min_length=2, max_length=3)
    counselor_consent: bool | None = None
