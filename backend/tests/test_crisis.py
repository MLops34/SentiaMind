"""
SentiaMind — Deterministic Crisis Safeguard Engine Tests
"""
import pytest
from httpx import AsyncClient

from app.core.crisis import build_crisis_response, scan_crisis


def test_lexical_scanner_trigger():
    """Verify high-signal self-harm phrases trigger scan without AI."""
    phrases = [
        "I just want to end it all tonight",
        "Thinking about suicide constantly",
        "I feel like I want to die and no one would care",
        "Thinking of hurting myself again",
    ]
    for p in phrases:
        result = scan_crisis(p)
        assert result.triggered is True, f"Failed to trigger on: {p}"
        assert len(result.matched_terms) > 0


def test_lexical_scanner_benign():
    """Verify normal emotional expression does not trigger crisis safeguard."""
    benign_entries = [
        "Today was exhausting, I have so much homework to finish before midnight.",
        "I am so stressed about my biology exam tomorrow morning.",
        "Felt frustrated with my group project partner but made progress.",
        "Enjoyed coffee with friends and felt genuinely happy afterwards.",
    ]
    for b in benign_entries:
        result = scan_crisis(b)
        assert result.triggered is False, f"False positive on: {b}"


def test_hotlines_regional():
    """Verify hotline directory serves correct regional emergency lines."""
    in_resp = build_crisis_response("IN")
    assert in_resp.crisis_detected is True
    assert any("iCall" in h.name or "Vandrevala" in h.name for h in in_resp.hotlines)

    us_resp = build_crisis_response("US")
    assert any("988" in h.number for h in us_resp.hotlines)

    fallback_resp = build_crisis_response("XYZ")
    assert len(fallback_resp.hotlines) > 0


@pytest.mark.asyncio
async def test_journal_crisis_bypass_db(client: AsyncClient, auth_user: dict):
    """
    Critical requirement: When crisis is detected, hotline is returned
    and ZERO entries are stored in the database.
    """
    crisis_payload = {
        "content": "I can't take this pain anymore, I want to end my life.",
    }
    res = await client.post(
        "/api/v1/journals/",
        json=crisis_payload,
        headers=auth_user["headers"],
    )
    assert res.status_code == 201
    data = res.json()
    assert data.get("crisis_detected") is True
    assert len(data.get("hotlines", [])) > 0

    # Verify nothing was added to journals list
    list_res = await client.get("/api/v1/journals/", headers=auth_user["headers"])
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 0
