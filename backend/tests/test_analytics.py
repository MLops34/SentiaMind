"""
SentiaMind — Analytics, Forecasting, and Streak Tests
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_analytics_endpoints(client: AsyncClient, auth_user: dict):
    # Empty state summary
    summary_res = await client.get("/api/v1/analytics/summary", headers=auth_user["headers"])
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_entries"] == 0

    # Add 2 journal entries with emotional signals
    await client.post(
        "/api/v1/journals/",
        json={"content": "I am feeling so stressed and anxious about upcoming exams, dreading Monday."},
        headers=auth_user["headers"],
    )
    await client.post(
        "/api/v1/journals/",
        json={"content": "Feeling a bit better today, went for a run and felt calm and happy."},
        headers=auth_user["headers"],
    )

    # Re-check summary
    summary_res2 = await client.get("/api/v1/analytics/summary", headers=auth_user["headers"])
    assert summary_res2.status_code == 200
    summary2 = summary_res2.json()
    assert summary2["total_entries"] == 2

    # Check forecast
    forecast_res = await client.get("/api/v1/analytics/forecast", headers=auth_user["headers"])
    assert forecast_res.status_code == 200
    forecast = forecast_res.json()
    assert forecast["forecast_horizon_days"] == 7
    assert len(forecast["days"]) == 7
    assert forecast["days"][0]["alert_level"] in ("low", "moderate", "high", "critical")

    # Check streak
    streak_res = await client.get("/api/v1/analytics/streak", headers=auth_user["headers"])
    assert streak_res.status_code == 200
    streak = streak_res.json()
    assert streak["total_entries"] == 2
    assert streak["current_streak_days"] >= 1

    # Check trends
    trends_res = await client.get("/api/v1/analytics/trends?days=7", headers=auth_user["headers"])
    assert trends_res.status_code == 200
    trends = trends_res.json()
    assert len(trends) == 7
