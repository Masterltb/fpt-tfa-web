"""FastAPI Application Entrypoint for Team Formation Assistant (TFA).

Registers all API Routers (Auth & Users, Academic Catalogs & Sections, Student Profile & DNA,
Grouping Sessions State Machine, Teams & Invitations, Matching Runs, Review Board, Reports & Audit).
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_auth_users import router as auth_users_router
from app.api.routes_academic import router as academic_router
from app.api.routes_student_profile import router as student_profile_router
from app.api.routes_sessions import router as sessions_router
from app.api.routes_teams import router as teams_router
from app.api.routes_matching_reports import router as matching_reports_router

from app.api.routes_formation import router as formation_router
from app.api.routes_cohort import router as cohort_router
from app.api.routes_profile import router as legacy_profile_router
from app.api.routes_admin import router as legacy_admin_router
from app.api.routes_student_team import router as legacy_student_team_router
from app.api.routes_lecturer import router as legacy_lecturer_router

from app.infra.database import init_db as init_app_db
from app.infra.db import init_db as init_legacy_db

# Ensure all database tables (both domain & legacy) exist on startup
init_app_db()
try:
    init_legacy_db()
except Exception:
    pass

app = FastAPI(
    title="Team Formation Assistant API",
    description="FPT University AI-Assisted Balanced Team Formation Platform (API v1.0.0)",
    version="1.0.0"
)

# Enable CORS for local web development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Multi-Agent Domain Routers (API Contract v1.0.0)
app.include_router(auth_users_router)
app.include_router(academic_router)
app.include_router(student_profile_router)
app.include_router(sessions_router)
app.include_router(teams_router)
app.include_router(matching_reports_router)

# Legacy Routers for full backward compatibility
app.include_router(legacy_admin_router)
app.include_router(legacy_lecturer_router)
app.include_router(legacy_student_team_router)
app.include_router(legacy_profile_router)
app.include_router(formation_router)
app.include_router(cohort_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "tfa-backend", "version": "1.0.0"}
