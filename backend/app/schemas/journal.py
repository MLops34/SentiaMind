"""
SentiaMind — Pydantic schemas for journal endpoints.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, Field


# ── Emotion Scores ────────────────────────────────────────────────

class EmotionScores(BaseModel):
    joy: float = Field(..., ge=0.0, le=1.0)
    sadness: float = Field(..., ge=0.0, le=1.0)
    anxiety: float = Field(..., ge=0.0, le=1.0)
    anger: float = Field(..., ge=0.0, le=1.0)
    fear: float = Field(..., ge=0.0, le=1.0)
    dominant_emotion: str
    model_confidence: float = Field(..., ge=0.0, le=1.0)

    model_config = {"from_attributes": True, "protected_namespaces": ()}


# ── Crisis Response ───────────────────────────────────────────────

class HotlineInfo(BaseModel):
    name: str
    number: str
    available: str  # e.g. "24/7" or "Mon-Fri 9am-9pm"


class CrisisResponse(BaseModel):
    crisis_detected: bool = True
    message: str
    hotlines: list[HotlineInfo]


# ── Journal Create ────────────────────────────────────────────────

class JournalCreateRequest(BaseModel):
    content: str = Field(..., min_length=10, max_length=10_000)


class JournalCreateResponse(BaseModel):
    id: uuid.UUID
    word_count: int
    created_at: datetime
    emotion_scores: EmotionScores


# ── Journal List ──────────────────────────────────────────────────

class JournalListItem(BaseModel):
    id: uuid.UUID
    word_count: int
    created_at: datetime
    dominant_emotion: str | None = None

    model_config = {"from_attributes": True}


class JournalListResponse(BaseModel):
    items: list[JournalListItem]
    total: int
    page: int
    page_size: int
    has_next: bool


# ── Journal Detail ────────────────────────────────────────────────

class JournalDetailResponse(BaseModel):
    id: uuid.UUID
    content: str          # Decrypted on the fly for authenticated owner
    word_count: int
    created_at: datetime
    emotion_scores: EmotionScores | None = None
