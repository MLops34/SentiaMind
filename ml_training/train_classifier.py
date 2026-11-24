"""
SentiaMind — DistilBERT Emotion Classifier Fine-Tuning Pipeline
Fine-tunes DistilBERT on multi-class mental health emotion datasets.
"""
import os
import argparse
import numpy as np
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
)
from sklearn.metrics import accuracy_score, f1_score


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    acc = accuracy_score(labels, preds)
    f1 = f1_score(labels, preds, average="weighted")
    return {"accuracy": acc, "f1": f1}


def train(
    base_model: str = "distilbert-base-uncased",
    output_dir: str = "../backend/models/distilbert-emotion",
    epochs: int = 3,
    batch_size: int = 16,
    lr: float = 2e-5,
):
    print(f"Loading base model: {base_model}...")
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    model = AutoModelForSequenceClassification.from_pretrained(
        base_model,
        num_labels=5,
        id2label={0: "joy", 1: "sadness", 2: "anxiety", 3: "anger", 4: "fear"},
        label2id={"joy": 0, "sadness": 1, "anxiety": 2, "anger": 3, "fear": 4},
    )

    print("Loading emotion dataset (mental health corpora / emotion)...")
    dataset = load_dataset("dair-ai/emotion", "split")

    def tokenize_fn(examples):
        return tokenizer(examples["text"], truncation=True, max_length=256)

    tokenized_dataset = dataset.map(tokenize_fn, batched=True)
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

    training_args = TrainingArguments(
        output_dir=output_dir,
        learning_rate=lr,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        num_train_epochs=epochs,
        weight_decay=0.01,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        logging_dir="./logs",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["validation"],
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    print("Starting training...")
    trainer.train()

    print(f"Saving fine-tuned model to {output_dir}...")
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print("Training complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fine-tune DistilBERT Emotion Classifier")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--output_dir", type=str, default="../backend/models/distilbert-emotion")
    args = parser.parse_args()
    train(epochs=args.epochs, batch_size=args.batch_size, output_dir=args.output_dir)
