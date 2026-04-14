# StockSense AI v2 — React + FastAPI + GPT-4o

> **Production-grade AI inventory management platform** for plywood/building-materials dealers in India.  
> Powered by GPT-4o, MCP tool orchestration, Root Cause Analysis, and real-time SSE streaming.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+ (use `--legacy-peer-deps` on Node 18+)
- OpenAI API key → [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Option 1 — Windows One-Click
```
Double-click  start.bat
```

### Option 2 — Manual

**Backend** (Terminal 1):
```bash
cd backend
copy .env.example .env
# Open .env and paste your OpenAI key
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Open **http://localhost:3000** → Click **AI Assistant** in the sidebar.

---

## 🔑 Environment Setup

Create `backend/.env` (copy from `.env.example`):
```env
OPENAI_API_KEY=sk-your-actual-key-here
```
> ⚠️ `.env` is in `.gitignore` — your API key is never committed.

---

## 🤖 AI Assistant

### Three Modes

| Mode | Shortcut | Description | Best For |
|------|----------|-------------|----------|
| 💬 **Ask** | `Ctrl+1` | Concise, data-backed answer ≤150 words | Quick facts, status checks |
| 🔍 **Explain** | `Ctrl+2` | Deep Root Cause Analysis with 5-Why chains | Understanding problems |
| ⚡ **Act** | `Ctrl+3` | Executable action plan with exact names/₹/dates | Decisions today |

### Features
- **Real-time streaming** — tokens appear as GPT-4o generates them (SSE)
- **MCP Tool Orchestration** — 8 domain tools fetched in parallel (stock, demand, supplier, customer, finance, orders, freight, email)
- **RCA Engine** — Multi-level root cause analysis with severity scoring and 5-Why chains
- **Generic query handling** — Handles greetings, help requests, small talk naturally
- **Follow-up suggestions** — 3 smart follow-up questions after every response (GPT-4o-mini)
- **Conversation memory** — Last 8 exchanges kept in context
- **Copy / Retry / 👍👎 reactions** — Per-message actions
- **Keyboard shortcuts** — `Ctrl+1/2/3` for modes, `Ctrl+L` to clear

---

## 📁 Project Structure

```
build/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app + CORS
│   │   ├── routes/
│   │   │   └── chatbot.py           # POST /api/chat  &  POST /api/chat/stream
│   │   └── services/
│   │       ├── llm_orchestrator.py  # GPT-4o streaming + follow-ups + generic path
│   │       ├── mcp_tools.py         # 8 MCP data tools with rich mock DMS data
│   │       ├── rca_engine.py        # Root Cause Analysis engine
│   │       └── tool_selector.py     # NLP keyword routing + generic query detector
│   ├── requirements.txt
│   ├── .env.example                 # Template — copy to .env
│   └── .env                         # [GITIGNORED] — your real API key
│
├── frontend/
│   ├── public/index.html            # Google Fonts: Plus Jakarta Sans, JetBrains Mono
│   └── src/
│       ├── App.js                   # Main layout + view routing + goChat callback
│       ├── App.css                  # All styles (CSS variables design system)
│       ├── components/
│       │   ├── Sidebar.jsx          # 13 nav items with badges
│       │   └── Topbar.jsx           # Period tabs + AI badge
│       ├── utils/chartHelpers.js    # Chart.js factory helper
│       └── views/
│           ├── Overview.jsx         # KPI grid, charts, alerts
│           ├── Inventory.jsx        # Stock table, movement chart
│           ├── DeadStock.jsx        # Ageing table, recovery chart
│           ├── Inward.jsx           # Flow pipeline, KPI grid
│           ├── Sales.jsx            # Revenue/margin/day-of-week charts
│           ├── Customers.jsx        # Health table with filter
│           ├── Orders.jsx           # Order volume, pending table
│           ├── Procurement.jsx      # Supplier scorecards
│           ├── POGRN.jsx            # PO table, GRN discrepancy log
│           ├── Freight.jsx          # Lane grid, cost chart
│           ├── Finance.jsx          # Margin/cashflow, margin simulator
│           ├── Demand.jsx           # Forecast table, seasonal patterns
│           └── AIAssistant.jsx      # 🤖 Full AI chatbot
│
├── start.bat                        # Windows one-click launcher
└── README.md
```

---

## 📡 API Reference

### POST `/api/chat` — Non-streaming
```json
{ "message": "Which SKUs need reordering?", "mode": "ask", "history": [] }
```
Response:
```json
{ "response": "...", "mode": "ask", "tools_used": ["stock","demand"], "rca_performed": false }
```

### POST `/api/chat/stream` — Real-time SSE streaming
Same request body. Events streamed:
```
data: {"type":"meta","tools_used":["stock","demand"],"rca_performed":false}
data: {"type":"token","content":"18mm BWP..."}
data: {"type":"done","follow_ups":["...", "...", "..."]}
```

### GET `/health` — Backend health check  
### GET `/docs` — Interactive Swagger UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Chart.js 4.4, CSS Variables |
| Backend | FastAPI, Python 3.9+, Uvicorn |
| AI Model | OpenAI GPT-4o (streaming) + GPT-4o-mini (follow-ups) |
| Architecture | MCP Tools + RCA Engine + LLM Orchestrator |
| Streaming | Server-Sent Events (SSE) via FastAPI `StreamingResponse` |
| Styling | Plus Jakarta Sans + JetBrains Mono, custom design system |

---

## 🔄 How to Resume from This Checkpoint

Everything is committed at **commit `a68ed12`** on branch `main`.

To clone and continue from exactly this state:
```bash
git clone https://github.com/nikhil2465/stock_intelligence_model2.git
cd stock_intelligence_model2
# Create backend/.env with your API key
# Then: cd frontend && npm install --legacy-peer-deps && npm start
# And:  cd backend && python -m uvicorn app.main:app --reload --port 8000
```

---

*Built with GitHub Copilot · GPT-4o · FastAPI · React 18*
