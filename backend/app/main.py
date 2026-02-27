"""
STOCHOPT - Stochastic Production Planning System
Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import agriculture
import os

# Initialize FastAPI app
app = FastAPI(
    title="STOCHOPT API",
    description="Multi-Sector Stochastic Production Planning System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
# Set ALLOWED_ORIGINS env var to a comma-separated list of origins, or * to allow all.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")

if _raw_origins.strip() == "*":
    # Allow all origins (useful for production on Vercel/Render without a fixed domain)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,   # must be False when allow_origins=["*"]
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in _raw_origins.split(",")],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Include routers
app.include_router(agriculture.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "name": "STOCHOPT API",
        "version": "1.0.0",
        "description": "Multi-Sector Stochastic Production Planning System",
        "modules": ["agriculture", "manufacturing", "pharma", "food"],
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Global health check."""
    return {"status": "healthy", "service": "stochopt-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
