import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chatbot
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="StockSense AI",
    description="AI-powered Inventory Intelligence Platform for Dealers & Distributors",
    version="2.0.0",
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
    return {"message": "StockSense AI Backend v2.0 🚀", "status": "running", "docs": "/docs"}


@app.get("/health")
def health():
    key_set = bool(os.getenv("OPENAI_API_KEY"))
    return {"status": "healthy", "openai_key_configured": key_set}
