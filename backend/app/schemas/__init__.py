"""SentiaMind — Schemas package."""
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    UserProfileResponse,
    UpdateProfileRequest,
)
from app.schemas.journal import (
    EmotionScores,
    CrisisResponse,
    HotlineInfo,
    JournalCreateRequest,
    JournalCreateResponse,
    JournalListItem,
    JournalListResponse,
    JournalDetailResponse,
)
from app.schemas.analytics import (
    EmotionTrendPoint,
    EmotionSummary,
    ForecastDay,
    ForecastResponse,
    StreakResponse,
)

__all__ = [
    "RegisterRequest", "RegisterResponse", "LoginRequest", "TokenResponse",
    "RefreshRequest", "UserProfileResponse", "UpdateProfileRequest",
    "EmotionScores", "CrisisResponse", "HotlineInfo",
    "JournalCreateRequest", "JournalCreateResponse",
    "JournalListItem", "JournalListResponse", "JournalDetailResponse",
    "EmotionTrendPoint", "EmotionSummary",
    "ForecastDay", "ForecastResponse", "StreakResponse",
]
