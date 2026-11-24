"""
SentiaMind — Model Downloader Script
Downloads fine-tuned DistilBERT/RoBERTa model weights into local directory.
"""
import os
import sys
from pathlib import Path


def download_model(
    model_name: str = "j-hartmann/emotion-english-distilroberta-base",
    target_dir: str = "./models/distilbert-emotion",
):
    print(f"--> Downloading model weights: {model_name}")
    print(f"--> Target destination: {target_dir}")

    target_path = Path(target_dir)
    target_path.mkdir(parents=True, exist_ok=True)

    try:
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name)

        tokenizer.save_pretrained(target_dir)
        model.save_pretrained(target_dir)

        print(f"--> Model successfully downloaded and saved to {target_dir}")
    except Exception as e:
        print(f"Error downloading model: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    download_model()
