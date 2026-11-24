"""
SentiaMind — Core Security Module

Responsibilities:
  1. JWT access & refresh token creation / verification
  2. Password hashing (bcrypt via passlib)
  3. AES-256-CBC encryption/decryption for journal content
  4. Per-user key derivation (HKDF using master key + user-specific salt)
"""
import hashlib
import hmac
import os
from base64 import b64decode, b64encode
from datetime import UTC, datetime, timedelta

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from jose import JWTError, jwt
import bcrypt
from app.config import get_settings

settings = get_settings()

# ── Password hashing ──────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Return bcrypt hash of a plaintext password."""
    pwd_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if plain matches the stored bcrypt hash."""
    pwd_bytes = plain.encode("utf-8")[:72]
    try:
        return bcrypt.checkpw(pwd_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


# ── JWT ───────────────────────────────────────────────────────────

def create_access_token(subject: str, extra: dict | None = None) -> str:
    """
    Create a short-lived JWT access token.
    `subject` is typically the user's UUID as a string.
    """
    expire = datetime.now(UTC) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(UTC),
        "type": "access",
        **(extra or {}),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> str:
    """
    Create a long-lived JWT refresh token.
    Stored hash in DB; the raw token is returned to the client only once.
    """
    expire = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    payload = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(UTC),
        "type": "refresh",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT. Raises JWTError on invalid/expired tokens.
    Callers should catch JWTError and translate to HTTP 401.
    """
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        raise


def hash_token(raw_token: str) -> str:
    """SHA-256 hash a raw token for safe DB storage (refresh tokens)."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


# ── AES-256-CBC Encryption ────────────────────────────────────────

def _derive_user_key(master_key: bytes, salt_hex: str) -> bytes:
    """
    Derive a 32-byte user-specific AES key from the master key and
    the user's unique salt using HMAC-SHA256 (simple HKDF-like KDF).
    """
    salt = bytes.fromhex(salt_hex)
    return hmac.new(master_key, salt, hashlib.sha256).digest()


def generate_user_salt() -> str:
    """Generate a random 32-byte hex salt for a new user."""
    return os.urandom(32).hex()


def encrypt_journal(plaintext: str, user_salt: str) -> str:
    """
    Encrypt a journal entry with AES-256-CBC.

    Returns: base64-encoded string of (IV || ciphertext)
    The IV is 16 random bytes prepended to the ciphertext.
    """
    key = _derive_user_key(settings.master_key_bytes, user_salt)
    iv = os.urandom(AES.block_size)  # 16 bytes
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ciphertext = cipher.encrypt(pad(plaintext.encode("utf-8"), AES.block_size))
    # Store as base64(iv + ciphertext)
    return b64encode(iv + ciphertext).decode("utf-8")


def decrypt_journal(encrypted_b64: str, user_salt: str) -> str:
    """
    Decrypt a journal entry that was encrypted with `encrypt_journal`.

    Raises ValueError if decryption fails (wrong key / corrupted data).
    """
    key = _derive_user_key(settings.master_key_bytes, user_salt)
    raw = b64decode(encrypted_b64.encode("utf-8"))
    iv = raw[: AES.block_size]
    ciphertext = raw[AES.block_size :]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    try:
        plaintext = unpad(cipher.decrypt(ciphertext), AES.block_size)
        return plaintext.decode("utf-8")
    except (ValueError, KeyError) as exc:
        raise ValueError("Decryption failed — data may be corrupted.") from exc
