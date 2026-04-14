# StockSense AI — React Inventory Platform

A production-grade AI inventory management platform powered by **GPT-4o**, built with **React** (frontend) and **FastAPI** (backend).

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Option 1 — Windows (One-Click)
```
Double-click start.bat
```

### Option 2 — Manual

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your OpenAI API key
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (new terminal):
```bash
cd frontend
npm install
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🤖 AI Assistant Features

### Three Chat Modes

| Mode | Description | Best For |
|------|-------------|----------|
| **Ask** | Concise, direct answer in ≤150 words with data points | Quick facts, status checks |
| **Explain** | Deep Root Cause Analysis with 5-Why chains & impact | Understanding problems |
| **Act** | Executable action plan with exact names/quantities/₹ | Making decisions today |

### Under the Hood

- **GPT-4o** — best OpenAI model for reasoning and structured output
- **MCP Tools** — 8 specialized data tools (stock, demand, supplier, customer, finance, order, freight, email)
- **RCA Engine** — Multi-level root cause analysis with severity scoring
- **Tool Orchestration** — Parallel data fetch from all relevant tools
- **Conversational Memory** — Last 8 exchanges kept in context

---

## 📁 Project Structure

```
stocksense-react/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── routes/
│   │   │   └── chatbot.py       # POST /api/chat
│   │   └── services/
│   │       ├── llm_orchestrator.py  # GPT-4o + orchestration
│   │       ├── mcp_tools.py         # 8 MCP data tools
│   │       ├── rca_engine.py        # Root Cause Analysis
│   │       └── tool_selector.py     # NLP tool routing
│   ├── requirements.txt
│   └── .env                     # Your API key goes here
│
└── frontend/
    ├── src/
    │   ├── App.js               # Main layout + routing
    │   ├── App.css              # All styles
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   └── Topbar.jsx
    │   └── views/
    │       ├── Overview.jsx     # Dashboard
    │       ├── Inventory.jsx    # Stock intelligence
    │       ├── DeadStock.jsx    # Dead stock recovery
    │       ├── Inward.jsx       # Stock movement
    │       ├── Sales.jsx        # Revenue & margin
    │       ├── Customers.jsx    # Customer health
    │       ├── Orders.jsx       # Order pipeline
    │       ├── Procurement.jsx  # Supplier scorecards
    │       ├── POGRN.jsx        # PO & GRN lifecycle
    │       ├── Freight.jsx      # Logistics planning
    │       ├── Finance.jsx      # Profitability & cash
    │       ├── Demand.jsx       # Demand forecasting
    │       └── AIAssistant.jsx  # 🤖 AI Chatbot
    └── package.json
```

---

## 🔑 Environment Setup

Create `backend/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

---

## 📡 API Reference

**POST /api/chat**
```json
{
  "message": "Which SKUs need reordering?",
  "mode": "ask",
  "history": []
}
```

Response:
```json
{
  "response": "...",
  "mode": "ask",
  "tools_used": ["stock", "demand"],
  "rca_performed": false
}
```

**GET /health** — Check backend status  
**GET /docs** — Interactive Swagger UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Chart.js 4, CSS Variables |
| Backend | FastAPI, Python 3.9+, Uvicorn |
| AI | OpenAI GPT-4o |
| Architecture | MCP Tools + RCA Engine + LLM Orchestrator |
