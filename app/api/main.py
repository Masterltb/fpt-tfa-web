"""FastAPI app entrypoint (scaffold). Requires FastAPI (install to run).

Run (after `uv sync` / `pip install -e .`):  uvicorn app.api.main:app --reload
"""
from __future__ import annotations

from fastapi import FastAPI  # type: ignore[import-not-found]

from .routes_formation import router as formation_router
from .routes_cohort import router as cohort_router
from .routes_profile import router as profile_router

app = FastAPI(title="Team Formation Assistant", version="0.1.0")
app.include_router(formation_router)
app.include_router(cohort_router)
app.include_router(profile_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
