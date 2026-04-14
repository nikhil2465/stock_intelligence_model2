import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chatbot
from dotenv import load_dotenv

load_dotenv()

# ── DB lifecycle (graceful — no crash if MySQL not configured) ──────────────────
try:
    from app.db.connection import get_pool, close_pool, is_db_available
    _db_module_available = True
except ImportError:
    _db_module_available = False
    async def get_pool(): return None
    async def close_pool(): pass
    async def is_db_available(): return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup — try to initialise DB pool
    if _db_module_available and os.getenv("MYSQL_HOST"):
        await get_pool()
    yield
    # Shutdown — close pool cleanly
    if _db_module_available:
        await close_pool()


app = FastAPI(
    title="StockSense AI",
    description="AI-powered Inventory Intelligence Platform for Dealers & Distributors",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot.router, prefix="/api")


@app.get("/")
def home():
    return {"message": "StockSense AI Backend v2.0", "status": "running", "docs": "/docs"}


@app.get("/health")
async def health():
    key_set = bool(os.getenv("OPENAI_API_KEY"))
    db_ok = await is_db_available() if _db_module_available else False
    return {
        "status": "healthy",
        "openai_key_configured": key_set,
        "mysql_connected": db_ok,
        "data_source": "mysql" if db_ok else "mock",
    }


@app.get("/api/db/status")
async def db_status():
    """Check MySQL connection status and data source mode."""
    if not _db_module_available:
        return {"mysql_available": False, "reason": "aiomysql not installed", "data_source": "mock"}
    if not os.getenv("MYSQL_HOST"):
        return {"mysql_available": False, "reason": "MYSQL_HOST not set in .env", "data_source": "mock"}
    db_ok = await is_db_available()
    return {
        "mysql_available": db_ok,
        "host": os.getenv("MYSQL_HOST"),
        "database": os.getenv("MYSQL_DB", "stocksense_inventory"),
        "data_source": "mysql" if db_ok else "mock",
        "reason": "Connected" if db_ok else "Connection failed — check credentials",
    }
