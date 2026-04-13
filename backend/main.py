"""
StockSense AI — FastAPI backend
Powering the AI Assistant section with OpenAI GPT-4o.

Architecture
------------
- Three interaction modes: Ask · Explain · Act
- MCP-style tool registry (inventory, alerts, suppliers, customers, SKUs)
- Orchestrator decides which tools to invoke before generating the final answer
- RCA (Root Cause Analysis) layer enriches Explain-mode responses
- All context is injected as system + tool messages so GPT-4o reasons over live data
"""

import os
import re
import json
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set — please create backend/.env from .env.example")

client = OpenAI(api_key=OPENAI_API_KEY)

# ---------------------------------------------------------------------------
# App & CORS
# ---------------------------------------------------------------------------
app = FastAPI(title="StockSense AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# MCP Tool Registry  (simulated live dealer data)
# ---------------------------------------------------------------------------
# In production these would call your real DMS/ERP APIs.

INVENTORY_DATA = {
    "18mm BWP":      {"qty": 136, "reorder_point": 200, "daily_sale": 17, "lead_days": 6, "price": 95,  "grade": "BWP"},
    "12mm BWP":      {"qty": 210, "reorder_point": 150, "daily_sale": 12, "lead_days": 5, "price": 72,  "grade": "BWP"},
    "12mm MR":       {"qty": 320, "reorder_point": 180, "daily_sale": 14, "lead_days": 4, "price": 54,  "grade": "MR"},
    "6mm Gurjan":    {"qty": 480, "reorder_point": 80,  "daily_sale": 3,  "lead_days": 7, "price": 38,  "grade": "BWP"},
    "4mm MR plain":  {"qty": 390, "reorder_point": 60,  "daily_sale": 2,  "lead_days": 5, "price": 22,  "grade": "MR"},
    "19mm Commercial":{"qty": 520,"reorder_point": 90,  "daily_sale": 4,  "lead_days": 6, "price": 48,  "grade": "Commercial"},
    "Laminates":     {"qty": 280, "reorder_point": 120, "daily_sale": 7,  "lead_days": 4, "price": 65,  "grade": "Laminates"},
    "18mm MR":       {"qty": 190, "reorder_point": 140, "daily_sale": 9,  "lead_days": 5, "price": 68,  "grade": "MR"},
}

ALERTS = [
    {"id": "A1", "level": "Urgent",   "title": "18mm BWP — Only 8 Days Cover",
     "detail": "136 sheets on hand, 17/day sale, 6-day lead time. Order 200 sheets immediately."},
    {"id": "A2", "level": "Critical", "title": "₹4.2L Dead Stock — 3 SKUs Stagnant 90+ Days",
     "detail": "6mm Gurjan (480 sheets), 4mm MR plain (390), 19mm Commercial (520). Consider discount or return to supplier."},
    {"id": "A3", "level": "High",     "title": "City Interiors — 47 Days Silent",
     "detail": "₹2.4L/mo revenue account. No order in 47 days. Engage with targeted offer."},
    {"id": "A4", "level": "Medium",   "title": "Gauri Laminates — 2 Delivery Delays",
     "detail": "8mm flexi board late twice. On-time delivery: 68%. Consider alternate sourcing."},
]

SUPPLIERS = [
    {"name": "Gauri Laminates",   "otd": 68,  "price_index": 1.06, "categories": ["Laminates", "8mm flexi"], "risk": "High"},
    {"name": "Century Plyboards", "otd": 94,  "price_index": 1.01, "categories": ["BWP", "MR"],              "risk": "Low"},
    {"name": "Greenply",          "otd": 91,  "price_index": 1.02, "categories": ["BWP", "Commercial"],      "risk": "Low"},
    {"name": "Supreme Laminates", "otd": 88,  "price_index": 1.03, "categories": ["Laminates"],              "risk": "Medium"},
]

CUSTOMERS = [
    {"name": "City Interiors",     "monthly_value": 240000, "last_order_days": 47, "risk": "High",   "segment": "Interior Firms"},
    {"name": "BuildRight Traders", "monthly_value": 185000, "last_order_days": 12, "risk": "Low",    "segment": "Retailers"},
    {"name": "SunRise Constructions","monthly_value":310000, "last_order_days": 5, "risk": "Low",    "segment": "Contractors"},
    {"name": "Home Makers",        "monthly_value": 95000,  "last_order_days": 38, "risk": "Medium", "segment": "Interior Firms"},
    {"name": "Raj Carpentry",      "monthly_value": 62000,  "last_order_days": 22, "risk": "Low",    "segment": "Carpenters"},
]

KPI = {
    "revenue_mtd":        2840000,
    "gross_margin_pct":   22.4,
    "dead_stock_value":   420000,
    "receivables":        1280000,
    "orders_today":       24,
    "dispatched_today":   18,
    "pending_today":      6,
    "low_stock_skus":     7,
    "stock_turnover":     4.2,
    "avg_stock_cover_days": 22,
}


def tool_get_inventory_status() -> dict:
    """Return full inventory with computed days-of-cover and flags."""
    result = {}
    for sku, d in INVENTORY_DATA.items():
        days_cover = round(d["qty"] / d["daily_sale"], 1) if d["daily_sale"] > 0 else 999
        result[sku] = {
            **d,
            "days_cover": days_cover,
            "status": (
                "CRITICAL" if days_cover < d["lead_days"] + 2
                else "LOW" if days_cover < 14
                else "DEAD_STOCK" if days_cover > 90
                else "OK"
            ),
        }
    return result


def tool_get_alerts() -> list:
    return ALERTS


def tool_get_supplier_performance() -> list:
    return SUPPLIERS


def tool_get_customer_risk() -> list:
    return CUSTOMERS


def tool_get_kpis() -> dict:
    return KPI


def tool_get_top_skus() -> list:
    inv = tool_get_inventory_status()
    ranked = sorted(INVENTORY_DATA.items(), key=lambda x: x[1]["daily_sale"], reverse=True)[:5]
    return [{"sku": k, "daily_sale": v["daily_sale"], "status": inv[k]["status"]} for k, v in ranked]


# Map tool names → callables
TOOLS = {
    "get_inventory_status":    tool_get_inventory_status,
    "get_alerts":              tool_get_alerts,
    "get_supplier_performance": tool_get_supplier_performance,
    "get_customer_risk":       tool_get_customer_risk,
    "get_kpis":                tool_get_kpis,
    "get_top_skus":            tool_get_top_skus,
}

# ---------------------------------------------------------------------------
# Orchestrator — decide which tools to call given the user query
# ---------------------------------------------------------------------------

TOOL_SELECTION_PROMPT = """You are an orchestration layer for an inventory management AI.
Given a user question, return a JSON array of tool names to call (from the list below) that would
provide the most relevant context. Return ONLY the JSON array, nothing else.

Available tools:
- get_inventory_status   : current stock levels, days-of-cover, reorder flags
- get_alerts             : urgent/critical/high/medium AI-generated alerts
- get_supplier_performance: supplier on-time delivery and price index
- get_customer_risk      : customer risk, last order date, monthly value
- get_kpis               : high-level financial and operational KPIs
- get_top_skus           : top-selling SKUs with status

User question: {question}
"""


def orchestrate_tools(question: str) -> dict:
    """Use GPT-4o-mini to pick relevant tools then execute them."""
    selection_resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": TOOL_SELECTION_PROMPT.format(question=question)}],
        max_tokens=128,
        temperature=0,
    )
    raw = selection_resp.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        selected = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback: call all tools
        selected = list(TOOLS.keys())

    context = {}
    for tool_name in selected:
        if tool_name in TOOLS:
            try:
                context[tool_name] = TOOLS[tool_name]()
            except Exception as exc:
                context[tool_name] = {"error": str(exc)}
    return context


# ---------------------------------------------------------------------------
# RCA Engine — enrich Explain-mode with root-cause reasoning
# ---------------------------------------------------------------------------

RCA_PROMPT = """You are a Root Cause Analysis (RCA) specialist for inventory and dealer management.
Given the following business context data, identify the root causes behind any issues detected,
map cause → effect chains, and suggest corrective actions.

Context:
{context}

User question: {question}

Return a concise RCA summary in 3–5 bullet points.
"""


def run_rca(question: str, context: dict) -> str:
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "user",
                "content": RCA_PROMPT.format(
                    context=json.dumps(context, indent=2),
                    question=question,
                ),
            }
        ],
        max_tokens=512,
        temperature=0.2,
    )
    return resp.choices[0].message.content.strip()


# ---------------------------------------------------------------------------
# Mode-specific system prompts
# ---------------------------------------------------------------------------

BASE_SYSTEM = """You are StockSense AI, a world-class inventory intelligence assistant specialised
in dealer and distribution management for building materials (plywood, laminates, boards).
You have access to real-time inventory, KPI, supplier, and customer data injected as tool-context messages.
Always cite specific numbers from the data. Be concise, professional, and actionable."""

MODE_EXTENSIONS = {
    "ask": """
RESPONSE MODE: Ask
- Give a direct, precise answer to the question.
- 2–4 sentences. Lead with the most important fact.
- No lengthy explanations unless the question demands it.
""",
    "explain": """
RESPONSE MODE: Explain
- Provide a thorough, structured explanation.
- Use this format:
  ## Summary
  <1-sentence answer>
  ## Analysis
  <detailed breakdown with data>
  ## Root Cause Analysis
  {rca}
  ## Implications
  <what this means for the business>
- Use bullet points and bold key numbers.
""",
    "act": """
RESPONSE MODE: Act
- The user wants concrete action steps.
- Use this format:
  ## Immediate Actions (do today)
  <numbered list>
  ## Short-Term Actions (this week)
  <numbered list>
  ## Monitoring
  <what to track and when>
- Be specific: include SKU names, quantities, account names, supplier names.
- Every action must be measurable.
""",
}

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    question: str
    mode: Literal["ask", "explain", "act"] = "ask"
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    answer: str
    mode: str
    intent: str
    tools_used: list[str]
    rca_summary: str | None = None


# ---------------------------------------------------------------------------
# /chat endpoint
# ---------------------------------------------------------------------------


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question must not be empty.")

    # 1. Orchestrate — pick and call relevant tools
    context = orchestrate_tools(req.question)
    tools_used = list(context.keys())

    # 2. RCA (only in explain mode)
    rca_text: str | None = None
    if req.mode == "explain" and context:
        rca_text = run_rca(req.question, context)

    # 3. Build system prompt
    rca_placeholder = rca_text or ""
    system_content = (
        BASE_SYSTEM + MODE_EXTENSIONS[req.mode].replace("{rca}", rca_placeholder)
    )

    # 4. Build messages array
    messages = [{"role": "system", "content": system_content}]

    # Inject tool context as a system message
    if context:
        messages.append(
            {
                "role": "system",
                "content": "=== LIVE BUSINESS DATA ===\n" + json.dumps(context, indent=2),
            }
        )

    # Previous conversation history
    for msg in req.history[-10:]:  # last 10 turns max
        messages.append({"role": msg.role, "content": msg.content})

    # Current user question
    messages.append({"role": "user", "content": req.question})

    # 5. Call OpenAI
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=messages,
        max_tokens=1024,
        temperature=0.3,
    )

    answer = response.choices[0].message.content.strip()

    # 6. Detect intent label for the frontend
    intent = _detect_intent(req.question)

    return ChatResponse(
        answer=answer,
        mode=req.mode,
        intent=intent,
        tools_used=tools_used,
        rca_summary=rca_text,
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health")
def health():
    return {"status": "ok", "model": OPENAI_MODEL}


# ---------------------------------------------------------------------------
# Intent detection helper
# ---------------------------------------------------------------------------

_INTENT_PATTERNS = [
    ("Reorder planning",       [r"reorder|restock|replenish|order more|stock.*up"]),
    ("Customer engagement",    [r"customer|account|silent|haven.t ordered|churn"]),
    ("Dead stock clearance",   [r"dead stock|deadstock|slow.moving|stagnant|aged"]),
    ("Supplier performance",   [r"supplier|delivery|lead time|gauri|century"]),
    ("Margin analysis",        [r"margin|profit|profitability|gross"]),
    ("Stock health",           [r"coverage|days cover|safety stock|stock health"]),
    ("Sales trend",            [r"sales|trend|mover|demand|top sku"]),
    ("Financial overview",     [r"revenue|cash|receivable|outstanding"]),
    ("Alert triage",           [r"alert|urgent|critical|warning"]),
]


def _detect_intent(text: str) -> str:
    t = text.lower()
    for label, patterns in _INTENT_PATTERNS:
        if any(re.search(p, t) for p in patterns):
            return label
    return "General business query"
