"""
SentiaMind — LSTM Stress Time-Series Forecaster Training Script
Trains a PyTorch LSTM model on longitudinal emotional trajectories.
"""
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np


class LSTMForecaster(nn.Module):
    """LSTM Time-Series neural network for multi-step stress prediction."""

    def __init__(self, input_dim: int = 5, hidden_dim: int = 64, num_layers: int = 2, output_dim: int = 7):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2,
        )
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, output_dim),
            nn.Sigmoid(),
        )

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        # Take the output of the last sequence step
        last_step = lstm_out[:, -1, :]
        return self.fc(last_step)


def generate_synthetic_stress_data(num_samples: int = 1000, seq_length: int = 14):
    """Generate synthetic sequential emotional trajectories for stress pre-training."""
    # 5 features: [joy, sadness, anxiety, anger, fear]
    X = np.random.dirichlet(np.ones(5), size=(num_samples, seq_length)).astype(np.float32)
    # Output: 7 days of predicted stress probability [0, 1]
    y = np.clip(
        np.mean(X[:, -3:, 2], axis=1, keepdims=True) * 1.5 + np.random.normal(0, 0.05, (num_samples, 7)),
        0.0,
        1.0,
    ).astype(np.float32)
    return torch.tensor(X), torch.tensor(y)


def train():
    print("Preparing LSTM stress forecaster training...")
    X, y = generate_synthetic_stress_data()
    dataset = TensorDataset(X, y)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

    model = LSTMForecaster()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

    print("Training LSTM model...")
    model.train()
    for epoch in range(10):
        total_loss = 0.0
        for batch_x, batch_y in dataloader:
            optimizer.zero_grad()
            pred = model(batch_x)
            loss = criterion(pred, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1}/10 - Loss: {avg_loss:.4f}")

    torch.save(model.state_dict(), "forecaster_weights.pt")
    print("Forecaster weights successfully saved to forecaster_weights.pt")


if __name__ == "__main__":
    train()
