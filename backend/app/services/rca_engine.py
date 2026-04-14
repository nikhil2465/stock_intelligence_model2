"""
Root Cause Analysis (RCA) Engine for StockSense AI
Multi-level, 5-Why and Ishikawa-inspired RCA for inventory and business issues.
"""
from typing import List, Dict, Any, Optional


def run_rca(
    stock_data: dict,
    demand_data: Any = None,
    supplier_data: dict = None,
    finance_data: dict = None,
    order_data: dict = None,
    query: str = "",
) -> List[Dict]:
    """Run full RCA across all available data dimensions."""
    issues = []

    # ── STOCK RCA ────────────────────────────────────────────────
    if isinstance(stock_data, dict):
        for item in stock_data.get("critical_low", []):
            issues.append({
                "type": "Critical Stockout Risk",
                "severity": "HIGH",
                "affected": item.get("sku"),
                "root_cause": (
                    f"Current stock of {item.get('stock')} sheets provides only "
                    f"{item.get('days_cover')} days cover at {item.get('daily_sale')} sheets/day demand"
                ),
                "why_chain": [
                    f"Why low? — Reorder trigger at {item.get('reorder_level')} sheets was not actioned in time",
                    "Why missed? — No automated reorder alert configured; manual checking delayed",
                    f"Why no buffer? — Supplier lead time {item.get('lead_time')} not factored into safety stock",
                ],
                "contributing_factors": [
                    f"Demand velocity: {item.get('daily_sale')} sheets/day (higher than forecast)",
                    f"Lead time risk: {item.get('lead_time')} from supplier, no local backup",
                    "Safety stock not calibrated to current demand levels",
                ],
                "business_impact": item.get("revenue_at_risk", "₹1L+") + " revenue at risk if stockout occurs",
                "fix": f"Place PO for 200+ sheets with Century Plyboards TODAY",
                "immediate_action": "Call Century Plyboards sales rep now — they have 96% on-time delivery",
            })

        for item in stock_data.get("dead_stock", []):
            issues.append({
                "type": "Dead Stock — Cash Locked",
                "severity": "MEDIUM",
                "affected": item.get("sku"),
                "root_cause": f"No sales movement for {item.get('days_old')} days — product-market mismatch",
                "why_chain": [
                    "Why not selling? — Demand shifted to alternate grades; this product over-ordered",
                    "Why over-ordered? — Purchase based on old demand patterns, not AI forecast",
                    "Why no clearance action? — No systematic ageing alert or discount trigger in place",
                ],
                "contributing_factors": [
                    "Over-purchasing relative to actual SKU velocity",
                    "No clearance pricing policy for 60-day non-movers",
                    f"Value locked: {item.get('value')} — opportunity cost growing daily",
                ],
                "business_impact": f"{item.get('value')} locked, earning zero return. At 10% cost of capital = ₹{round(int(str(item.get('value', '₹0')).replace('₹','').replace('L','')) * 100000 * 10 // 100 // 12, 0) if 'L' in str(item.get('value','')) else 0} per month wasted.",
                "fix": item.get("action", "Discount 12% + bundle with fast-moving SKU orders"),
                "immediate_action": "Call top 3 contractors today with clearance offer",
            })

    # ── SUPPLIER RCA ──────────────────────────────────────────────
    if isinstance(supplier_data, dict):
        for s in supplier_data.get("suppliers", []):
            if s.get("on_time_pct", 100) < 80:
                issues.append({
                    "type": "Supplier Reliability Failure",
                    "severity": "HIGH",
                    "affected": s.get("name"),
                    "root_cause": f"Only {s.get('on_time_pct')}% on-time delivery — structural supply chain risk",
                    "why_chain": [
                        f"Why delayed? — {s.get('avg_delay_days')} avg delay days; supplier capacity constrained",
                        f"Why still ordering? — No alternate supplier qualified for this SKU",
                        f"Why high cost? — {s.get('price_vs_market')} + {s.get('freight_cost')} freight",
                    ],
                    "contributing_factors": [
                        f"Price premium: {s.get('price_vs_market')}",
                        f"GRN match failures: {s.get('grn_match_rate')}",
                        f"{s.get('delivery_failures_month', 0)} delivery failures this month",
                        "No penalty clause in supplier contract for delays",
                    ],
                    "business_impact": "Customer stockouts, lost sales, ITC claims blocked on mismatched GRNs",
                    "fix": "Dual-source: qualify Century or Greenply for same SKUs",
                    "immediate_action": f"Put {s.get('name')} on probation. Minimum orders only until reliability improves.",
                })

    # ── FINANCE RCA ───────────────────────────────────────────────
    if isinstance(finance_data, dict):
        wc_days = finance_data.get("working_capital_days", 0)
        if isinstance(wc_days, int) and wc_days > 40:
            issues.append({
                "type": "Working Capital Inefficiency",
                "severity": "MEDIUM",
                "affected": "Cash Cycle",
                "root_cause": f"Cash tied up {wc_days} days vs 40-day target — money working harder for your customers than for you",
                "why_chain": [
                    "Why high DSO (34 days)? — No early payment incentive; customers delay within credit terms",
                    "Why low DPO (8 days)? — Paying suppliers faster than needed; no terms negotiated",
                    "Why high DIO (22 days)? — Dead stock inflating average days inventory outstanding",
                ],
                "contributing_factors": [
                    "₹7.8L locked in slow/dead stock (inflates DIO)",
                    "₹12.8L outstanding receivables (inflates DSO)",
                    "Paying suppliers on NET-8 while collecting on NET-34",
                    "No early payment discount programme for customers",
                ],
                "business_impact": f"~₹8–10L of working capital unnecessarily consumed. At 12% p.a. cost = ₹1L/year wasted in interest.",
                "fix": "1) Negotiate NET-15 with Century  2) Offer 1.5% discount for customers paying in <15 days  3) Clear dead stock to cut DIO",
                "immediate_action": "Call Century Plyboards today — propose NET-15 payment terms (they want your volume)",
            })

    return issues


def build_rca_narrative(issues: List[Dict], query: str = "") -> str:
    """Convert RCA issues into a structured, readable narrative for the LLM."""
    if not issues:
        return "No critical issues detected. Business metrics are within normal operating range."

    high = [i for i in issues if i.get("severity") == "HIGH"]
    medium = [i for i in issues if i.get("severity") == "MEDIUM"]

    lines = ["=== RCA ENGINE OUTPUT ===\n"]

    if high:
        lines.append(f"HIGH SEVERITY ({len(high)} issue{'s' if len(high) > 1 else ''}):\n")
        for issue in high:
            lines.append(f"ISSUE: {issue['type']} — {issue['affected']}")
            lines.append(f"ROOT CAUSE: {issue['root_cause']}")
            lines.append("5-WHY CHAIN: " + " → ".join(issue.get("why_chain", [])))
            lines.append("CONTRIBUTING FACTORS: " + "; ".join(issue.get("contributing_factors", [])))
            lines.append(f"BUSINESS IMPACT: {issue['business_impact']}")
            lines.append(f"FIX: {issue['fix']}")
            lines.append(f"IMMEDIATE ACTION: {issue['immediate_action']}\n")

    if medium:
        lines.append(f"MEDIUM SEVERITY ({len(medium)} issue{'s' if len(medium) > 1 else ''}):\n")
        for issue in medium:
            lines.append(f"ISSUE: {issue['type']} — {issue['affected']}")
            lines.append(f"ROOT CAUSE: {issue['root_cause']}")
            lines.append(f"FIX: {issue['fix']}\n")

    return "\n".join(lines)
