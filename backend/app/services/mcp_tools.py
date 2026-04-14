"""
MCP (Model Context Protocol) Tools for StockSense AI
Structured data providers that feed live business context to the LLM.
"""
from datetime import datetime
from typing import Optional


async def stock_tool(query: Optional[str] = None) -> dict:
    """Real-time stock levels, SKU health, ABC analysis, godown positions."""
    return {
        "total_stock_value": "₹38.6L",
        "critical_low": [
            {"sku": "18mm BWP (8×4)", "brand": "Century", "stock": 140, "days_cover": 8,
             "daily_sale": 17, "reorder_level": 120, "lead_time": "6 days", "revenue_at_risk": "₹1.9L"},
            {"sku": "12mm BWP (8×4)", "brand": "Century", "stock": 220, "days_cover": 11,
             "daily_sale": 20, "reorder_level": 200, "lead_time": "6 days", "revenue_at_risk": "₹1.1L"},
        ],
        "dead_stock": [
            {"sku": "6mm Gurjan BWP", "days_old": 118, "stock": 186, "value": "₹1.79L",
             "last_sale": "No movement in 90+ days", "action": "12% discount to contractors"},
            {"sku": "4mm MR Plain", "days_old": 97, "stock": 240, "value": "₹1.39L",
             "last_sale": "4 sheets in 30 days", "action": "Bundle with 18mm BWP orders"},
            {"sku": "19mm Commercial", "days_old": 91, "stock": 102, "value": "₹0.99L",
             "last_sale": "2 sheets in 30 days", "action": "Return to supplier if policy allows"},
        ],
        "overstock": [
            {"sku": "8mm Flexi BWP", "stock": 110, "days_cover": 28, "value": "₹0.70L"},
            {"sku": "10mm Flexi BWP", "stock": 88, "days_cover": 74, "value": "₹1.09L"},
        ],
        "healthy_skus": ["12mm MR Plain (18d cover)", "Laminate Teak (32d cover)", "18mm MR (22d cover)"],
        "inventory_accuracy": "96.8%",
        "stock_turnover": "4.2×",
        "gmroi": "₹1.98",
        "godowns": {
            "Main WH (HSR Layout)": {"value": "₹28.4L", "sheets": 1420, "capacity_pct": 82},
            "Showroom (Koramangala)": {"value": "₹6.8L", "sheets": 280, "capacity_pct": 45},
            "Overflow (Whitefield)": {"value": "₹3.4L", "sheets": 152, "capacity_pct": 28},
        },
        "abc_class": {
            "A_skus": ["18mm BWP", "12mm BWP", "12mm MR", "Laminates Teak"],
            "A_revenue_share": "78%",
            "B_count": 8,
            "C_count": 30,
        },
        "valuation": {
            "weighted_avg": "₹38.6L (AI recommended for GST)",
            "fifo": "₹37.8L",
            "lifo": "₹39.4L",
            "last_purchase": "₹40.1L",
        },
        "true_landed_cost": {
            "18mm BWP": {"buy": 1420, "freight": 42, "loading": 18, "wastage": 14, "true_cost": 1494, "sell": 1920, "real_margin": "22.2%", "stated_margin": "26.0%"},
            "8mm Flexi BWP": {"buy": 640, "freight": 110, "loading": 15, "wastage": 19, "true_cost": 784, "sell": 840, "real_margin": "6.7%", "stated_margin": "23.8%"},
            "12mm MR Plain": {"buy": 720, "freight": 56, "loading": 12, "wastage": 7, "true_cost": 795, "sell": 940, "real_margin": "15.4%", "stated_margin": "23.4%"},
        },
    }


async def demand_tool(query: Optional[str] = None) -> dict:
    """Demand forecasting, trends, seasonal analysis, and AI demand signals."""
    return {
        "current_month_top": [
            {"sku": "18mm BWP", "curr": 480, "f30": 596, "f60": 680, "f90": 712,
             "signal": "SURGE +24%", "action": "Pre-order 300 extra sheets NOW"},
            {"sku": "12mm MR", "curr": 420, "f30": 448, "f60": 436, "f90": 380,
             "signal": "STABLE +6.7%", "action": "Normal ordering cycle"},
            {"sku": "12mm BWP", "curr": 380, "f30": 432, "f60": 498, "f90": 524,
             "signal": "GROWING +13.7%", "action": "Increase stock by 25%"},
            {"sku": "Laminates", "curr": 320, "f30": 298, "f60": 274, "f90": 250,
             "signal": "DECLINING -6.9%", "action": "Reduce next order quantity"},
        ],
        "seasonal_insight": "Oct–Dec historically strongest quarter (+28%). Stock up BWP grades by September.",
        "demand_drivers": [
            "Construction activity up 18% in HSR/Koramangala zone",
            "Interior firm orders spiking — Diwali renovation season approaching",
            "18mm BWP shortage in market — competitors currently out of stock",
        ],
        "risk_factors": [
            "Monsoon slowdown expected July–August",
            "Century Plyboards price hike rumoured next quarter",
            "New competitor opened in BTM Layout last month",
        ],
    }


async def supplier_tool(query: Optional[str] = None) -> dict:
    """Supplier scorecards, PO status, GRN matching, delivery performance."""
    return {
        "suppliers": [
            {
                "name": "Century Plyboards", "on_time_pct": 96, "avg_delay_days": 0.4,
                "price_vs_market": "-3% (below market — excellent)", "lead_time": "5–6 days",
                "freight_cost": "₹8.4/sheet (full truck)", "grn_match_rate": "100%",
                "recommendation": "PREFERRED — expand orders",
                "open_pos": 2, "pending_value": "₹6.8L",
            },
            {
                "name": "Gauri Laminates", "on_time_pct": 68, "avg_delay_days": 3.2,
                "price_vs_market": "+6% (above market)", "lead_time": "10–11 days",
                "freight_cost": "₹22/sheet (42% truck fill, 240 km)",
                "true_landed_premium": "+11% above market when freight included",
                "grn_match_rate": "82% (18% failure rate)", "delivery_failures_month": 3,
                "recommendation": "REVIEW — consider alternate sourcing",
                "open_pos": 1, "pending_value": "₹2.8L",
                "overdue": "PO-7731 overdue 4 days",
            },
            {
                "name": "Greenply Industries", "on_time_pct": 88, "avg_delay_days": 1.2,
                "price_vs_market": "+1% (slightly above)", "lead_time": "7 days",
                "freight_cost": "₹12.6/sheet", "grn_match_rate": "94%",
                "recommendation": "GOOD — second preferred supplier",
                "open_pos": 1, "pending_value": "₹2.8L",
                "overdue": "PO-7734 overdue 2 days",
            },
        ],
        "total_open_pos": 8,
        "open_po_value": "₹12.4L",
        "overdue_pos": ["PO-7734 (Greenply, +2d)", "PO-7731 (Gauri, +4d)"],
        "grn_match_rate": "96%",
        "mismatches_month": "3 (₹8,400 total)",
    }


async def customer_tool(query: Optional[str] = None) -> dict:
    """Customer intelligence, receivables, risk scoring, discount analysis."""
    return {
        "total_customers": 148,
        "segments": {
            "Contractors (44%)": {"avg_margin": "19%", "avg_dso": 28, "top": "Mehta Constructions ₹3.8L/mo"},
            "Interior Firms (26%)": {"avg_margin": "31%", "avg_dso": 18, "top": "Design Studio Patel ₹1.6L/mo"},
            "Retailers (18%)": {"avg_margin": "21%", "avg_dso": 22, "top": "Kumar & Sons ₹2.1L/mo"},
            "Carpenters (12%)": {"avg_margin": "22%", "avg_dso": 12, "top": "Raj Carpentry Works ₹0.9L/mo"},
        },
        "at_risk": [
            {"name": "City Interiors", "days_silent": 47, "monthly_value": "₹2.4L",
             "margin": "28.4%", "reason": "Possibly switched to competitor"},
            {"name": "Gupta Materials Retail", "days_silent": 38, "monthly_value": "₹0.8L",
             "reason": "Price complaint logged last month"},
        ],
        "overdue_receivables": [
            {"customer": "Sharma Constructions", "amount": "₹3.4L", "days_overdue": 78, "risk": "HIGH"},
            {"customer": "Mehta Brothers", "amount": "₹2.1L", "days_overdue": 52, "risk": "MEDIUM"},
            {"customer": "Patel Contractors", "amount": "₹1.8L", "days_overdue": 44, "risk": "MEDIUM"},
            {"customer": "Rajan Interior", "amount": "₹1.2L", "days_overdue": 31, "risk": "LOW"},
            {"customer": "Others (12 accounts)", "amount": "₹4.3L", "days_overdue": "<30", "risk": "LOW"},
        ],
        "total_outstanding": "₹12.8L",
        "discount_leakage": {
            "Sharma Constructions": "9.2% avg vs 4.8% standard — costs ₹22,100/month",
            "SK Traders": "6.5% — costs ₹8,400/month",
        },
    }


async def finance_tool(query: Optional[str] = None) -> dict:
    """Financial KPIs, GST status, working capital, profitability."""
    return {
        "revenue_mtd": "₹28.4L",
        "revenue_growth": "+9.2% MoM",
        "gross_profit_mtd": "₹6.36L",
        "gross_margin": "22.4%",
        "working_capital_days": 48,
        "cash_cycle": "DIO 22 + DSO 34 − DPO 8 = 48 days (target <40)",
        "outstanding_receivables": "₹12.8L",
        "dead_stock_locked": "₹7.8L",
        "net_operating_cash": "₹4.1L",
        "gst": {
            "output_collected": "₹5.11L",
            "itc_available": "₹4.28L",
            "net_payable": "₹0.83L",
            "unclaimed_itc": "₹0.14L (3 Gauri invoices missing from GSTR-2B)",
            "gstr1": "Filed", "gstr3b": "PENDING — due 20 Apr",
            "ewaybills_expiring_today": 2,
        },
        "margin_by_sku": {
            "18mm BWP (true landed)": "22.2% (not 26% — freight/wastage hidden)",
            "12mm BWP": "25.6%",
            "8mm Flexi BWP (true landed)": "6.7% CRITICAL (Gauri freight ₹110/sh)",
            "Commercial grade": "8.2%",
        },
        "returns_mtd": "₹0.82L",
        "return_causes": ["Damage in transit ₹0.42L", "Wrong grade shipped ₹0.28L", "Customer changed mind ₹0.12L"],
    }


async def order_tool(query: Optional[str] = None) -> dict:
    """Order pipeline, fulfilment SLA, dispatch status."""
    return {
        "today_orders": 24,
        "dispatched": 18,
        "pending": 6,
        "pending_details": [
            {"order": "ORD-2847", "customer": "Mehta Constructions", "value": "₹3.8L",
             "delayed": "30 hours", "reason": "18mm BWP stock shortage"},
            {"order": "ORD-2852", "customer": "Patel Contractors", "value": "₹1.2L",
             "delayed": "4 hours", "reason": "QC pending on MR grade"},
        ],
        "dispatch_sla_hit": "87% (target 95%)",
        "avg_fulfillment_time": "3.2 hours",
        "order_trend": "+6 vs yesterday",
        "issues": [
            "QC bottleneck on MR grades: 48 min avg vs 12 min for BWP",
            "3 wrong-grade picking errors this week",
            "Mehta Constructions order delayed 30 hrs — ₹3.8L/month account at risk",
        ],
    }


async def freight_tool(query: Optional[str] = None) -> dict:
    """Freight costs, vehicle utilisation, lane analysis, consolidation opportunities."""
    return {
        "outbound_cost_per_sheet": "₹18.4 (target ₹16)",
        "vehicle_utilisation": "68% (target 85%)",
        "inbound_costs": {
            "Century Plyboards": "₹8.4/sheet (full truck — excellent)",
            "Gauri Laminates": "₹22/sheet (42% fill, 240 km — very high)",
            "Greenply Industries": "₹12.6/sheet",
        },
        "outbound_lanes": [
            {"lane": "Whitefield", "cost_per_sheet": 14, "fill_pct": 78, "status": "BEST"},
            {"lane": "Koramangala", "cost_per_sheet": 16, "fill_pct": 72, "status": "OK"},
            {"lane": "HSR Layout", "cost_per_sheet": 17, "fill_pct": 65, "status": "OK"},
            {"lane": "BTM Layout", "cost_per_sheet": 19, "fill_pct": 58, "status": "HIGH"},
            {"lane": "Electronic City", "cost_per_sheet": 24, "fill_pct": 54, "status": "WORST"},
        ],
        "consolidation_opportunity": "Merge 3 Whitefield deliveries today (Mehta 40sh + Patel 30sh + Gupta 10sh) → save ₹2,400",
        "today_savings_potential": "₹2,400",
    }


async def email_tool(query: Optional[str] = None) -> dict:
    """Draft communications and action triggers."""
    recipient = "supplier" if "supplier" in (query or "").lower() else "customer"
    return {
        "status": "Draft Ready",
        "ref": f"DRAFT-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "action": f"AI drafted {recipient} communication from your query",
        "next_step": "Review draft → confirm → send",
    }


TOOLS = {
    "stock": stock_tool,
    "demand": demand_tool,
    "supplier": supplier_tool,
    "customer": customer_tool,
    "finance": finance_tool,
    "order": order_tool,
    "freight": freight_tool,
    "email": email_tool,
}
