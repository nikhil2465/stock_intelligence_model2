"""
MySQL async connection pool for StockSense AI.
Uses aiomysql for non-blocking database access compatible with FastAPI.

If MySQL env vars are not set or connection fails, DB_AVAILABLE stays False
and the system transparently falls back to mock data — zero disruption.
"""
import os
import logging
from typing import Optional
import aiomysql
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ── Connection pool (created on first use) ─────────────────────────────────────
_pool: Optional[aiomysql.Pool] = None
DB_AVAILABLE: bool = False


async def get_pool() -> Optional[aiomysql.Pool]:
    """Return the connection pool, initializing it if needed."""
    global _pool, DB_AVAILABLE

    if _pool is not None:
        return _pool

    host = os.getenv("MYSQL_HOST", "")
    if not host:
        return None  # Not configured — use mock data

    try:
        _pool = await aiomysql.create_pool(
            host=host,
            port=int(os.getenv("MYSQL_PORT", 3306)),
            user=os.getenv("MYSQL_USER", "stocksense"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            db=os.getenv("MYSQL_DB", "stocksense_inventory"),
            minsize=2,
            maxsize=10,
            autocommit=True,
            charset="utf8mb4",
            connect_timeout=5,
        )
        DB_AVAILABLE = True
        logger.info("MySQL connected: %s/%s", host, os.getenv("MYSQL_DB"))
    except Exception as exc:
        logger.warning("MySQL unavailable (%s) — using mock data", exc)
        DB_AVAILABLE = False

    return _pool


async def close_pool():
    """Close the connection pool gracefully (called on app shutdown)."""
    global _pool, DB_AVAILABLE
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None
        DB_AVAILABLE = False
        logger.info("MySQL pool closed")


async def is_db_available() -> bool:
    """Check if the database is reachable."""
    pool = await get_pool()
    if not pool:
        return False
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1")
        return True
    except Exception:
        return False
