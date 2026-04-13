# StockSense AI — Setup Guide

## What was added

| Component | Location | Purpose |
|-----------|----------|---------|
| FastAPI backend | `backend/` | OpenAI GPT-4o, tool orchestration, RCA engine |
| Updated AI page | `inventory-management-system/src/pages/StockSenseAI.jsx` | Ask / Explain / Act modes, live AI responses |
| Vite proxy | `inventory-management-system/vite.config.js` | Routes `/api/*` → `localhost:8000` |

---

## Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- An **OpenAI API key** (GPT-4o access required)

---

## 1 — Backend setup

```bash
# From the repo root
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Now open .env and paste your OpenAI API key:
#   OPENAI_API_KEY=sk-...

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

The backend will be available at **http://localhost:8000**.  
You can verify it is running: **http://localhost:8000/health**

---

## 2 — Frontend setup

```bash
# From the repo root
cd inventory-management-system

npm install
npm run dev
```

The React app will open at **http://localhost:5174**.

---

## 3 — Using the AI chatbot

1. Open **http://localhost:5174** and navigate to **StockSense AI** in the sidebar.
2. The status badge in the hero will show **AI Active · GPT-4o** when the backend is reachable.
3. Select a **mode** from the three buttons:
   - 💬 **Ask** — short, direct answers
   - 🔍 **Explain** — deep structured analysis with Root Cause Analysis (RCA)
   - ⚡ **Act** — numbered, executable action plans
4. Type your question or click a quick-question pill, then press **Enter** or the mode button.

---

## Architecture overview

```
Browser (React)
  │  POST /api/chat  { question, mode, history }
  ▼
Vite dev proxy (:5174) ──► FastAPI (:8000)
                               │
                    ┌──────────┴──────────┐
                    │  Orchestrator        │
                    │  (GPT-4o-mini)       │
                    │  picks tools to call │
                    └──────────┬──────────┘
                               │ calls
                    ┌──────────▼──────────┐
                    │  MCP Tool Registry   │
                    │  inventory / alerts  │
                    │  suppliers / customers│
                    │  KPIs / top SKUs     │
                    └──────────┬──────────┘
                               │ context
                    ┌──────────▼──────────┐
                    │  RCA Engine (Explain)│
                    │  (GPT-4o)           │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Final Answer        │
                    │  GPT-4o with mode    │
                    │  system prompt       │
                    └─────────────────────┘
```

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | *(required)* | Your OpenAI secret key |
| `OPENAI_MODEL` | `gpt-4o` | LLM model to use |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | CORS origin for the React app |

---

## Existing functionality

All other pages (Dashboard, Inventory, Stock Intelligence, Analytics, Forecasting, Settings) are **unchanged**.
The chatbot changes are isolated to `StockSenseAI.jsx`, `StockSenseAI.css`, `vite.config.js`, and the new `backend/` folder.
