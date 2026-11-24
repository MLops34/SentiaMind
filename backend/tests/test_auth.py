"""
SentiaMind — Authentication Endpoint Tests
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    payload = {
        "email": "jane@campus.edu",
        "password": "Password123!",
        "full_name": "Jane Doe",
        "country_code": "US",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["full_name"] == payload["full_name"]
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, auth_user: dict):
    payload = {
        "email": auth_user["email"],
        "password": "Password123!",
        "full_name": "Duplicate User",
        "country_code": "IN",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    payload = {
        "email": "weak@campus.edu",
        "password": "simple",  # too short, no uppercase, no digit
        "full_name": "Weak User",
        "country_code": "IN",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success_and_profile(client: AsyncClient, auth_user: dict):
    # Test getting current user profile with token
    me_res = await client.get("/api/v1/auth/me", headers=auth_user["headers"])
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile["email"] == auth_user["email"]
    assert profile["is_active"] is True


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, auth_user: dict):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": auth_user["email"], "password": "WrongPassword123!"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_profile(client: AsyncClient, auth_user: dict):
    update_payload = {
        "full_name": "Updated Name",
        "country_code": "GB",
        "counselor_consent": True,
    }
    res = await client.put(
        "/api/v1/auth/me",
        json=update_payload,
        headers=auth_user["headers"],
    )
    assert res.status_code == 200
    data = res.json()
    assert data["full_name"] == "Updated Name"
    assert data["country_code"] == "GB"
    assert data["counselor_consent"] is True
