"""
MCP (Model Context Protocol) Tools for StockSense AI
Structured data providers that feed live business context to the LLM.

Data source priority:
  1. MySQL database (if MYSQL_HOST is set in .env and connection succeeds)
  2. Mock data (fallback -- always works, no setup required)

The chatbot, streaming, RCA, and all other features are unaffected regardless
of whether MySQL is connected or not.
"""
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# Try to load DB layer (graceful if aiomysql not installed or not configured)
try:
    from app.db.connection import get_pool
    from app.db import queries as db_q
    _DB_LAYER_AVAILABLE = True
except ImportError:
    _DB_LAYER_AVAILABLE = False
    logger.info("DB layer not available (aiomysql not installed) -- using mock data")


async def _try_db(fn_name: str, query: str) -> Optional[dict]:
    """Attempt a DB query. Returns None on any failure so caller uses mock."""
    if not _DB_LAYER_AVAILABLE:
        return None
    try:
        pool = await get_pool()
        if pool is None:
            return None
        fn = getattr(db_q, fn_name)
        result = await fn(pool, query)
        logger.debug("DB query OK: %s", fn_name)
        return result
    except Exception as exc:
        logger.warning("DB query failed (%s: %s) -- falling back to mock", fn_name, exc)
        return None


# =============================================================================
# TOOL FUNCTIONS — each tries DB first, falls back to rich mock data
# =============================================================================

async def stock_tool(query: Optional[str] = None) -> dict:
    """Real-time stock levels, SKU health, ABC analysis, godown positions."""
    db_result = await _try_db("query_stock", query or "")
    if db_result:
        return db_result
    # Mock fallback
    return {
        "total_stock_value": "Rs.38.6L",
        "critical_low": [
            {"sku": "18mm BWP (8x4)", "brand": "Century", "stock": 140, "days_cover": 8,
             "daily_sale": 17, "reorder_level": 120, "lead_time": "6 days", "revenue_at_risk": "Rs.1.9L"},
            {"sku": "12mm BWP (8x4)", "brand": "Century", "stock": 220, "days_cover": 11,
             "daily_sale": 20, "reorder_level": 200, "lead_time": "6 days", "revenue_at_risk": "Rs.1.1L"},
        ],
        "dead_stock": [
            {"sku": "6mm Gurjan BWP", "days_old": 118, "stock": 186, "value": "Rs.1.79L",
             "last_sale": "No movement in 90+ days", "action": "12% discount to contractors"},
            {"sku": "4mm MR Plain", "days_old": 97, "stock": 240, "value": "Rs.1.39L",
             "last_sale": "4 sheets in 30 days", "action": "Bundle with 18mm BWP orders"},
            {"sku": "19mm Commercial", "days_old": 91, "stock": 102, "value": "Rs.0.99L",
             "last_sale": "2 sheets in 30 days", "action": "Return to supplier if policy allows"},
        ],
        "overstock": [
            {"sku": "8mm Flexi BWP", "stock": 110, "days_cover": 28, "value": "Rs.0.70L"},
            {"sku": "10mm Flexi BWP", "stock": 88, "days_cover": 74, "value": "Rs.1.09L"},
        ],
        "healthy_skus": ["12mm MR Plain (18d cover)", "Laminate Teak (32d cover)", "18mm MR (22d cover)"],
        "inventory_accuracy": "96.8%",
        "stock_turnover": "4.2x",
        "gmroi": "Rs.1.98",
        "godowns": {
            "Main WH (HSR Layout)":   {"value": "Rs.28.4L", "sheets": 1420, "capacity_pct": 82},
            "Showroom (Koramangala)": {"value": "Rs.6.8L",  "sheets": 280,  "capacity_pct": 45},
            "Overflow (Whitefield)":  {"value": "Rs.3.4L",  "sheets": 152,  "capacity_pct": 28},
        },
        "abc_class": {
            "A_skus": ["18mm BWP", "12mm BWP", "12mm MR", "Laminates Teak"],
            "A_revenue_share": "78%", "B_count": 8, "C_count": 30,
        },
        "true_landed_cost": {
            "18mm BWP":      {"buy": 1420, "freight": 42,  "loading": 18, "wastage": 14, "true_cost": 1494, "sell": 1920, "real_margin": "22.2%", "stated_margin": "26.0%"},
            "8mm Flexi BWP": {"buy": 640,  "freight": 110, "loading": 15, "wastage": 19, "true_cost": 784,  "sell": 840,  "real_margin": "6.7%",  "stated_margin": "23.8%"},
            "12mm MR Plain": {"buy": 720,  "freight": 56,  "loading": 12, "wastage": 7,  "true_cost": 795,  "sell": 940,  "real_margin": "15.4%", "stated_margin": "23.4%"},
        },
        "data_source": "mock",
    }


async def demand_tool(query: Optional[str] = None) -> dict:
    """Demand forecasting, trends, seasonal analysis, and AI demand signals."""
    db_result = await _try_db("query_demand", query or "")
    if db_result:
        return db_result
    return {
        "current_month_top": [
            {"sku": "18mm BWP", "curr": 480, "f30": 596, "f60": 680, "f90": 712,
             "signal": "SURGE +24%", "action": "Pre-order 300 extra sheets NOW"},
            {"sku": "12mm MR",  "curr": 420, "f30": 448, "f60": 436, "f90": 380,
             "signal": "STABLE +6.7%", "action": "Normal ordering cycle"},
            {"sku": "12mm BWP", "curr": 380, "f30": 432, "f60": 498, "f90": 524,
             "signal": "GROWING +13.7%", "action": "Increase stock by 25%"},
            {"sku": "Laminates","curr": 320, "f30": 298, "f60": 274, "f90": 250,
             "signal": "DECLINING -6.9%", "action": "Reduce next order quantity"},
        ],
        "seasonal_insight": "Oct-Dec historically strongest quarter (+28%). Stock up BWP grades by September.",
        "demand_drivers": [
            "Construction activity up 18% in HSR/Koramangala zone",
            "Interior firm orders spiking -- Diwali renovation season approaching",
            "18mm BWP shortage in market -- competitors currently out of stock",
        ],
        "risk_factors": [
            "Monsoon slowdown expected July-August",
            "Century Plyboards price hike rumoured next quarter",
            "New competitor opened in BTM Layout last month",
        ],
        "data_source": "mock",
    }


async def supplier_tool(query: Optional[str] = None) -> dict:
    """Supplier scorecards, PO status, GRN matching, delivery performance."""
    db_result = await _try_db("query_supplier", query or "")
    if db_result:
        return db_result
    return {
        "suppliers": [
            {
                "name": "Century Plyboards", "on_time_pct": 96, "avg_delay_days": 0.4,
                "price_vs_market": "-3% (below market -- excellent)", "lead_time": "5-6 days",
                "freight_cost": "Rs.8.4/sheet (full truck)", "grn_match_rate": "100%",
                "recommendation": "PREFERRED -- expand orders",
                "open_pos": 2, "pending_value": "Rs.6.8L",
            },
            {
                "name": "Gauri Laminates", "on_time_pct": 68, "avg_delay_days": 3.2,
                "price_vs_market": "+6% (above market)", "lead_time": "10-11 days",
                "freight_cost": "Rs.22/sheet (42% truck fill, 240 km)",
                "true_landed_premium": "+11% above market when freight included",
                "grn_match_rate": "82% (18% failure rate)", "delivery_failures_month": 3,
                "recommendation": "REVIEW -- consider alternate sourcing",
                "open_pos": 1, "pending_value": "Rs.2.8L",
                "overdue": "PO-7731 overdue 4 days",
            },
            {
                "name": "Greenply Industries", "on_time_pct": 88, "avg_delay_days": 1.2,
                "price_vs_market": "+1% (slightly above)", "lead_time": "7 days",
                "freight_cost": "Rs.12.6/sheet", "grn_match_rate": "94%",
                "recommendation": "GOOD -- second preferred supplier",
                "open_pos": 1, "pending_value": "Rs.2.8L",
                "overdue": "PO-7734 overdue 2 days",
            },
        ],
        "total_open_pos": 8,
        "open_po_value": "Rs.12.4L",
        "overdue_pos": ["PO-7734 (Greenply, +2d)", "PO-7731 (Gauri, +4d)"],
        "grn_match_rate": "96%",
        "mismatches_month": "3 (Rs.8,400 total)",
        "data_source": "mock",
    }


async def customer_tool(query: Optional[str] = None) -> dict:
    """Customer intelligence, receivables, risk scoring, discount analysis."""
    db_result = await _try_db("query_customer", query or "")
    if db_result:
        return db_result
    return {
        "total_customers": 148,
        "segments": {
            "Contractors (44%)":    {"avg_margin": "19%", "avg_dso": 28, "top": "Mehta Constructions Rs.3.8L/mo"},
            "Interior Firms (26%)": {"avg_margin": "31%", "avg_dso": 18, "top": "Design Studio Patel Rs.1.6L/mo"},
            "Retailers (18%)":      {"avg_margin": "21%", "avg_dso": 22, "top": "Kumar & Sons Rs.2.1L/mo"},
            "Carpenters (12%)":     {"avg_margin": "22%", "avg_dso": 12, "top": "Raj Carpentry Works Rs.0.9L/mo"},
        },
        "at_risk": [
            {"name": "City Interiors",        "days_silent": 47, "monthly_value": "Rs.2.4L",
             "margin": "28.4%", "reason": "Possibly switched to competitor"},
            {"name": "Gupta Materials Retail","days_silent": 38, "monthly_value": "Rs.0.8L",
             "reason": "Price complaint logged last month"},
        ],
        "overdue_receivables": [
            {"customer": "Sharma Constructions", "amount": "Rs.3.4L", "days_overdue": 78, "risk": "HIGH"},
            {"customer": "Mehta Brothers",       "amount": "Rs.2.1L", "days_overdue": 52, "risk": "MEDIUM"},
            {"customer": "Patel Contractors",    "amount": "Rs.1.8L", "days_overdue": 44, "risk": "MEDIUM"},
            {"customer": "Rajan Interior",       "amount": "Rs.1.2L", "days_overdue": 31, "risk": "LOW"},
            {"customer": "Others (12 accounts)", "amount": "Rs.4.3L", "days_overdue": "<30", "risk": "LOW"},
        ],
        "total_outstanding": "Rs.12.8L",
        "discount_leakage": {
            "Sharma Constructions": "9.2% avg vs 4.8% standard -- costs Rs.22,100/month",
            "SK Traders": "6.5% -- costs Rs.8,400/month",
        },
        "data_source": "mock",
    }


async def finance_tool(query: Optional[str] = None) -> dict:
    """Financial KPIs, GST status, working capital, profitability."""
    db_result = await _try_db("query_finance", query or "")
    if db_result:
        return db_result
    return {
        "revenue_mtd": "Rs.28.4L",
        "revenue_growth": "+9.2% MoM",
        "gross_profit_mtd": "Rs.6.36L",
        "gross_margin": "22.4%",
        "working_capital_days": 48,
        "cash_cycle": "DIO 22 + DSO 34 - DPO 8 = 48 days (target <40)",
        "outstanding_receivables": "Rs.12.8L",
        "dead_stock_locked": "Rs.7.8L",
        "net_operating_cash": "Rs.4.1L",
        "gst": {
            "output_collected": "Rs.5.11L",
            "itc_available": "Rs.4.28L",
            "net_payable": "Rs.0.83L",
            "unclaimed_itc": "Rs.0.14L (3 Gauri invoices missing from GSTR-2B)",
            "gstr1": "Filed", "gstr3b": "PENDING -- due 20 Apr",
            "ewaybills_expiring_today": 2,
        },
        "margin_by_sku": {
            "18mm BWP (true landed)":   "22.2% (not 26% -- freight/wastage hidden)",
            "12mm BWP":                 "25.6%",
            "8mm Flexi BWP (true landed)": "6.7% CRITICAL (Gauri freight Rs.110/sh)",
            "Commercial grade":         "8.2%",
        },
        "returns_mtd": "Rs.0.82L",
        "return_causes": ["Damage in transit Rs.0.42L", "Wrong grade shipped Rs.0.28L", "Customer changed mind Rs.0.12L"],
        "data_source": "mock",
    }


async def order_tool(query: Optional[str] = None) -> dict:
    """Order pipeline, fulfilment SLA, dispatch status."""
    db_result = await _try_db("query_order", query or "")
    if db_result:
        return db_result
    return {
        "today_orders": 24,
        "dispatched": 18,
        "pending": 6,
        "pending_details": [
            {"order": "ORD-2847", "customer": "Mehta Constructions", "value": "Rs.3.8L",
             "delayed": "30 hours", "reason": "18mm BWP stock shortage"},
            {"order": "ORD-2852", "customer": "Patel Contractors", "value": "Rs.1.2L",
             "delayed": "4 hours", "reason": "QC pending on MR grade"},
        ],
        "dispatch_sla_hit": "87% (target 95%)",
        "avg_fulfillment_time": "3.2 hours",
        "order_trend": "+6 vs yesterday",
        "issues": [
            "QC bottleneck on MR grades: 48 min avg vs 12 min for BWP",
            "3 wrong-grade picking errors this week",
            "Mehta Constructions order delayed 30 hrs -- Rs.3.8L/month account at risk",
        ],
        "data_source": "mock",
    }


async def freight_tool(query: Optional[str] = None) -> dict:
    """Freight costs, vehicle utilisation, lane analysis, consolidation opportunities."""
    db_result = await _try_db("query_freight", query or "")
    if db_result:
        return db_result
    return {
        "outbound_cost_per_sheet": "Rs.18.4 (target Rs.16)",
        "vehicle_utilisation": "68% (target 85%)",
        "inbound_costs": {
            "Century Plyboards":  "Rs.8.4/sheet (full truck -- excellent)",
            "Gauri Laminates":    "Rs.22/sheet (42% fill, 240 km -- very high)",
            "Greenply Industries":"Rs.12.6/sheet",
        },
        "outbound_lanes": [
            {"lane": "Whitefield",      "cost_per_sheet": 14, "fill_pct": 78, "status": "BEST"},
            {"lane": "Koramangala",     "cost_per_sheet": 16, "fill_pct": 72, "status": "OK"},
            {"lane": "HSR Layout",      "cost_per_sheet": 17, "fill_pct": 65, "status": "OK"},
            {"lane": "BTM Layout",      "cost_per_sheet": 19, "fill_pct": 58, "status": "HIGH"},
            {"lane": "Electronic City", "cost_per_sheet": 24, "fill_pct": 54, "status": "WORST"},
        ],
        "consolidation_opportunity": "Merge 3 Whitefield deliveries today (Mehta 40sh + Patel 30sh + Gupta 10sh) -- save Rs.2,400",
        "today_savings_potential": "Rs.2,400",
        "data_source": "mock",
    }


async def email_tool(query: Optional[str] = None) -> dict:
    """Draft communications and action triggers."""
    recipient = "supplier" if "supplier" in (query or "").lower() else "customer"
    return {
        "status": "Draft Ready",
        "ref": f"DRAFT-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "action": f"AI drafted {recipient} communication from your query",
        "next_step": "Review draft -> confirm -> send",
        "data_source": "mock",
    }


TOOLS = {
    "stock":    stock_tool,
    "demand":   demand_tool,
    "supplier": supplier_tool,
    "customer": customer_tool,
    "finance":  finance_tool,
    "order":    order_tool,
    "freight":  freight_tool,
    "email":    email_tool,
}
