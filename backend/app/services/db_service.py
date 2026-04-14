"""
Async MySQL Database Service — StockSense AI
Provides a connection pool and query helpers.
Falls back gracefully if MySQL is not configured or unavailable.
Existing mock data in mcp_tools.py is NEVER affected.
"""
import os
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

# Pool is None when MySQL is not available — callers must check
_pool = None

# ── Connection config from environment ────────────────────────────────────────
def _db_config() -> dict:
    return {
        "host":     os.getenv("MYSQL_HOST", "127.0.0.1"),
        "port":     int(os.getenv("MYSQL_PORT", "3306")),
        "user":     os.getenv("MYSQL_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD", ""),
        "db":       os.getenv("MYSQL_DB", "stocksense"),
        "charset":  "utf8mb4",
        "autocommit": True,
    }


def is_db_enabled() -> bool:
    """Return True only when MYSQL_HOST is explicitly set in .env."""
    return bool(os.getenv("MYSQL_HOST"))


async def init_pool() -> None:
    """Initialise connection pool on app startup. Safe to call even if MySQL not configured."""
    global _pool
    if not is_db_enabled():
        logger.info("MySQL not configured (MYSQL_HOST not set). Using mock data.")
        return
    try:
        import aiomysql
        cfg = _db_config()
        _pool = await aiomysql.create_pool(
            host=cfg["host"],
            port=cfg["port"],
            user=cfg["user"],
            password=cfg["password"],
            db=cfg["db"],
            charset=cfg["charset"],
            autocommit=cfg["autocommit"],
            minsize=2,
            maxsize=10,
            connect_timeout=5,
        )
        logger.info("MySQL pool initialised: %s:%s/%s", cfg["host"], cfg["port"], cfg["db"])
    except Exception as exc:
        logger.warning("MySQL unavailable (%s). Chatbot will use mock data.", exc)
        _pool = None


async def close_pool() -> None:
    """Close pool on app shutdown."""
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()
        _pool = None
        logger.info("MySQL pool closed.")


async def fetch_all(sql: str, args: tuple = ()) -> List[Dict[str, Any]]:
    """Execute SELECT and return list of dicts. Returns [] on any error."""
    if _pool is None:
        return []
    try:
        import aiomysql
        async with _pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(sql, args)
                return list(await cur.fetchall())
    except Exception as exc:
        logger.warning("DB query failed: %s", exc)
        return []


async def fetch_one(sql: str, args: tuple = ()) -> Optional[Dict[str, Any]]:
    """Execute SELECT and return first row as dict, or None."""
    rows = await fetch_all(sql, args)
    return rows[0] if rows else None


async def db_status() -> dict:
    """Return connection health info for /db-status endpoint."""
    if _pool is None:
        return {"connected": False, "reason": "MySQL not configured or unavailable"}
    try:
        row = await fetch_one("SELECT VERSION() AS version, DATABASE() AS db")
        return {"connected": True, "version": row.get("version"), "database": row.get("db")}
    except Exception as exc:
        return {"connected": False, "reason": str(exc)}
