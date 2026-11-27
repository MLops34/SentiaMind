"""
SentiaMind — DistilBERT Emotion Classification Engine

Provides multi-class classification across 5 core emotional dimensions:
  1. Joy       - Positive affect & well-being
  2. Sadness   - Low affect & withdrawal indicators
  3. Anxiety   - Stress & worry signals
  4. Anger     - Frustration & hostility markers
  5. Fear      - Threat perception & avoidance behavior

Includes HuggingFace Transformers pipeline with automatic fallback to a
lexical heuristic classifier for zero-downtime offline execution.
"""
import os
import re
from typing import Dict

from app.config import get_settings
from app.schemas.journal import EmotionScores

settings = get_settings()

# Clinical and sentiment lexicon for zero-dependency / offline fallback
EMOTION_LEXICON: Dict[str, list[str]] = {
    "joy": [
        "happy", "joy", "excited", "grateful", "blessed", "wonderful", "great",
        "awesome", "content", "peaceful", "proud", "optimistic", "relief",
        "love", "laugh", "smiling", "fun", "celebrate", "succeeded", "good",
        "achieved", "calm", "confident", "hopeful", "delighted", "energized"
    ],
    "sadness": [
        "sad", "depressed", "unhappy", "lonely", "miserable", "crying", "tears",
        "hopeless", "down", "empty", "gloomy", "heartbroken", "isolated",
        "exhausted", "tired", "burned out", "worthless", "heavy", "grief",
        "miss", "lost", "regret", "failure", "disappointed", "helpless"
    ],
    "anxiety": [
        "anxious", "nervous", "stressed", "overwhelmed", "worry", "panicking",
        "pressure", "dread", "tense", "racing", "deadline", "exam", "restless",
        "shaking", "uneasy", "jittery", "can't sleep", "insomnia", "panic",
        "overthinking", "hesitant", "scared of failing", "stress"
    ],
    "anger": [
        "angry", "mad", "furious", "annoyed", "frustrated", "irritated",
        "hate", "unfair", "betrayed", "screaming", "rage", "bitter",
        "disgusted", "resentful", "hostile", "offended", "infuriating"
    ],
    "fear": [
        "afraid", "scared", "fear", "terrified", "threatened", "frightened",
        "alarmed", "spooked", "intimidated", "vulnerable", "horrified",
        "danger", "unsafe", "trembling"
    ],
}


class EmotionClassifier:
    """Emotion classification engine with model pipeline and fallback."""

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        self._is_initialized = False

    def _init_model(self):
        """Attempt to load DistilBERT / HuggingFace model if present."""
        if self._is_initialized:
            return

        model_path = settings.huggingface_model_path
        if os.path.exists(model_path):
            try:
                from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
                self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
                self.pipeline = pipeline(
                    "text-classification",
                    model=self.model,
                    tokenizer=self.tokenizer,
                    return_all_scores=True
                )
            except Exception as e:
                # Log error and continue with lexical fallback
                self.pipeline = None
        self._is_initialized = True

    def _lexical_predict(self, text: str) -> EmotionScores:
        """
        Deterministic, rule-weighted lexical inference fallback.
        Calculates normalized probability distribution across 5 dimensions.
        """
        normalized_text = text.lower()
        words = re.findall(r"\b[a-z']+\b", normalized_text)
        text_full = " " + " ".join(words) + " "

        scores = {emotion: 0.1 for emotion in ["joy", "sadness", "anxiety", "anger", "fear"]}

        for emotion, keywords in EMOTION_LEXICON.items():
            for kw in keywords:
                # Count keyword matches with boundary check
                count = text_full.count(f" {kw} ")
                if count > 0:
                    scores[emotion] += count * 1.5

        # Normalize with softmax-like scaling
        total = sum(scores.values())
        normalized_scores = {k: round(v / total, 4) for k, v in scores.items()}

        dominant = max(normalized_scores, key=normalized_scores.get)
        confidence = float(normalized_scores[dominant])

        return EmotionScores(
            joy=normalized_scores["joy"],
            sadness=normalized_scores["sadness"],
            anxiety=normalized_scores["anxiety"],
            anger=normalized_scores["anger"],
            fear=normalized_scores["fear"],
            dominant_emotion=dominant,
            model_confidence=confidence,
        )

    def predict(self, text: str) -> EmotionScores:
        """
        Classify raw text into 5 emotion dimensions.
        """
        self._init_model()

        if self.pipeline is not None:
            try:
                # Run HuggingFace pipeline
                results = self.pipeline(text[:512])[0]
                raw_dict = {r["label"].lower(): float(r["score"]) for r in results}

                # Map model outputs to our 5 target emotions
                joy = raw_dict.get("joy", raw_dict.get("happy", 0.05))
                sadness = raw_dict.get("sadness", raw_dict.get("sad", 0.05))
                anxiety = raw_dict.get("anxiety", raw_dict.get("stress", 0.05))
                anger = raw_dict.get("anger", 0.05)
                fear = raw_dict.get("fear", 0.05)

                total = joy + sadness + anxiety + anger + fear
                if total > 0:
                    joy, sadness, anxiety, anger, fear = (
                        round(joy / total, 4),
                        round(sadness / total, 4),
                        round(anxiety / total, 4),
                        round(anger / total, 4),
                        round(fear / total, 4),
                    )

                scores_map = {
                    "joy": joy,
                    "sadness": sadness,
                    "anxiety": anxiety,
                    "anger": anger,
                    "fear": fear,
                }
                dominant = max(scores_map, key=scores_map.get)
                confidence = float(scores_map[dominant])

                return EmotionScores(
                    joy=joy,
                    sadness=sadness,
                    anxiety=anxiety,
                    anger=anger,
                    fear=fear,
                    dominant_emotion=dominant,
                    model_confidence=confidence,
                )
            except Exception:
                # Fallback on any runtime error during pipeline inference
                pass

        return self._lexical_predict(text)


# Global singleton instance
emotion_classifier = EmotionClassifier()
