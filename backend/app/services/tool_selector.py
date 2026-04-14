"""
Intelligent Tool Selector for StockSense AI
Routes natural language queries to the appropriate MCP tools.
Mode-aware: explain/act modes pull broader context automatically.
"""
from typing import List
import re

# ── GENERIC QUERY DETECTION ────────────────────────────────────────────────────
_GENERIC_EXACT = {
    "hi", "hey", "hello", "hii", "helo", "heya", "howdy", "yo",
    "good morning", "good afternoon", "good evening", "good night",
    "thanks", "thank you", "thank u", "ty", "thx", "thnx",
    "bye", "goodbye", "see you", "see ya", "cya", "take care",
    "ok", "okay", "ok cool", "got it", "understood", "noted",
    "sure", "cool", "great", "nice", "wow", "awesome", "perfect",
    "help", "need help", "i need help", "can you help", "can you help me",
    "who are you", "what are you", "what is this", "what can you do",
    "how does this work", "how do i use this", "how can you help me",
    "what do you do", "tell me about yourself",
    "how are you", "how r u", "how r you", "how are u", "you there",
    "are you there", "are you working", "test", "testing",
    "start", "begin", "get started", "what should i ask",
}

_GENERIC_STARTS = (
    "hi ", "hey ", "hello ", "please help", "i need help with",
    "can you help me", "can u help", "i want to know", "tell me",
    "show me what", "what can", "how can", "where do i",
)

_GENERIC_PATTERNS = [
    r"^(hi|hey|hello|hii)+[!.,?\s]*$",
    r"^(good\s+(morning|afternoon|evening|night))[!.,?\s]*$",
    r"^(thank(s| you| u)|ty|thx)[!.,?\s]*$",
    r"^(bye|goodbye|cya|see\s+ya?)[!.,?\s]*$",
    r"^(ok|okay|cool|great|nice|got\s+it)[!.,?\s]*$",
    r"^(how\s+are\s+(you|u))[!.,?\s?]*$",
    r"^(what\s+(can|do)\s+you\s+do)[?!.,\s]*$",
    r"^(who|what)\s+are\s+you[?!.,\s]*$",
    r"^(test(ing)?)[!.,?\s]*$",
    r"^(help|need\s+help|i\s+need\s+help)[!.,?\s]*$",
    r"^are\s+you\s+(there|working|online)[?!.,\s]*$",
    r"^(get\s+started|start|begin)[!.,?\s]*$",
]

_COMPILED = [re.compile(p, re.IGNORECASE) for p in _GENERIC_PATTERNS]


def is_generic_query(query: str) -> bool:
    """Return True if query is conversational/generic (no inventory intent)."""
    q = query.strip().lower().rstrip("!?.,")
    if q in _GENERIC_EXACT:
        return True
    if any(q.startswith(s) for s in _GENERIC_STARTS) and len(q) < 40:
        return True
    if any(p.match(query.strip()) for p in _COMPILED):
        return True
    return False

KEYWORD_MAP = {
    "stock": [
        "stock", "inventory", "sku", "sheets", "reorder", "stockout",
        "low stock", "dead stock", "overstock", "ageing", "aging",
        "batch", "godown", "warehouse", "on hand", "valuation",
        "landed cost", "margin per sku", "abc", "critical", "cover",
        "how many", "quantity", "units", "18mm", "12mm", "8mm",
    ],
    "demand": [
        "demand", "forecast", "sell", "selling", "sales trend",
        "season", "monsoon", "diwali", "festive", "slow mover",
        "fast mover", "moving", "velocity", "next month", "predict",
        "will sell", "how much", "popular",
    ],
    "supplier": [
        "supplier", "vendor", "purchase", "po", "grn", "procurement",
        "delivery", "lead time", "gauri", "century", "greenply",
        "buy from", "order from", "source", "3 way match", "gst itc",
        "overdue po", "pending po", "price hike",
    ],
    "customer": [
        "customer", "client", "account", "who owes", "receivable",
        "credit", "at risk", "churn", "silent", "no order",
        "contractor", "interior firm", "retailer", "carpenter",
        "discount", "outstanding", "payment", "mehta", "sharma",
        "patel", "kumar", "city interiors", "overdue", "dso",
    ],
    "finance": [
        "margin", "profit", "revenue", "cash", "gst", "tax",
        "discount leakage", "working capital", "receivable", "payable",
        "finance", "cash flow", "return", "gmroi", "true cost",
        "actual margin", "earning", "income", "gstr", "tds",
    ],
    "order": [
        "order", "dispatch", "fulfil", "pending", "shipment", "ship",
        "sla", "delayed order", "pick", "pack", "deliver today",
        "pending dispatch", "how many orders", "ORD-",
    ],
    "freight": [
        "freight", "transport", "logistics", "truck", "lane",
        "whitefield", "electronic city", "koramangala", "btm",
        "delivery cost", "per sheet cost", "vehicle", "consolidate",
        "route", "inbound cost", "outbound cost",
    ],
    "email": [
        "send", "email", "message", "contact", "draft",
        "notify", "alert", "whatsapp", "remind", "write to",
        "communicate",
    ],
}

# Tools always included for explain/why queries
EXPLAIN_TOOLS = ["stock", "supplier", "finance"]
# Tools always included for act mode
ACT_BASE_TOOLS = ["stock", "order"]


def select_tools(query: str, mode: str = "ask") -> List[str]:
    """Select the most relevant tools for a query, respecting mode context."""
    q = query.lower()
    tools: List[str] = []

    for tool, keywords in KEYWORD_MAP.items():
        if any(kw in q for kw in keywords):
            tools.append(tool)

    # Mode-based augmentation
    if mode == "explain" or any(w in q for w in ["why", "cause", "reason", "explain", "problem", "issue", "dropped", "fell", "low", "stuck"]):
        for t in EXPLAIN_TOOLS:
            if t not in tools:
                tools.append(t)

    if mode == "act":
        for t in ACT_BASE_TOOLS:
            if t not in tools:
                tools.append(t)

    # Default fallback — stock + demand + finance covers 85% of dealer questions
    if not tools:
        tools = ["stock", "demand", "finance"]

    # Cap at 5 tools to keep LLM context focused
    return tools[:5]
