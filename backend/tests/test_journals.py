import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.journal import Journal


@pytest.mark.asyncio
async def test_create_journal_and_encrypt(
    client: AsyncClient,
    auth_user: dict,
    db_session: AsyncSession,
):
    plaintext = (
        "I had a really productive day in lab today! "
        "Completed all experimental trials and felt proud and happy."
    )
    payload = {"content": plaintext}

    res = await client.post(
        "/api/v1/journals/",
        json=payload,
        headers=auth_user["headers"],
    )
    assert res.status_code == 201
    data = res.json()
    assert "id" in data
    assert data["word_count"] > 10
    assert "emotion_scores" in data
    assert data["emotion_scores"]["dominant_emotion"] == "joy"

    journal_id = uuid.UUID(data["id"])

    # Verify Database at rest: plaintext is NEVER stored
    stmt = select(Journal).where(Journal.id == journal_id)
    raw_journal = (await db_session.execute(stmt)).scalar_one()
    assert plaintext not in raw_journal.encrypted_content
    assert raw_journal.encrypted_content != plaintext

    # Verify Authenticated Retrieval: plaintext is decrypted on the fly
    detail_res = await client.get(
        f"/api/v1/journals/{journal_id}",
        headers=auth_user["headers"],
    )
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["content"] == plaintext
    assert detail_data["emotion_scores"]["dominant_emotion"] == "joy"


@pytest.mark.asyncio
async def test_list_and_delete_journals(client: AsyncClient, auth_user: dict):
    # Create two journal entries
    await client.post(
        "/api/v1/journals/",
        json={"content": "Entry number one with enough words to pass validation."},
        headers=auth_user["headers"],
    )
    entry2_res = await client.post(
        "/api/v1/journals/",
        json={"content": "Entry number two with enough words to pass validation."},
        headers=auth_user["headers"],
    )
    entry2_id = entry2_res.json()["id"]

    list_res = await client.get("/api/v1/journals/", headers=auth_user["headers"])
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] == 2
    assert len(list_data["items"]) == 2

    # Delete entry2
    del_res = await client.delete(
        f"/api/v1/journals/{entry2_id}",
        headers=auth_user["headers"],
    )
    assert del_res.status_code == 200

    # Verify count is now 1
    list_res2 = await client.get("/api/v1/journals/", headers=auth_user["headers"])
    assert list_res2.json()["total"] == 1
