"""
CIRA — Contract Intelligence & Risk Analyzer
=============================================
Main application entry point.

This module:
    1. Creates the FastAPI application instance
    2. Configures CORS middleware for cross-origin requests
    3. Creates database tables on startup
    4. Registers all API route handlers
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.db.session import engine
from app.db.base import Base
from app.models.contract import Contract  # noqa: F401 — must import so Base knows about it


# ──────────────────────────────────────────────────────────
# Application Setup
# ──────────────────────────────────────────────────────────

app = FastAPI(
    title="CIRA — Contract Intelligence & Risk Analyzer",
    description=(
        "Upload legal documents (PDF, image, or text), extract text, "
        "analyze risk using a pre-trained ML model, and store results."
    ),
    version="1.0.0",
)


# ──────────────────────────────────────────────────────────
# CORS Middleware (allow all origins for development)
# ──────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────
# Database Table Creation
# ──────────────────────────────────────────────────────────

# Create all tables defined in Base.metadata if they don't exist yet
Base.metadata.create_all(bind=engine)


# ──────────────────────────────────────────────────────────
# Route Registration
# ──────────────────────────────────────────────────────────

# Mount the API router (all endpoints from routes.py)
app.include_router(router)


# ──────────────────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Health check endpoint — confirms the server is running."""
    return {
        "status": "ok",
        "message": "CIRA Backend Running",
        "docs": "/docs",
    }