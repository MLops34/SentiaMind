"""
SentiaMind — Journals API Endpoints
"""
import uuid
from typing import Any, Union

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.crisis import build_crisis_response, scan_crisis
from app.core.dependencies import get_current_active_user
from app.core.security import decrypt_journal, encrypt_journal
from app.database import get_db
from app.ml.classifier import emotion_classifier
from app.models.emotion_score import EmotionScore
from app.models.journal import Journal
from app.models.user import User
from app.schemas.journal import (
    CrisisResponse,
    EmotionScores,
    JournalCreateRequest,
    JournalCreateResponse,
    JournalDetailResponse,
    JournalListItem,
    JournalListResponse,
)

router = APIRouter(prefix="/journals", tags=["Journals"])


@router.post(
    "/",
    response_model=Union[JournalCreateResponse, CrisisResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create and analyze a new journal entry",
)
async def create_journal(
    request: JournalCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Submit journal entry:
      1. Deterministic Crisis Safeguard lexical scan.
         If crisis detected, immediately return hotlines without saving.
      2. AES-256-CBC encryption using user's unique salt.
      3. DistilBERT emotion classification.
      4. Persist encrypted journal + emotion scores.
    """
    # ── Stage 1: Deterministic Crisis Safeguard Scan ────────────────
    crisis_scan = scan_crisis(request.content)
    if crisis_scan.triggered:
        crisis_resp = build_crisis_response(current_user.country_code)
        return crisis_resp

    # ── Stage 2: AES-256-CBC Encryption ─────────────────────────────
    words = len(request.content.strip().split())
    encrypted_blob = encrypt_journal(request.content, current_user.encryption_salt)

    journal = Journal(
        user_id=current_user.id,
        encrypted_content=encrypted_blob,
        word_count=words,
    )
    db.add(journal)
    await db.flush()

    # ── Stage 3: ML Emotion Classification ──────────────────────────
    scores = emotion_classifier.predict(request.content)

    emotion_score_record = EmotionScore(
        journal_id=journal.id,
        user_id=current_user.id,
        joy=scores.joy,
        sadness=scores.sadness,
        anxiety=scores.anxiety,
        anger=scores.anger,
        fear=scores.fear,
        dominant_emotion=scores.dominant_emotion,
        model_confidence=scores.model_confidence,
    )
    db.add(emotion_score_record)
    await db.flush()
    await db.refresh(journal)

    return JournalCreateResponse(
        id=journal.id,
        word_count=journal.word_count,
        created_at=journal.created_at,
        emotion_scores=scores,
    )


@router.get(
    "/",
    response_model=JournalListResponse,
    summary="List journals for current user with pagination",
)
async def list_journals(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Get paginated list of user's journal entries."""
    count_stmt = select(func.count()).select_from(Journal).where(Journal.user_id == current_user.id)
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = (
        select(Journal)
        .options(selectinload(Journal.emotion_score))
        .where(Journal.user_id == current_user.id)
        .order_by(Journal.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    results = (await db.execute(stmt)).scalars().all()

    items = [
        JournalListItem(
            id=j.id,
            word_count=j.word_count,
            created_at=j.created_at,
            dominant_emotion=j.emotion_score.dominant_emotion if j.emotion_score else None,
        )
        for j in results
    ]

    has_next = (skip + limit) < total
    page = (skip // limit) + 1 if limit > 0 else 1

    return JournalListResponse(
        items=items,
        total=total,
        page=page,
        page_size=limit,
        has_next=has_next,
    )


@router.get(
    "/{journal_id}",
    response_model=JournalDetailResponse,
    summary="Get and decrypt specific journal entry",
)
async def get_journal(
    journal_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve journal by ID and decrypt on the fly."""
    stmt = (
        select(Journal)
        .options(selectinload(Journal.emotion_score))
        .where(Journal.id == journal_id, Journal.user_id == current_user.id)
    )
    journal = (await db.execute(stmt)).scalar_one_or_none()

    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found.",
        )

    # Decrypt content using user's salt
    decrypted_content = decrypt_journal(journal.encrypted_content, current_user.encryption_salt)

    scores = None
    if journal.emotion_score:
        scores = EmotionScores.model_validate(journal.emotion_score)

    return JournalDetailResponse(
        id=journal.id,
        content=decrypted_content,
        word_count=journal.word_count,
        created_at=journal.created_at,
        emotion_scores=scores,
    )


@router.delete(
    "/{journal_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a journal entry",
)
async def delete_journal(
    journal_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete a journal entry owned by current user."""
    stmt = select(Journal).where(Journal.id == journal_id, Journal.user_id == current_user.id)
    journal = (await db.execute(stmt)).scalar_one_or_none()

    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found.",
        )

    await db.delete(journal)
    await db.flush()
    return {"status": "deleted", "id": str(journal_id)}
