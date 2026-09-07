<div align="center">

<img src="https://img.shields.io/badge/SentiaMind-Mental%20Health%20AI%20Platform-6C63FF?style=for-the-badge&logo=brain&logoColor=white" alt="SentiaMind Banner"/>

# 🧠 SentiaMind
### *Intelligent Mental Health Monitoring — Powered by NLP & Deep Learning*

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![DistilBERT](https://img.shields.io/badge/DistilBERT-Fine--Tuned-FF6B6B?style=flat-square&logo=huggingface&logoColor=white)](https://huggingface.co/distilbert-base-uncased)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-yellow?style=flat-square)]()

> **A secure, full-stack platform that bridges daily emotional journaling with predictive mental health insights — purpose-built for university wellness programs.**

</div>

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [What is SentiaMind?](#-what-is-sentiamind)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [AI/ML Pipeline](#-aiml-pipeline)
- [Security Design](#-security-design)
- [Crisis Safeguard System](#-crisis-safeguard-system)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [University Deployment Guide](#-university-deployment-guide)
- [Ethical Considerations](#-ethical-considerations)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ❗ The Problem

Traditional mental health tracking tools ask users to pick a smiley face. That's it.

This binary, context-free approach fails to capture the nuance of human emotion:

| Traditional Approach | SentiaMind Approach |
|---|---|
| Manual mood selection (1–5 scale) | Free-form text & voice journaling |
| No contextual data | Full emotional context via NLP |
| Static, historical logs | Predictive forecasting (LSTM) |
| Reactive care only | Proactive stress-period alerts |
| No crisis detection | Deterministic Smart Crisis Safeguard |

> University students face one of the highest rates of anxiety and depression globally, yet most campus wellness tools remain primitive. SentiaMind was built to fix that.

---

## 🌟 What is SentiaMind?

**SentiaMind** is a secure, full-stack mental health platform that allows users to log their inner world through natural language — text or voice — and receive intelligent, data-driven emotional insights. It uses:

- A **fine-tuned DistilBERT Transformer** to classify emotions from raw journal entries
- An **LSTM Time-Series Engine** to learn behavioral patterns over time and forecast high-stress periods
- **AES-256 encryption** to ensure all journal data remains private and protected
- A **deterministic Smart Crisis Safeguard** that bypasses AI inference entirely when self-harm markers are detected — connecting users immediately to human emergency resources

---

## ✨ Key Features

### 🗣️ Natural Language Journaling
- Text-based journaling with no structured forms
- Voice-to-text transcription support
- Unstructured input → quantitative emotional metrics

### 🤖 Emotion Classification (DistilBERT)
- Multi-class classification across **5 core emotional dimensions**:
  - 😄 **Joy** — Positive affect & well-being
  - 😢 **Sadness** — Low affect & withdrawal indicators
  - 😰 **Anxiety** — Stress & worry signals
  - 😠 **Anger** — Frustration & hostility markers
  - 😨 **Fear** — Threat perception & avoidance behavior
- Fine-tuned on curated mental health corpora
- Inference latency optimized for real-time feedback

### 📈 Predictive Stress Forecasting (LSTM)
- Time-series analysis of emotional trajectories
- Identifies cyclical behavioral patterns (academic stress, exam periods)
- Generates **advance warnings** before high-stress periods manifest
- Personalized baseline modeling per user

### 🔐 Privacy-First Security
- **AES-256** encryption for all stored journal entries
- JWT-based authentication with refresh token rotation
- Zero plaintext storage of sensitive data
- GDPR/FERPA-conscious data architecture

### 🚨 Smart Crisis Safeguard
- Real-time lexical scan for self-harm and crisis markers
- **100% deterministic** — no AI inference involved in crisis detection
- Immediately surfaces verified emergency hotlines and campus resources
- Designed to fail safe: triggers on ambiguity, never suppresses a warning

### 📊 Emotional Analytics Dashboard
- Interactive mood trend visualizations
- Weekly and monthly emotional summaries
- Pattern overlays (e.g., stress spikes on Mondays)
- Downloadable reports for counselors (with user consent)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                    React 18 + TypeScript                        │
│         (Journal UI · Dashboard · Voice Input · Alerts)         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / REST
┌───────────────────────────▼─────────────────────────────────────┐
│                        API GATEWAY                              │
│                   FastAPI (Python 3.10+)                        │
│          (Auth · Journal Endpoints · Analytics Routes)          │
└──────┬──────────────────────────────────────┬───────────────────┘
       │                                      │
┌──────▼──────────┐                 ┌─────────▼──────────────────┐
│  CRISIS ENGINE  │                 │      AI/ML PIPELINE        │
│  (Deterministic)│                 │                            │
│                 │                 │  ┌──────────────────────┐  │
│  Lexical Scan   │                 │  │  DistilBERT (Fine-   │  │
│  → Hotline UI   │                 │  │  Tuned) Classifier   │  │
│                 │                 │  │  → Emotion Scores    │  │
└──────┬──────────┘                 │  └──────────┬───────────┘  │
       │                            │             │              │
       │                            │  ┌──────────▼───────────┐  │
       │                            │  │   LSTM Time-Series   │  │
       │                            │  │   Forecasting Engine │  │
       │                            │  │   → Stress Alerts    │  │
       │                            │  └──────────────────────┘  │
       │                            └────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│          PostgreSQL (Encrypted at rest, AES-256)                │
│          Redis (Session cache) · S3-compatible (Voice)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
| Layer | Technology | Purpose |
|---|---|---|
| API Framework | **FastAPI** | Async REST API, OpenAPI docs |
| Language | **Python 3.10+** | Core backend logic |
| ML Framework | **PyTorch + HuggingFace** | DistilBERT inference |
| Deep Learning | **TensorFlow / Keras** | LSTM time-series model |
| Database | **PostgreSQL** | Persistent encrypted storage |
| Cache | **Redis** | Session & rate-limit store |
| Auth | **JWT + OAuth2** | Secure token-based auth |
| Encryption | **PyCryptodome (AES-256)** | Journal entry encryption |

### Frontend
| Layer | Technology | Purpose |
|---|---|---|
| UI Framework | **React 18** | Component-based SPA |
| Language | **TypeScript** | Type-safe development |
| State | **Zustand / React Query** | Client-side state & caching |
| Charts | **Recharts / D3.js** | Emotional analytics visuals |
| Voice | **Web Speech API** | Browser-native voice input |
| Styling | **Tailwind CSS** | Utility-first design system |

### DevOps & Infrastructure
| Tool | Purpose |
|---|---|
| **Docker + Docker Compose** | Containerized local development |
| **GitHub Actions** | CI/CD pipelines |
| **Nginx** | Reverse proxy & SSL termination |
| **Prometheus + Grafana** | System observability |

---

## 🤖 AI/ML Pipeline

### Stage 1: Emotion Classification (DistilBERT)

```
Raw Journal Entry (Text / Voice Transcript)
           │
           ▼
   Text Preprocessing
   (tokenization, cleaning)
           │
           ▼
  DistilBERT Fine-Tuned
  (6-layer Transformer)
           │
           ▼
  Softmax Output Layer
  [Joy, Sadness, Anxiety, Anger, Fear]
           │
           ▼
  Confidence Scores + Primary Emotion Label
```

**Training Details:**
- **Base Model:** `distilbert-base-uncased`
- **Dataset:** GoEmotions + curated mental health Reddit corpus
- **Fine-tuning:** 5-class head, cross-entropy loss
- **Performance Target:** F1 ≥ 0.82 across all emotion classes

### Stage 2: Temporal Forecasting (LSTM)

```
N-day Emotion Score History (Time Series)
           │
           ▼
   Feature Engineering
   (rolling averages, weekday encoding)
           │
           ▼
   Stacked LSTM Network
   (2 layers, 128 hidden units)
           │
           ▼
   7-Day Emotion Trajectory Forecast
   + Stress-Period Probability Score
```

**Architecture Details:**
- **Input Window:** 30-day rolling emotion vectors
- **Output:** 7-day ahead prediction per emotion dimension
- **Alert Threshold:** Configurable per institution (default: Anxiety score ≥ 0.75)

---

## 🔐 Security Design

SentiaMind was built with a **privacy-by-design** philosophy:

```
User Submits Journal
       │
       ▼
 Crisis Safeguard Scan  ──► CRISIS DETECTED ──► Hotline UI (no data stored)
       │ (no crisis)
       ▼
  AES-256 Encryption
  (unique key per user)
       │
       ▼
  Encrypted Blob → PostgreSQL
  (plaintext NEVER persisted)
       │
       ▼
  Decryption only on
  authenticated read request
```

| Security Control | Implementation |
|---|---|
| Data at Rest | AES-256-CBC per-user encryption keys |
| Data in Transit | TLS 1.3 enforced |
| Authentication | JWT access (15 min) + Refresh (7 days) |
| Key Management | Secrets stored in environment / Vault |
| Rate Limiting | Redis-backed per-IP and per-user |
| Input Sanitization | Pydantic validation on all endpoints |
| Audit Logging | All access events timestamped |

---

## 🚨 Crisis Safeguard System

> **This is the most critical system in SentiaMind. It is intentionally kept simple.**

The Crisis Safeguard is **not AI-powered**. It is a **deterministic, rule-based lexical scanner** that runs *before* any ML inference:

```python
# Conceptual logic — simplified
CRISIS_KEYWORDS = load_curated_crisis_lexicon()  # Clinical + colloquial terms

def check_crisis(text: str) -> bool:
    normalized = text.lower().strip()
    return any(keyword in normalized for keyword in CRISIS_KEYWORDS)

if check_crisis(journal_entry):
    # BYPASS all AI models
    # Log anonymized trigger event
    # Return emergency resources immediately
    return CrisisResponse(
        resources=get_local_hotlines(user.country),
        message="You're not alone. Please reach out."
    )
```

**Design Principles:**
- ✅ **No AI** in the critical path — deterministic outcomes only
- ✅ Fails **safe** — triggers on ambiguity, never suppresses
- ✅ No sensitive data is stored when a crisis trigger fires
- ✅ Hotlines verified and regionally appropriate
- ✅ Designed in consultation with mental health professionals

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/sentiamind.git
cd sentiamind
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your database credentials, JWT secret, and encryption keys
```

```env
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/sentiamind
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-256-bit-secret
ENCRYPTION_KEY=your-aes-256-key
HUGGINGFACE_MODEL_PATH=./models/distilbert-emotion
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Download fine-tuned models
python scripts/download_models.py

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

### 5. Docker (Recommended for Full Stack)

```bash
docker-compose up --build
# API:      http://localhost:8000
# Frontend: http://localhost:3000
# Docs:     http://localhost:8000/docs
```

---

## 📁 Project Structure

```
sentiamind/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI route handlers
│   │   │   ├── auth.py
│   │   │   ├── journals.py
│   │   │   └── analytics.py
│   │   ├── core/
│   │   │   ├── security.py   # AES-256 encryption, JWT
│   │   │   └── crisis.py     # Crisis Safeguard engine
│   │   ├── ml/
│   │   │   ├── classifier.py # DistilBERT inference
│   │   │   └── forecaster.py # LSTM time-series model
│   │   ├── models/           # SQLAlchemy ORM models
│   │   └── main.py
│   ├── models/               # Saved ML model weights
│   ├── alembic/              # DB migrations
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Journal.tsx
│   │   │   └── Analytics.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # Zustand state slices
│   │   └── api/              # API client layer
│   └── package.json
│
├── ml_training/
│   ├── train_classifier.py   # DistilBERT fine-tuning script
│   ├── train_forecaster.py   # LSTM training script
│   └── datasets/             # Training data (gitignored)
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🎓 University Deployment Guide

SentiaMind is specifically designed to integrate with university wellness ecosystems.

### Why Universities?

| Challenge | SentiaMind Solution |
|---|---|
| High student anxiety rates during exam season | LSTM predicts stress spikes before they peak |
| Counselor bandwidth limitations | Automated dashboards surface at-risk users (with consent) |
| Stigma around seeking help | Private, AI-first journaling lowers the barrier to entry |
| Reactive-only wellness programs | Proactive forecasting enables preventive outreach |
| FERPA compliance requirements | Per-user AES-256 encryption, no third-party data sharing |

### Institutional Integration Features

- **SSO Support:** OAuth2 integration with university identity providers (Azure AD, Shibboleth)
- **Counselor Dashboard:** Opt-in consent flow allowing anonymized aggregate reports
- **Custom Crisis Resources:** Institution-specific hotlines and walk-in center information
- **Configurable Thresholds:** Adjust LSTM alert sensitivity per institution policy
- **Bulk Deployment:** Docker Compose / Kubernetes manifests for campus IT teams

### Recommended Deployment Architecture (University)

```
                    University Campus
┌───────────────────────────────────────────────┐
│  University SSO (Azure AD / Shibboleth)        │
│             │                                  │
│  ┌──────────▼──────────────────────────────┐  │
│  │        SentiaMind Platform               │  │
│  │  (Self-hosted on university servers)     │  │
│  │  - No data leaves campus network         │  │
│  │  - Counselor dashboard (opt-in)          │  │
│  └──────────────────────────────────────────┘  │
│             │                                  │
│  ┌──────────▼──────────────────────────────┐  │
│  │     Campus Wellness Team Portal          │  │
│  │  (Aggregate insights · Alert management) │  │
│  └──────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

## ⚖️ Ethical Considerations

Building AI tools for mental health requires extra care. SentiaMind adheres to the following principles:

| Principle | Implementation |
|---|---|
| **Transparency** | Users always know AI is analyzing their text; no hidden inference |
| **Human Override** | AI is advisory only; crisis response is always human-directed |
| **Data Minimization** | Only data necessary for features is collected and stored |
| **Consent First** | Counselor data sharing requires explicit, revocable user consent |
| **No Diagnosis** | SentiaMind tracks emotional patterns — it does not diagnose conditions |
| **Fail Safe** | All ambiguous crisis signals trigger the human safeguard |
| **Accessibility** | Voice input and plain-language UI for all literacy levels |

> ⚠️ **Disclaimer:** SentiaMind is a wellness support tool. It is **not a clinical diagnostic system** and is not a substitute for professional mental health care. If you or someone you know is in crisis, please contact a licensed mental health professional immediately.

---

## 🗺️ Roadmap

- [x] Core journal entry + DistilBERT classification
- [x] AES-256 journal encryption
- [x] Deterministic Crisis Safeguard
- [x] FastAPI backend with JWT auth
- [x] React frontend with analytics dashboard
- [ ] LSTM forecasting engine (v1.0)
- [ ] Voice journaling (Web Speech API)
- [ ] University SSO integration (OAuth2)
- [ ] Counselor opt-in dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language emotion model support
- [ ] HIPAA compliance audit
- [ ] Federated learning for privacy-preserving model updates

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

**Areas especially seeking contributions:**
- ML model improvement & dataset curation
- Additional language support for the crisis lexicon
- Accessibility enhancements
- Security audit & penetration testing

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with empathy. Powered by intelligence. Designed for well-being.**

*SentiaMind — Because mental health deserves smarter tools.*

[![GitHub Stars](https://img.shields.io/github/stars/your-org/sentiamind?style=social)](https://github.com/your-org/sentiamind)

</div>
