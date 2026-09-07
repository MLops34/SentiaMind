"""
SentiaMind — SQLAlchemy ORM: Journal model

SECURITY: The `encrypted_content` column NEVER holds plaintext.
All text is AES-256-CBC encrypted before insertion.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Journal(Base):
    __tablename__ = "journals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # AES-256-CBC encrypted journal content (base64-encoded IV + ciphertext)
    encrypted_content: Mapped[str] = mapped_column(Text, nullable=False)

    # Approximate word count stored for UI display (no plaintext leak)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    # ── Relationships ─────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="journals")  # noqa: F821
    emotion_score: Mapped["EmotionScore"] = relationship(  # noqa: F821
        "EmotionScore", back_populates="journal", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Journal id={self.id} user_id={self.user_id} words={self.word_count}>"
