"""
SentiaMind — Pydantic schemas for analytics endpoints.
"""
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.schemas.journal import EmotionScores


# ── Trend Point ───────────────────────────────────────────────────

class EmotionTrendPoint(BaseModel):
    date: date
    joy: float
    sadness: float
    anxiety: float
    anger: float
    fear: float
    entry_count: int


# ── Summary ───────────────────────────────────────────────────────

class EmotionSummary(BaseModel):
    period_days: int
    average_scores: EmotionScores
    dominant_emotion_overall: str
    total_entries: int
    journaling_streak_days: int
    highest_stress_day: date | None = None
    highest_stress_score: float | None = None


# ── Forecast ─────────────────────────────────────────────────────

class ForecastDay(BaseModel):
    day_offset: int          # 1 = tomorrow, 7 = in 7 days
    forecast_date: date
    predicted_scores: EmotionScores
    stress_probability: float = Field(..., ge=0.0, le=1.0)
    alert_level: str         # "low" | "moderate" | "high" | "critical"


class ForecastResponse(BaseModel):
    generated_at: datetime
    forecast_horizon_days: int = 7
    data_points_used: int
    days: list[ForecastDay]
    model_version: str = "v1-wma"  # weighted moving average stub

    model_config = {"protected_namespaces": ()}


# ── Streaks ───────────────────────────────────────────────────────

class StreakResponse(BaseModel):
    current_streak_days: int
    longest_streak_days: int
    total_entries: int
    first_entry_date: date | None = None
    last_entry_date: date | None = None
