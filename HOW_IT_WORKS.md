# 🧠 SentiaMind — How It Works

> A plain-English walkthrough of the entire project: what each part does, how data flows, and how everything connects.

---

## 🗺️ Big Picture

SentiaMind is a **mental health journaling platform** made of three connected pieces:

```
[ Browser (React) ]  ←→  [ FastAPI Backend ]  ←→  [ SQLite Database ]
                                  ↕
                         [ ML Emotion Engine ]
                                  ↕
                         [ Crisis Safeguard ]
```

A user types a journal entry → the backend classifies the emotions in it → stores it encrypted → serves charts and forecasts back to the UI.

---

## 1. 🖥️ Frontend (React + TypeScript)

**Location:** `frontend/src/`  
**Runs on:** http://localhost:5173

### What it does
The frontend is a **Single Page App (SPA)** built with React 18. It has four main pages:

| Page | File | Purpose |
|---|---|---|
| **Journal** | `pages/JournalPage.tsx` | Write text or voice journal entries |
| **Dashboard** | `pages/DashboardPage.tsx` | View emotion trend charts + recent entries |
| **Forecast** | `pages/ForecastPage.tsx` | See 7-day stress prediction |
| **Wellness Hub** | `pages/WellnessHubPage.tsx` | Breathing exercises + grounding tools |

### How pages connect
`App.tsx` is the root. It holds all state (active page, modals, user profile) and passes callbacks down to each page. Navigation is handled by showing/hiding page components — no React Router used; it's a simple tab-based shell.

### API Communication (`api/client.ts`)
The `ApiClient` class handles **all** data fetching. It has a smart dual-mode:

```
1. On load → pings GET /api/health
   ├─ Backend UP   → uses live FastAPI endpoints
   └─ Backend DOWN → uses localStorage + mock data (offline demo mode)
```

This means the app works **even without the backend running** — it falls back to realistic mock data stored in the browser.

### Local Emotion Inference (`services/mockData.ts`)
When offline, `simulateLocalEmotionInference()` does lightweight keyword matching in the browser — a simplified replica of the backend ML logic — so the UI always shows emotion scores.

### Crisis Engine (`services/crisisEngine.ts`)
Before any journal entry is submitted (even before hitting the network), the text is scanned against a **hardcoded lexicon** of crisis phrases:

```
"kill myself", "suicide", "want to die", "hurt myself", ...
```

If matched → submission is **stopped immediately** and a `CrisisModal` appears with regional emergency hotlines. This runs 100% client-side — no data is ever sent to the server if a crisis is detected.

---

## 2. ⚙️ Backend (FastAPI + Python)

**Location:** `backend/app/`  
**Runs on:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

### Startup sequence (`app/main.py`)
```
1. Load settings from .env
2. Create SQLite/PostgreSQL tables (auto via SQLAlchemy)
3. Register CORS middleware (allows frontend origin)
4. Mount 3 routers: /auth, /journals, /analytics
5. Expose /health endpoint
```

### Three API Routers

#### 🔐 Auth Router (`api/auth.py`) — prefix: `/api/v1/auth`
| Endpoint | What it does |
|---|---|
| `POST /register` | Creates user, generates unique AES salt, hashes password with bcrypt |
| `POST /login` | Verifies password, issues JWT access token (15 min) + refresh token (7 days) |
| `POST /refresh` | Swaps a valid refresh token for a new access token |
| `GET /me` | Returns current user's profile |
| `PUT /me` | Updates name, country, counselor consent |

#### 📓 Journals Router (`api/journals.py`) — prefix: `/api/v1/journals`
| Endpoint | What it does |
|---|---|
| `POST /` | Submit new journal entry (see flow below) |
| `GET /` | List journals (paginated, no content — just metadata) |
| `GET /{id}` | Get + decrypt one journal entry |
| `DELETE /{id}` | Delete a journal entry |

**Journal submission flow (most important flow in the app):**
```
User submits text
      │
      ▼
1. Crisis check (server-side lexical scan)
   └─ If triggered → return hotlines, store NOTHING
      │
      ▼
2. AES-256-CBC Encryption
   └─ User's unique salt → derives 32-byte key → encrypts text → base64 blob
      │
      ▼
3. Save encrypted blob to `journals` table
      │
      ▼
4. Run Emotion Classifier (DistilBERT or fallback lexical engine)
   └─ Returns scores: { joy, sadness, anxiety, anger, fear }
      │
      ▼
5. Save EmotionScore record linked to journal
      │
      ▼
6. Return { id, word_count, created_at, emotion_scores } to client
```

#### 📊 Analytics Router (`api/analytics.py`) — prefix: `/api/v1/analytics`
| Endpoint | What it does |
|---|---|
| `GET /summary?days=N` | Average emotion scores over N days + highest stress day |
| `GET /trends?days=N` | Daily emotion averages grouped by date (for charts) |
| `GET /forecast` | 7-day stress prediction using weighted moving average |
| `GET /streaks` | Current journaling streak + longest streak |

---

## 3. 🗄️ Database Layer (`app/database.py`)

Uses **SQLAlchemy async** with **aiosqlite** (SQLite in dev, PostgreSQL in production).

### Tables

#### `users`
```
id (UUID PK) | email | hashed_password | full_name | country_code
encryption_salt | counselor_consent | is_active | created_at | updated_at
```

#### `journals`
```
id (UUID PK) | user_id (FK→users) | encrypted_content (TEXT) | word_count | created_at
```
> ⚠️ `encrypted_content` is **never** plaintext. It's always `base64(IV + AES_ciphertext)`.

#### `emotion_scores`
```
id (UUID PK) | journal_id (FK→journals) | user_id (FK→users)
joy | sadness | anxiety | anger | fear (all FLOAT)
dominant_emotion | model_confidence | scored_at
```

#### `refresh_tokens`
```
id (UUID PK) | user_id (FK→users) | token_hash (SHA-256) | expires_at | revoked
```

---

## 4. 🤖 ML / AI Pipeline (`app/ml/`)

### Emotion Classifier (`ml/classifier.py`)

```
Input: raw journal text
      │
      ▼
Try: Load fine-tuned DistilBERT from ./models/distilbert-emotion/
      │
  NOT FOUND?
      │
      ▼
Fallback: Lexical Heuristic Engine
  └─ Counts weighted keyword matches per emotion
  └─ Applies softmax-like normalization
  └─ Returns 5 scores that sum to ~1.0
      │
      ▼
Output: EmotionScores { joy, sadness, anxiety, anger, fear, dominant_emotion, confidence }
```

The fallback lexical engine runs with **zero ML dependencies** — no PyTorch needed for basic operation.

### Stress Forecaster (`ml/forecaster.py`)

```
Input: last 60 EmotionScore records (time-ordered)
      │
      ▼
Weighted Moving Average (recency-weighted)
  └─ More recent days weighted higher
  └─ Applies weekly cyclical adjustment (Mon=stress peak, Fri-Sun=relief)
      │
      ▼
7-day forecast: stress_probability per day
  └─ Maps to alert level: low / moderate / high / critical
      │
      ▼
Output: ForecastResponse { days[7], model_version, data_points_used }
```

> The LSTM model referenced in docs is planned for v2. Current engine uses a statistical weighted moving average.

---

## 5. 🔐 Security Layer (`app/core/security.py`)

### Password Hashing
```
plain password → bcrypt(cost=12) → hashed_password stored in DB
Login: bcrypt.verify(plain, stored_hash) — constant-time comparison
```

### JWT Tokens
```
Access Token  → expires in 15 minutes → used for every API call
Refresh Token → expires in 7 days    → stored as SHA-256 hash in DB
                                        raw token sent to client once only
```

### Journal Encryption (AES-256-CBC)
```
master_key (from .env, 32 bytes) + user_salt (random 32 bytes per user)
      │
      ▼
HMAC-SHA256(master_key, salt) → 32-byte user-specific AES key
      │
      ▼
Random 16-byte IV generated per entry
AES-256-CBC.encrypt(plaintext, key, IV)
      │
      ▼
Stored: base64( IV + ciphertext )

Decryption: split IV | ciphertext → AES-256-CBC.decrypt → original text
```

Each user has their own derived key — compromising one user's key doesn't expose others.

---

## 6. 🚨 Crisis Safeguard (Both Layers)

The crisis check runs **twice** — once client-side before the network call, and once server-side before any data is stored:

```
Client (crisisEngine.ts)          Server (core/crisis.py)
─────────────────────             ─────────────────────
Text scanned before fetch    →    Text re-scanned on receipt
If triggered:                     If triggered:
  - Show CrisisModal               - Return hotlines immediately
  - Never send to server           - Store NOTHING in DB
  - Display regional hotlines      - Log anonymized trigger event
```

Both checks are **100% deterministic** — no ML, no probability — just exact string matching against a clinical lexicon. This guarantees no false negatives from AI uncertainty.

---

## 7. ⚙️ Configuration (`app/config.py` + `.env`)

All settings are loaded from `backend/.env`:

```env
APP_ENV=development
DATABASE_URL=sqlite+aiosqlite:///./sentiamind.db   # SQLite (dev)
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=<256-bit hex>
MASTER_ENCRYPTION_KEY=<64 hex chars = 32 bytes>
HUGGINGFACE_MODEL_PATH=./models/distilbert-emotion
FRONTEND_URL=http://localhost:5173
```

If no `.env` exists, the app uses safe hardcoded dev defaults (not for production).

---

## 8. 🔄 Full Request Lifecycle Example

> **User writes: "I'm feeling anxious about my exams this week"**

```
1. Browser (JournalPage.tsx)
   └─ User types → hits Submit

2. crisisEngine.ts (client)
   └─ Scans text → no crisis keywords → proceed

3. ApiClient.submitJournal()
   └─ Backend reachable? Yes → POST /api/v1/journals

4. FastAPI journals router
   └─ Verify JWT Bearer token → extract user_id

5. crisis.py (server)
   └─ Re-scan text → no crisis → proceed

6. security.py
   └─ AES-256-CBC encrypt "I'm feeling anxious..." → base64 blob

7. Database
   └─ INSERT into journals (encrypted_content, word_count=8)

8. ml/classifier.py
   └─ Lexical scan: "anxious"=+1.5, "exam"=+1.5
   └─ anxiety score highest → dominant_emotion = "anxiety"
   └─ Returns { joy:0.12, sadness:0.14, anxiety:0.52, anger:0.08, fear:0.14 }

9. Database
   └─ INSERT into emotion_scores linked to journal

10. Response → Client
    └─ { id, word_count:8, emotion_scores: {...} }

11. Browser (JournalPage.tsx)
    └─ Shows emotion result card with anxiety as dominant
    └─ Dashboard updates with new trend point
```

---

## 9. 📁 Key File Map

```
SentiaMind/
├── backend/
│   ├── app/
│   │   ├── main.py              ← App entry, CORS, routers
│   │   ├── config.py            ← All settings from .env
│   │   ├── database.py          ← SQLAlchemy engine + session
│   │   ├── api/
│   │   │   ├── auth.py          ← Register / Login / Token refresh
│   │   │   ├── journals.py      ← Submit / List / Get / Delete journals
│   │   │   └── analytics.py     ← Summary / Trends / Forecast / Streaks
│   │   ├── core/
│   │   │   ├── security.py      ← bcrypt, JWT, AES-256 encryption
│   │   │   ├── crisis.py        ← Crisis keyword detection
│   │   │   └── dependencies.py  ← JWT auth dependency injector
│   │   ├── ml/
│   │   │   ├── classifier.py    ← Emotion classification engine
│   │   │   └── forecaster.py    ← 7-day stress forecasting engine
│   │   ├── models/
│   │   │   ├── user.py          ← User ORM table
│   │   │   ├── journal.py       ← Journal ORM table
│   │   │   └── emotion_score.py ← EmotionScore + RefreshToken ORM tables
│   │   └── schemas/
│   │       ├── auth.py          ← Pydantic request/response shapes for auth
│   │       ├── journal.py       ← Pydantic shapes for journals
│   │       └── analytics.py     ← Pydantic shapes for analytics
│   ├── .env                     ← Environment config (DB, secrets, keys)
│   └── requirements.txt         ← Python dependencies
│
└── frontend/
    └── src/
        ├── App.tsx              ← Root shell, navigation, global state
        ├── main.tsx             ← React DOM mount point
        ├── types/index.ts       ← All TypeScript interfaces
        ├── api/client.ts        ← Unified API client (live + offline modes)
        ├── services/
        │   ├── crisisEngine.ts  ← Client-side crisis detection + hotlines
        │   └── mockData.ts      ← Offline mock data + local ML simulation
        ├── pages/
        │   ├── JournalPage.tsx  ← Journal entry UI + voice input
        │   ├── DashboardPage.tsx← Emotion charts + recent entries
        │   ├── ForecastPage.tsx ← 7-day stress forecast UI
        │   └── WellnessHubPage.tsx ← Breathing + grounding exercises
        └── components/
            ├── Navbar.tsx       ← Top navigation bar
            ├── CrisisModal.tsx  ← Emergency resources popup
            ├── EmotionChart.tsx ← Recharts emotion trend graph
            ├── ForecastWidget.tsx ← Forecast summary card
            └── JournalHistoryModal.tsx ← Past entries viewer
```

---

*This document describes the working codebase as of November 2026.*
