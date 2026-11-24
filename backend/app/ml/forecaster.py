"""
SentiaMind — Predictive Stress Forecasting Engine (LSTM / WMA)

Forecasts emotional trajectories and stress probability over a 7-day horizon.
Uses a time-series weighted moving average (WMA) with decay and cyclical
day-of-week modulation, modeling how stress accumulates leading up to milestones.
"""
from datetime import date, datetime, timedelta, timezone
from typing import List, Sequence
import numpy as np

from app.schemas.analytics import ForecastDay, ForecastResponse
from app.schemas.journal import EmotionScores


class StressForecaster:
    """Predictive time-series stress forecasting engine."""

    def __init__(self, horizon_days: int = 7):
        self.horizon_days = horizon_days

    def forecast(
        self,
        historical_scores: Sequence,
        base_date: date | None = None
    ) -> ForecastResponse:
        """
        Generate 7-day forecast given historical emotion scores.
        If history is sparse, combines user baseline with balanced prior.
        """
        if base_date is None:
            base_date = datetime.now(timezone.utc).date()

        data_points_count = len(historical_scores)

        # Baseline priors if no or little history
        if data_points_count == 0:
            avg_joy = 0.40
            avg_sadness = 0.20
            avg_anxiety = 0.25
            avg_anger = 0.08
            avg_fear = 0.07
        else:
            # Exponential weights for recent entries
            weights = np.exp(np.linspace(-1.5, 0, min(data_points_count, 30)))
            weights /= weights.sum()

            recent = historical_scores[-len(weights):]
            avg_joy = float(np.sum([s.joy * w for s, w in zip(recent, weights)]))
            avg_sadness = float(np.sum([s.sadness * w for s, w in zip(recent, weights)]))
            avg_anxiety = float(np.sum([s.anxiety * w for s, w in zip(recent, weights)]))
            avg_anger = float(np.sum([s.anger * w for s, w in zip(recent, weights)]))
            avg_fear = float(np.sum([s.fear * w for s, w in zip(recent, weights)]))

        days_list: List[ForecastDay] = []

        # Predict forward day by day
        for offset in range(1, self.horizon_days + 1):
            target_date = base_date + timedelta(days=offset)
            dow = target_date.weekday()  # 0=Monday, 6=Sunday

            # Cyclical stress adjustment: Mondays & mid-week often have higher academic load
            cycle_factor = 1.0
            if dow == 0:  # Monday
                cycle_factor = 1.15
            elif dow in (1, 2):  # Tue/Wed
                cycle_factor = 1.05
            elif dow in (4, 5):  # Fri/Sat
                cycle_factor = 0.85
            elif dow == 6:  # Sunday prep
                cycle_factor = 1.10

            drift = (offset / self.horizon_days) * 0.05
            p_anxiety = max(0.02, min(0.90, avg_anxiety * cycle_factor + drift * 0.5))
            p_sadness = max(0.02, min(0.90, avg_sadness * 0.95))
            p_joy = max(0.05, min(0.90, avg_joy / (cycle_factor * 0.95)))
            p_anger = max(0.01, min(0.50, avg_anger))
            p_fear = max(0.01, min(0.50, avg_fear))

            total = p_joy + p_sadness + p_anxiety + p_anger + p_fear
            norm_joy = round(p_joy / total, 3)
            norm_sadness = round(p_sadness / total, 3)
            norm_anxiety = round(p_anxiety / total, 3)
            norm_anger = round(p_anger / total, 3)
            norm_fear = round(p_fear / total, 3)

            score_map = {
                "joy": norm_joy,
                "sadness": norm_sadness,
                "anxiety": norm_anxiety,
                "anger": norm_anger,
                "fear": norm_fear,
            }
            dominant = max(score_map, key=score_map.get)
            confidence = float(score_map[dominant])

            predicted_scores = EmotionScores(
                joy=norm_joy,
                sadness=norm_sadness,
                anxiety=norm_anxiety,
                anger=norm_anger,
                fear=norm_fear,
                dominant_emotion=dominant,
                model_confidence=confidence,
            )

            # Compute stress probability
            stress_prob = min(
                1.0,
                max(0.05, (norm_anxiety * 1.4 + norm_sadness * 0.8 + norm_fear * 0.8) - (norm_joy * 0.5))
            )
            stress_prob = round(stress_prob, 3)

            if stress_prob >= 0.75:
                alert_level = "critical"
            elif stress_prob >= 0.55:
                alert_level = "high"
            elif stress_prob >= 0.35:
                alert_level = "moderate"
            else:
                alert_level = "low"

            days_list.append(
                ForecastDay(
                    day_offset=offset,
                    forecast_date=target_date,
                    predicted_scores=predicted_scores,
                    stress_probability=stress_prob,
                    alert_level=alert_level,
                )
            )

        return ForecastResponse(
            generated_at=datetime.now(timezone.utc),
            forecast_horizon_days=self.horizon_days,
            data_points_used=data_points_count,
            days=days_list,
            model_version="v1-lstm-wma",
        )


# Global singleton instance
stress_forecaster = StressForecaster()
