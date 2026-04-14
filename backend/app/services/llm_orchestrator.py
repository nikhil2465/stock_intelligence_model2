"""
LLM Orchestration Engine — StockSense AI v2
Coordinates MCP tools → RCA engine → GPT-4o streaming → mode-specific responses.

Modes:
  ask     → Concise, data-backed answers with specific numbers
  explain → Deep RCA with 5-Why chains, ₹-quantified impact
  act     → Step-by-step executable action plan

Streaming:
  process_query_stream() yields SSE-compatible dicts for real-time token delivery.
  process_query() is the non-streaming fallback.
"""
import os
import json
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
from openai import AsyncOpenAI
from dotenv import load_dotenv

from app.services.tool_selector import select_tools, is_generic_query
from app.services.mcp_tools import TOOLS
from app.services.rca_engine import run_rca, build_rca_narrative

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = "gpt-4o"
MODEL_MINI = "gpt-4o-mini"   # Used for lightweight follow-up generation

# ── GENERIC / CONVERSATIONAL SYSTEM PROMPT ─────────────────────────────────────
SYSTEM_GENERIC = """You are StockSense AI — a friendly, expert AI assistant built for inventory dealers in India.

## Your Purpose
Help plywood, hardware, and building-materials dealers run their business smarter:
- Inventory & stock management (reorder points, dead stock, ABC analysis)
- Sales & demand forecasting
- Supplier management & procurement
- Customer accounts & collections
- Finance, margins & cash flow
- Operational actions (emails, reminders, dispatch)

## Personality for Conversational Messages
- Warm, professional, and encouraging — like a trusted business advisor
- Keep greetings short (2-3 sentences max), then offer specific help
- If someone says "hi" or "need help" — welcome them and list 3-4 things you can do
- If someone says "thanks" — acknowledge warmly and offer next steps
- If someone asks what you can do — give a crisp, bulleted capability overview
- Never be robotic or overly formal for small talk
- Always end with an invite to ask their first question

## Capability Summary (use this when explaining yourself)
- 📦 **Stock Check**: Low-stock alerts, reorder quantities, dead stock recovery
- 📈 **Demand Forecast**: 30-day predictions, seasonal patterns, fast/slow movers
- 💰 **Margin Analysis**: True landed cost, per-SKU profitability, discount leakage
- 🏭 **Supplier Scorecard**: On-time rates, price benchmarking, best-vendor advice
- 👥 **Customer Intelligence**: Churn risk, overdue collections, credit risk flags
- ⚡ **Action Plans**: Step-by-step executable plans with ₹ impact estimates
- 🔍 **Root Cause Analysis**: Why is margin falling? Why is working capital stuck?
- 📧 **Drafting**: Payment reminders, PO emails, customer follow-ups
"""
SYSTEM_BASE = """You are StockSense AI — an expert AI advisor for inventory dealers in India.
You are live-connected to a plywood dealer's DMS (Dealer Management System) in Bangalore.

## Non-Negotiable Rules
1. **Lead with the direct answer** — never start with preamble like "Great question" or "Sure!"
2. **Always cite real data**: SKU names, exact ₹ amounts, customer names, exact days
3. **Indian business context**: Use ₹, lakhs/crores, GST, Tally, 30/60/90-day credit norms
4. **Be specific**: "Order 300 sheets of 18mm BWP from Century" beats "reorder popular SKUs"
5. **Quantify everything**: Every insight must have a ₹ number attached

## Live DMS Snapshot (Real-Time)
- **Revenue MTD**: ₹28.4L (+9.2% MoM) | Gross Margin: 22.4% | YTD: ₹2.84 Cr
- **Stock**: ₹38.6L total | CRITICAL LOW: 18mm BWP (8d cover), 12mm BWP (11d cover)
- **Dead stock**: ₹4.2L locked — 6mm Gurjan (118d), 4mm MR Plain (97d), 19mm Commercial (91d)
- **Overstock**: ₹7.8L | Accuracy: 96.8% | Turnover: 4.2×
- **Receivables**: ₹12.8L outstanding | Sharma Constructions ₹3.4L (78d — HIGH RISK)
- **Orders today**: 24 | Dispatched: 18 | Pending: 6 | Mehta order delayed 30h (₹3.8L account)
- **Best supplier**: Century Plyboards (96% on-time, -3% market price)
- **Problem supplier**: Gauri Laminates (68% on-time, +11% true landed cost)
- **Working capital**: 48 days (target <40d) | GSTR-3B PENDING (due 20 Apr)
- **Hidden margin killer**: 8mm Flexi true margin 6.7% (stated 23.8%) — Gauri freight ₹110/sh destroys it

## Formatting Guidelines by Mode
- **ASK**: Plain prose, 1-2 short paragraphs, key numbers bolded
- **EXPLAIN**: Use markdown headers (## Root Cause, ## Contributing Factors, ## Business Impact, ## Fix Plan), bullet points, numbered steps
- **ACT**: Use numbered sections (### IMMEDIATE, ### THIS WEEK, ### FOLLOW-UP), bullet points with → arrows, ₹ impact on each
"""

MODE_INSTRUCTIONS = {
    "ask": """
## Response Mode: ASK
- **Length**: 80–150 words maximum
- **Structure**: Direct answer → 2-3 supporting data points → 1 action today
- **Style**: Conversational, like a trusted advisor answering a quick question
- **Do NOT** use headers or bullet lists — flowing prose only
- **End with**: One clear, immediate action (e.g., "Call Century now and place PO for 300 sheets")
""",
    "explain": """
## Response Mode: EXPLAIN (Root Cause Analysis)
- **Length**: 280–400 words
- **Structure**:
  ## Executive Summary
  (2 sentences: what's wrong + total ₹ impact)
  
  ## Root Cause
  (Primary cause with the chain of events that led here)
  
  ## Contributing Factors
  - Factor 1 (with data)
  - Factor 2 (with data)
  - Factor 3 (with data)
  
  ## Business Impact
  (Quantify everything in ₹ — monthly, annual, cumulative)
  
  ## Fix Plan
  1. Immediate action (today)
  2. Short-term fix (this week)
  3. Structural change (this month)

- **Style**: Analytical, like a management consultant's brief
- **Must**: Use the RCA engine data provided, show causation chains, quantify every impact
""",
    "act": """
## Response Mode: ACT (Executable Action Plan)
- **Length**: 200–320 words
- **Structure**:
  ### ⚡ IMMEDIATE — Do Today
  1. Action → Who/What/Amount → ₹ impact
  2. Action → ...
  
  ### 📅 THIS WEEK
  1. Action → ...
  
  ### 🔄 FOLLOW-UP (Next 30 Days)
  1. Action → ...
  
  **Total estimated ₹ impact if all actions completed: ₹X.XL**

- **Style**: Operator manual, not consultant report
- **Every action must have**: Specific contact/supplier/customer name, exact quantity or ₹ amount, expected outcome
- **Rank by**: ₹ impact (highest first)
""",
}


# ── TOOL ORCHESTRATION ─────────────────────────────────────────────────────────
async def gather_tool_data(tools: List[str], query: str) -> Dict[str, Any]:
    """Fetch data from selected MCP tools concurrently."""
    tasks = {t: TOOLS[t](query) for t in tools if t in TOOLS}
    gathered = await asyncio.gather(*tasks.values(), return_exceptions=True)
    return {
        name: result if not isinstance(result, Exception) else {"error": str(result)}
        for name, result in zip(tasks.keys(), gathered)
    }


def _format_tool_context(tool_name: str, data: dict) -> str:
    try:
        return f"[{tool_name.upper()} DATA]\n{json.dumps(data, ensure_ascii=False, indent=1)[:1400]}"
    except Exception:
        return f"[{tool_name.upper()} DATA]\n{str(data)[:800]}"


def _build_messages(
    query: str,
    mode: str,
    tool_data: Dict[str, Any],
    rca_context: str,
    history: Optional[List[Dict]],
) -> List[Dict]:
    """Assemble the full messages list for GPT-4o."""
    context_sections = [_format_tool_context(t, d) for t, d in tool_data.items() if "error" not in d]
    if rca_context:
        context_sections.append(rca_context)
    full_context = "\n\n".join(context_sections)

    system_prompt = SYSTEM_BASE + MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["ask"])
    messages = [{"role": "system", "content": system_prompt}]

    if history:
        for msg in history[-8:]:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": str(msg["content"])[:2000]})

    messages.append({
        "role": "user",
        "content": (
            f"**My Question ({mode.upper()} mode):** {query}\n\n"
            f"--- Live DMS Data ---\n{full_context}"
        ),
    })
    return messages


def _build_generic_messages(query: str, history: Optional[List[Dict]]) -> List[Dict]:
    """Build messages for generic/conversational queries — no tool context needed."""
    messages = [{"role": "system", "content": SYSTEM_GENERIC}]
    if history:
        for msg in history[-6:]:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": str(msg["content"])[:800]})
    messages.append({"role": "user", "content": query})
    return messages


async def _run_rca_if_needed(
    mode: str, query: str, tool_data: Dict
) -> tuple[bool, str]:
    """Run RCA engine for explain mode or 'why' questions."""
    q = query.lower()
    if mode == "explain" or any(w in q for w in ["why", "cause", "reason", "root", "how did", "what caused"]):
        issues = run_rca(
            stock_data=tool_data.get("stock", {}),
            demand_data=tool_data.get("demand"),
            supplier_data=tool_data.get("supplier", {}),
            finance_data=tool_data.get("finance", {}),
            order_data=tool_data.get("order", {}),
            query=query,
        )
        if issues:
            return True, build_rca_narrative(issues, query)
    return False, ""


async def _generate_follow_ups(query: str, mode: str) -> List[str]:
    """Generate 3 smart follow-up questions using GPT-4o-mini."""
    try:
        resp = await client.chat.completions.create(
            model=MODEL_MINI,
            messages=[{
                "role": "user",
                "content": (
                    f"A dealer just asked: \"{query}\" about their inventory.\n"
                    f"Suggest exactly 3 short, specific follow-up questions they might ask next.\n"
                    f"Rules: Each question max 8 words. One per line. No numbering. No preamble.\n"
                    f"Make them specific to plywood/building materials dealership context."
                ),
            }],
            max_tokens=80,
            temperature=0.6,
        )
        lines = resp.choices[0].message.content.strip().split('\n')
        cleaned = [l.strip().lstrip('123.-•– ').strip() for l in lines if l.strip()]
        return [q for q in cleaned if 4 < len(q) < 80][:3]
    except Exception:
        return []


# ── STREAMING PIPELINE ─────────────────────────────────────────────────────────
async def process_query_stream(
    query: str,
    mode: str = "ask",
    history: Optional[List[Dict]] = None,
) -> AsyncGenerator[Dict, None]:
    """
    Streaming orchestration pipeline — yields SSE dicts:
      {"type": "meta",  "tools_used": [...], "rca_performed": bool}
      {"type": "token", "content": "..."}
      {"type": "done",  "follow_ups": [...]}
      {"type": "error", "message": "..."}
    """
    if not query:
        yield {"type": "error", "message": "Empty query"}
        return

    # ── Generic / conversational fast-path — skip tools and RCA ──────────────
    if is_generic_query(query):
        yield {"type": "meta", "tools_used": [], "rca_performed": False}
        try:
            stream = await client.chat.completions.create(
                model=MODEL,
                messages=_build_generic_messages(query, history),
                temperature=0.7,
                max_tokens=220,
                stream=True,
            )
            async for chunk in stream:
                token = chunk.choices[0].delta.content
                if token:
                    yield {"type": "token", "content": token}
        except Exception as exc:
            yield {"type": "token", "content": f"Hi! I'm StockSense AI — your inventory advisor. Ask me about stock, margins, suppliers, or customers. *(Error: {str(exc)[:60]})*"}
        yield {"type": "done", "follow_ups": [
            "Which SKUs need urgent reorder?",
            "What's my current gross margin?",
            "Show me overdue customer payments",
        ]}
        return
    # ─────────────────────────────────────────────────────────────────────────

    # Step 1: Tool selection
    selected_tools = select_tools(query, mode)

    # Step 2: Fetch tool data (parallel)
    tool_data = await gather_tool_data(selected_tools, query)

    # Step 3: RCA
    rca_performed, rca_context = await _run_rca_if_needed(mode, query, tool_data)

    # Yield metadata so frontend can show tools/RCA chips immediately
    yield {"type": "meta", "tools_used": selected_tools, "rca_performed": rca_performed}

    # Step 4: Build messages
    messages = _build_messages(query, mode, tool_data, rca_context, history)

    # Step 5: Stream GPT-4o tokens
    max_tokens = {"ask": 500, "explain": 1000, "act": 800}.get(mode, 700)
    try:
        stream = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.15,
            max_tokens=max_tokens,
            stream=True,
            presence_penalty=0.05,
            frequency_penalty=0.1,
        )
        async for chunk in stream:
            token = chunk.choices[0].delta.content
            if token:
                yield {"type": "token", "content": token}

    except Exception as exc:
        fallback = _fallback_response(query, tool_data, mode, str(exc))
        for word in fallback.split():
            yield {"type": "token", "content": word + " "}
        yield {"type": "done", "follow_ups": []}
        return

    # Step 6: Generate follow-up questions (non-blocking, runs after stream)
    follow_ups = await _generate_follow_ups(query, mode)
    yield {"type": "done", "follow_ups": follow_ups}


# ── NON-STREAMING FALLBACK ─────────────────────────────────────────────────────
async def process_query(
    query: str,
    mode: str = "ask",
    history: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """Non-streaming version — collects the full stream into a single response."""
    if not query:
        return {"response": "Please ask a question.", "mode": mode, "tools_used": [], "rca_performed": False}

    # ── Generic / conversational fast-path ───────────────────────────────────
    if is_generic_query(query):
        try:
            resp = await client.chat.completions.create(
                model=MODEL,
                messages=_build_generic_messages(query, history),
                temperature=0.7,
                max_tokens=220,
            )
            return {
                "response": resp.choices[0].message.content.strip(),
                "mode": mode,
                "tools_used": [],
                "rca_performed": False,
            }
        except Exception as exc:
            return {
                "response": f"Hi! I'm StockSense AI — your inventory intelligence advisor. How can I help you today? *(Error: {str(exc)[:60]})*",
                "mode": mode,
                "tools_used": [],
                "rca_performed": False,
            }
    # ─────────────────────────────────────────────────────────────────────────

    selected_tools = select_tools(query, mode)
    tool_data = await gather_tool_data(selected_tools, query)
    rca_performed, rca_context = await _run_rca_if_needed(mode, query, tool_data)
    messages = _build_messages(query, mode, tool_data, rca_context, history)

    max_tokens = {"ask": 500, "explain": 1000, "act": 800}.get(mode, 700)
    try:
        resp = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.15,
            max_tokens=max_tokens,
            presence_penalty=0.05,
            frequency_penalty=0.1,
        )
        answer = resp.choices[0].message.content.strip()
    except Exception as exc:
        answer = _fallback_response(query, tool_data, mode, str(exc))

    return {
        "response": answer,
        "mode": mode,
        "tools_used": selected_tools,
        "rca_performed": rca_performed,
    }


def _fallback_response(query: str, tool_data: dict, mode: str, error: str) -> str:
    """Rule-based fallback when OpenAI is unavailable."""
    q = query.lower()
    stock = tool_data.get("stock", {})
    finance = tool_data.get("finance", {})

    # Generic greeting fallback
    if is_generic_query(query):
        return (
            "👋 Hi! I'm **StockSense AI** — your inventory intelligence advisor.\n\n"
            "I can help you with:\n"
            "- 📦 Stock levels, reorder alerts, dead stock recovery\n"
            "- 💰 Margin analysis and cash flow\n"
            "- 🏭 Supplier scorecards and procurement\n"
            "- 👥 Customer collections and churn risk\n\n"
            "What would you like to explore today?"
        )

    if any(w in q for w in ["reorder", "order", "low stock", "stockout"]):
        critical = stock.get("critical_low", [])
        if critical:
            items = ", ".join(f"{s['sku']} ({s['days_cover']}d left)" for s in critical)
            return (
                f"⚠️ **Critical reorder needed**: {items}.\n\n"
                f"Place PO with Century Plyboards immediately (96% on-time, ₹8.4/sheet freight).\n\n"
                f"*[OpenAI unavailable — check OPENAI_API_KEY in backend/.env. Error: {error[:80]}]*"
            )

    if any(w in q for w in ["dead stock", "ageing", "aging"]):
        dead = stock.get("dead_stock", [])
        items = ", ".join(f"{s['sku']} ({s['value']})" for s in dead) if dead else "₹4.2L total"
        return (
            f"**Dead stock**: {items}.\n\n"
            f"Action: 12% discount to top contractors + bundle with 18mm BWP orders.\n\n"
            f"*[OpenAI unavailable. Error: {error[:60]}]*"
        )

    if any(w in q for w in ["margin", "profit", "revenue"]):
        return (
            f"**Revenue MTD**: {finance.get('revenue_mtd', '₹28.4L')} | "
            f"**Gross margin**: {finance.get('gross_margin', '22.4%')}\n\n"
            f"⚠️ 8mm Flexi true margin is only 6.7% after Gauri freight costs.\n\n"
            f"*[OpenAI unavailable. Error: {error[:60]}]*"
        )

    return (
        f"**Key metrics**: Stock ₹38.6L | Revenue MTD ₹28.4L (+9.2%) | "
        f"⚠️ 18mm BWP only 8 days cover — order from Century now.\n\n"
        f"*[OpenAI unavailable — add OPENAI_API_KEY to backend/.env. Error: {error[:80]}]*"
    )
