"""
SentiaMind — Smart Crisis Safeguard Engine

DESIGN PRINCIPLES:
  - 100% deterministic. No AI/ML inference is involved here.
  - Runs BEFORE any other processing on every journal submission.
  - Fails safe: triggers on ambiguity, never suppresses a warning.
  - No journal content is stored to the database when a crisis is detected.
  - Hotlines are statically bundled (no external API dependency).

The lexicon is curated from clinical self-harm terminology, common
colloquialisms, and phrases flagged in mental health NLP research literature.
"""
from dataclasses import dataclass, field

from app.schemas.journal import CrisisResponse, HotlineInfo

# ── Crisis Lexicon ────────────────────────────────────────────────
# Curated set of high-signal phrases and terms.
# Deliberately conservative — false positives are acceptable; false negatives are not.
_CRISIS_LEXICON: frozenset[str] = frozenset(
    [
        # Self-harm intent
        "kill myself", "end my life", "take my life", "end it all",
        "want to die", "want to be dead", "better off dead",
        "wish i was dead", "wish i were dead", "don't want to live",
        "don't want to be alive", "no reason to live", "nothing to live for",
        "ready to die", "life is not worth living", "life isn't worth living",

        # Suicidal ideation — direct
        "suicide", "suicidal", "commit suicide", "attempting suicide",
        "planning to suicide", "thinking about suicide", "thoughts of suicide",
        "suicidal thoughts", "suicidal ideation",

        # Method references (intentionally broad)
        "overdose on", "slit my wrist", "hang myself", "jump off",
        "in front of a train", "shoot myself", "poison myself",

        # Self-harm (non-suicidal)
        "cutting myself", "hurt myself", "self harm", "self-harm",
        "self injury", "self-injury", "burn myself", "hurting myself",

        # Hopelessness / goodbye signals
        "goodbye forever", "final goodbye", "no one will miss me",
        "nobody would care", "nobody cares if i die", "world is better without me",
        "everyone is better off without me",

        # Crisis states
        "in crisis", "mental breakdown", "cannot go on",
        "can't go on anymore", "can't take it anymore", "give up on life",
        "giving up on life",

        # Specific Indian/regional clinical signals
        "jeene ka mann nahi",  # Hindi: don't want to live
        "zindagi khatam",      # Hindi: end life
    ]
)

# ── Regional Hotlines ─────────────────────────────────────────────
_HOTLINES: dict[str, list[dict]] = {
    "IN": [
        {"name": "iCall (India)", "number": "9152987821", "available": "Mon–Sat 8am–10pm"},
        {"name": "Vandrevala Foundation", "number": "1860-2662-345", "available": "24/7"},
        {"name": "Snehi", "number": "044-24640050", "available": "24/7"},
    ],
    "US": [
        {"name": "988 Suicide & Crisis Lifeline", "number": "988", "available": "24/7"},
        {"name": "Crisis Text Line", "number": "Text HOME to 741741", "available": "24/7"},
    ],
    "GB": [
        {"name": "Samaritans UK", "number": "116 123", "available": "24/7"},
        {"name": "PAPYRUS HOPElineUK", "number": "0800 068 4141", "available": "24/7"},
    ],
    "AU": [
        {"name": "Lifeline Australia", "number": "13 11 14", "available": "24/7"},
        {"name": "Beyond Blue", "number": "1300 22 4636", "available": "24/7"},
    ],
    # International fallback
    "_DEFAULT": [
        {"name": "International Association for Suicide Prevention",
         "number": "https://www.iasp.info/resources/Crisis_Centres/", "available": "24/7"},
        {"name": "WHO Mental Health Resources",
         "number": "https://www.who.int/health-topics/mental-health", "available": "24/7"},
    ],
}


@dataclass
class CrisisScanResult:
    triggered: bool
    matched_terms: list[str] = field(default_factory=list)


def scan_crisis(text: str) -> CrisisScanResult:
    """
    Deterministically scan text for crisis signals.

    Algorithm:
      - Normalize to lowercase
      - Check for any phrase in the CRISIS_LEXICON as a substring match
      - Returns all matched terms (for internal logging only — never sent to client)

    Time complexity: O(L * K) where L = text length, K = lexicon size.
    For typical journal lengths (<10k chars) this is imperceptible.
    """
    normalized = text.lower().strip()
    matched = [phrase for phrase in _CRISIS_LEXICON if phrase in normalized]
    return CrisisScanResult(triggered=bool(matched), matched_terms=matched)


def build_crisis_response(country_code: str = "IN") -> CrisisResponse:
    """
    Build the crisis response payload.
    Selects region-appropriate hotlines; falls back to international resources.
    """
    hotline_data = _HOTLINES.get(country_code.upper(), _HOTLINES["_DEFAULT"])
    hotlines = [HotlineInfo(**h) for h in hotline_data]

    return CrisisResponse(
        crisis_detected=True,
        message=(
            "We noticed something in your entry that concerns us. "
            "You are not alone, and help is available right now. "
            "Please reach out to one of these resources:"
        ),
        hotlines=hotlines,
    )
