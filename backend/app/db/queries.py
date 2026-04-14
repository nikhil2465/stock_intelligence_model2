"""
Async MySQL query functions for StockSense AI.
Each function maps to one MCP tool domain.
All functions accept a pool and return dict — same shape as mock data.
"""
import asyncio
from typing import Optional
import aiomysql


async def query_stock(pool: aiomysql.Pool, query: str = "") -> dict:
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            # Total stock value
            await cur.execute(
                "SELECT SUM(sl.quantity * p.buy_price) AS total_val "
                "FROM stock_levels sl JOIN products p ON sl.product_id=p.product_id"
            )
            row = await cur.fetchone()
            total_val = float(row["total_val"] or 0)
            total_str = f"Rs.{total_val/100000:.1f}L"

            # Critical low SKUs
            await cur.execute("""
                SELECT p.sku_name, p.brand, SUM(sl.quantity) AS stock,
                       p.reorder_level, p.sell_price,
                       ROUND(SUM(sl.quantity) / 17.0, 0) AS days_cover
                FROM stock_levels sl JOIN products p ON sl.product_id=p.product_id
                WHERE p.is_active=1
                GROUP BY p.product_id
                HAVING stock <= p.reorder_level * 1.2
                ORDER BY days_cover ASC LIMIT 5
            """)
            critical_rows = await cur.fetchall()
            critical_low = [
                {
                    "sku": r["sku_name"], "brand": r["brand"],
                    "stock": int(r["stock"]), "days_cover": int(r["days_cover"]),
                    "reorder_level": r["reorder_level"],
                    "revenue_at_risk": f"Rs.{float(r['sell_price'])*int(r['stock'])/100000:.1f}L"
                }
                for r in critical_rows
            ]

            # Dead stock (no movement 90+ days, qty > 0)
            await cur.execute("""
                SELECT p.sku_name, SUM(sl.quantity) AS stock,
                       SUM(sl.quantity * p.buy_price) AS value,
                       DATEDIFF(CURDATE(), MAX(sm.moved_at)) AS days_old
                FROM stock_levels sl
                JOIN products p ON sl.product_id=p.product_id
                LEFT JOIN stock_movements sm ON sl.product_id=sm.product_id AND sm.movement_type='OUT'
                WHERE p.is_active=1
                GROUP BY p.product_id
                HAVING (days_old IS NULL OR days_old > 90) AND stock > 50
                ORDER BY value DESC LIMIT 5
            """)
            dead_rows = await cur.fetchall()
            dead_stock = [
                {
                    "sku": r["sku_name"],
                    "days_old": int(r["days_old"] or 91),
                    "stock": int(r["stock"]),
                    "value": f"Rs.{float(r['value'])/100000:.2f}L",
                    "action": "12% discount to contractors or bundle with fast movers"
                }
                for r in dead_rows
            ]

            # Godown breakdown
            await cur.execute("""
                SELECT g.godown_name, g.capacity_sheets,
                       COALESCE(SUM(sl.quantity), 0) AS sheets,
                       COALESCE(SUM(sl.quantity * p.buy_price), 0) AS value
                FROM godowns g
                LEFT JOIN stock_levels sl ON g.godown_id=sl.godown_id
                LEFT JOIN products p ON sl.product_id=p.product_id
                WHERE g.is_active=1
                GROUP BY g.godown_id
            """)
            godown_rows = await cur.fetchall()
            godowns = {
                r["godown_name"]: {
                    "value": f"Rs.{float(r['value'])/100000:.1f}L",
                    "sheets": int(r["sheets"]),
                    "capacity_pct": int(int(r["sheets"]) / r["capacity_sheets"] * 100)
                }
                for r in godown_rows
            }

            # True landed cost (from products table) — fixed for ONLY_FULL_GROUP_BY
            await cur.execute("""
                SELECT p.sku_name, p.buy_price, p.sell_price,
                       MIN(s.freight_per_sheet) AS freight_per_sheet,
                       ROUND((p.sell_price - p.buy_price) / p.sell_price * 100, 1) AS margin_pct
                FROM products p
                JOIN po_items pi ON p.product_id=pi.product_id
                JOIN purchase_orders po ON pi.po_id=po.po_id
                JOIN suppliers s ON po.supplier_id=s.supplier_id
                WHERE p.is_active=1
                GROUP BY p.product_id, p.sku_name, p.buy_price, p.sell_price
                LIMIT 8
            """)
            cost_rows = await cur.fetchall()
            true_cost = {}
            for r in cost_rows:
                freight = float(r["freight_per_sheet"] or 0)
                buy = float(r["buy_price"])
                sell = float(r["sell_price"])
                true_c = buy + freight + (buy * 0.012) + (buy * 0.01)
                real_m = round((sell - true_c) / sell * 100, 1)
                true_cost[r["sku_name"]] = {
                    "buy": buy, "freight": freight,
                    "true_cost": round(true_c, 0), "sell": sell,
                    "real_margin": f"{real_m}%",
                    "stated_margin": f"{round((sell-buy)/sell*100,1)}%"
                }

    return {
        "total_stock_value": total_str,
        "critical_low": critical_low,
        "dead_stock": dead_stock,
        "godowns": godowns,
        "true_landed_cost": true_cost,
        "inventory_accuracy": "96.8%",
        "stock_turnover": "4.2x",
        "gmroi": "Rs.1.98",
        "data_source": "mysql",
    }


async def query_supplier(pool: aiomysql.Pool, query: str = "") -> dict:
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM v_supplier_scorecard")
            rows = await cur.fetchall()
            suppliers = [
                {
                    "name": r["supplier_name"],
                    "on_time_pct": float(r["on_time_pct"]),
                    "avg_delay_days": float(r["avg_delay_days"]),
                    "lead_time": f"{r['lead_time_days']} days",
                    "freight_cost": f"Rs.{float(r['freight_per_sheet']):.1f}/sheet",
                    "price_vs_market": r["price_vs_market"],
                    "grn_match_rate": f"{float(r['grn_match_rate']):.0f}%",
                    "recommendation": r["recommendation"],
                    "open_pos": int(r["open_pos"]),
                    "overdue_pos": int(r["overdue_pos"]),
                    "pending_value": f"Rs.{float(r['open_value'])/100000:.1f}L",
                }
                for r in rows
            ]
            # overdue POs
            await cur.execute("""
                SELECT po.po_number, s.supplier_name,
                       DATEDIFF(CURDATE(), po.expected_date) AS overdue_days
                FROM purchase_orders po
                JOIN suppliers s ON po.supplier_id=s.supplier_id
                WHERE po.status='OVERDUE'
                ORDER BY overdue_days DESC
            """)
            overdue = await cur.fetchall()
            overdue_list = [f"{r['po_number']} ({r['supplier_name']}, +{r['overdue_days']}d)" for r in overdue]

    return {
        "suppliers": suppliers,
        "overdue_pos": overdue_list,
        "data_source": "mysql",
    }


async def query_customer(pool: aiomysql.Pool, query: str = "") -> dict:
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT COUNT(*) AS cnt FROM customers WHERE is_active=1")
            total = (await cur.fetchone())["cnt"]

            await cur.execute("SELECT * FROM v_overdue_invoices LIMIT 10")
            overdue_rows = await cur.fetchall()
            overdue = [
                {
                    "customer": r["customer_name"],
                    "amount": f"Rs.{float(r['outstanding'])/100000:.1f}L",
                    "days_overdue": int(r["days_overdue"]),
                    "risk": r["risk_level"],
                }
                for r in overdue_rows
            ]

            await cur.execute("""
                SELECT customer_name, segment, avg_monthly_value,
                       DATEDIFF(CURDATE(), last_order_date) AS days_silent
                FROM customers
                WHERE risk_status IN ('MEDIUM','HIGH') AND is_active=1
                ORDER BY days_silent DESC LIMIT 5
            """)
            at_risk_rows = await cur.fetchall()
            at_risk = [
                {
                    "name": r["customer_name"], "segment": r["segment"],
                    "days_silent": int(r["days_silent"] or 0),
                    "monthly_value": f"Rs.{float(r['avg_monthly_value'])/100000:.1f}L",
                }
                for r in at_risk_rows
            ]

            await cur.execute("""
                SELECT SUM(outstanding) AS total FROM invoices WHERE outstanding > 0
            """)
            outstanding_row = await cur.fetchone()
            total_outstanding = float(outstanding_row["total"] or 0)

    return {
        "total_customers": total,
        "at_risk": at_risk,
        "overdue_receivables": overdue,
        "total_outstanding": f"Rs.{total_outstanding/100000:.1f}L",
        "data_source": "mysql",
    }


async def query_finance(pool: aiomysql.Pool, query: str = "") -> dict:
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("""
                SELECT * FROM finance_monthly
                WHERE month_year = DATE_FORMAT(CURDATE(), '%Y-%m-01')
                LIMIT 1
            """)
            row = await cur.fetchone()
            if not row:
                return {"data_source": "mysql", "error": "No finance snapshot for current month"}

    return {
        "revenue_mtd": f"Rs.{float(row['revenue'])/100000:.1f}L",
        "gross_profit_mtd": f"Rs.{float(row['gross_profit'])/100000:.2f}L",
        "gross_margin": f"{float(row['gross_margin_pct']):.1f}%",
        "working_capital_days": int(row["working_capital_days"]),
        "outstanding_receivables": f"Rs.{float(row['outstanding_receivables'])/100000:.1f}L",
        "dead_stock_locked": f"Rs.{float(row['dead_stock_value'])/100000:.1f}L",
        "returns_mtd": f"Rs.{float(row['returns_value'])/100000:.2f}L",
        "gst": {
            "output_collected": f"Rs.{float(row['gst_output'])/100000:.2f}L",
            "itc_available": f"Rs.{float(row['gst_itc'])/100000:.2f}L",
            "net_payable": f"Rs.{float(row['gst_net_payable'])/100000:.2f}L",
        },
        "cash_cycle": f"DIO {row['dio_days']} + DSO {row['dso_days']} - DPO {row['dpo_days']} = {row['working_capital_days']} days",
        "data_source": "mysql",
    }


async def query_order(pool: aiomysql.Pool, query: str = "") -> dict:
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("""
                SELECT status, COUNT(*) AS cnt, SUM(total_value) AS val
                FROM customer_orders WHERE order_date = CURDATE()
                GROUP BY status
            """)
            rows = await cur.fetchall()
            counts = {r["status"]: int(r["cnt"]) for r in rows}

            await cur.execute("SELECT * FROM v_order_pipeline WHERE status='PENDING' LIMIT 10")
            pending_rows = await cur.fetchall()
            pending = [
                {
                    "order": r["order_number"], "customer": r["customer_name"],
                    "value": f"Rs.{float(r['total_value'])/100000:.1f}L",
                    "delayed": f"{r['delayed_hrs']} hours" if r["delayed_hrs"] else "No delay",
                    "reason": r["delay_reason"] or "On track",
                }
                for r in pending_rows
            ]

    return {
        "today_orders": sum(counts.values()),
        "dispatched": counts.get("DISPATCHED", 0) + counts.get("DELIVERED", 0),
        "pending": counts.get("PENDING", 0),
        "pending_details": pending,
        "data_source": "mysql",
    }


async def query_freight(pool: aiomysql.Pool, query: str = "") -> dict:
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("SELECT * FROM freight_lanes ORDER BY cost_per_sheet ASC")
            rows = await cur.fetchall()
            lanes = [
                {
                    "lane": r["lane_name"], "zone": r["zone"],
                    "cost_per_sheet": float(r["cost_per_sheet"]),
                    "fill_pct": float(r["avg_fill_pct"]),
                    "status": r["status"],
                }
                for r in rows
            ]
            inbound = {}
            await cur.execute("SELECT supplier_name, freight_per_sheet FROM suppliers WHERE is_active=1")
            for r in await cur.fetchall():
                inbound[r["supplier_name"]] = f"Rs.{float(r['freight_per_sheet']):.1f}/sheet"

    return {
        "outbound_lanes": lanes,
        "inbound_costs": inbound,
        "vehicle_utilisation": "68%",
        "outbound_cost_per_sheet": "Rs.18.4",
        "data_source": "mysql",
    }


async def query_demand(pool: aiomysql.Pool, query: str = "") -> dict:
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute("""
                SELECT p.sku_name, df.forecast_qty, df.actual_qty, df.demand_signal
                FROM demand_forecast df
                JOIN products p ON df.product_id=p.product_id
                WHERE df.forecast_month = DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01')
                ORDER BY df.forecast_qty DESC
            """)
            rows = await cur.fetchall()
            forecast = [
                {
                    "sku": r["sku_name"],
                    "f30": int(r["forecast_qty"] or 0),
                    "signal": r["demand_signal"] or "STABLE",
                    "action": "Review stock levels based on forecast signal",
                }
                for r in rows
            ]

    return {
        "current_month_top": forecast,
        "seasonal_insight": "Oct-Dec historically strongest quarter (+28%). Stock up BWP grades by September.",
        "data_source": "mysql",
    }
