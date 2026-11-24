"""
SentiaMind — SQLAlchemy ORM: EmotionScore and RefreshToken models
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class EmotionScore(Base):
    """
    Stores the output of the DistilBERT emotion classifier for each journal entry.
    All scores are confidence values in [0.0, 1.0] summing to ~1.0.
    """
    __tablename__ = "emotion_scores"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    journal_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("journals.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Emotion dimensions ────────────────────────────────────────
    joy: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    sadness: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    anxiety: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    anger: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    fear: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    # Primary emotion label (argmax of scores)
    dominant_emotion: Mapped[str] = mapped_column(String(20), nullable=False)
    model_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    scored_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    # ── Relationships ─────────────────────────────────────────────
    journal: Mapped["Journal"] = relationship(  # noqa: F821
        "Journal", back_populates="emotion_score"
    )
    user: Mapped["User"] = relationship("User", back_populates="emotion_scores")  # noqa: F821

    def __repr__(self) -> str:
        return (
            f"<EmotionScore journal={self.journal_id} dominant={self.dominant_emotion} "
            f"confidence={self.model_confidence:.2f}>"
        )


class RefreshToken(Base):
    """Stored refresh tokens for rotation-based JWT auth."""
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # SHA-256 hash of the raw token (never store raw token)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ─────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")  # noqa: F821
