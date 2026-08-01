"""Auth / role dependency (scaffold). Requires FastAPI (install to run).

Enforces authentication + role server-side per request (docs/rbac.md, BR-13). This is a stub
that reads a role header for local development; replace with a real auth provider
(free OSS / free-tier — see docs/architecture.md, respecting the privacy caveat).
"""
from __future__ import annotations

import os
import json
import base64
from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, status, Request  # type: ignore[import-not-found]
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials # type: ignore[import-not-found]

from ..matching.engine import MatchingEngine
from ..repositories import CohortRepository, InMemoryCohortRepository, StudentRepository, InMemoryStudentRepository

ROLES = ("student", "lecturer", "admin")


def get_engine() -> MatchingEngine:
    """Production default: the real OR-Tools engine (free, OSS, local). Lazy-imported so the
    API module does not require OR-Tools at import time; tests override this with the mock."""
    from ..matching.ortools_engine import OrToolsMatchingEngine

    return OrToolsMatchingEngine(max_time_s=5.0)

# Repo provider: SQL (Postgres/SQLite) when DATABASE_URL is set, else in-memory for local dev.
# Tests override this via FastAPI dependency_overrides. Built lazily so the API module does not
# require SQLAlchemy at import time.
_cohort_repo: CohortRepository | None = None


def get_cohort_repo() -> CohortRepository:
    global _cohort_repo
    if _cohort_repo is None:
        url = os.environ.get("DATABASE_URL", "sqlite:///./tfa.db")
        if url:
            from ..infra.db import init_db, make_engine, make_session_factory
            from ..infra.sql_repository import SqlCohortRepository

            engine = make_engine(url)
            init_db(engine)
            _cohort_repo = SqlCohortRepository(make_session_factory(engine))
        else:
            _cohort_repo = InMemoryCohortRepository()
    return _cohort_repo


_student_repo: StudentRepository | None = None

def get_student_repo() -> StudentRepository:
    global _student_repo
    if _student_repo is None:
        url = os.environ.get("DATABASE_URL", "sqlite:///./tfa.db")
        if url:
            from ..infra.db import init_db, make_engine, make_session_factory
            from ..infra.sql_repository import SqlStudentRepository

            engine = make_engine(url)
            init_db(engine)
            _student_repo = SqlStudentRepository(make_session_factory(engine))
        else:
            _student_repo = InMemoryStudentRepository()
    return _student_repo


@dataclass
class Principal:
    user_id: str
    role: str


security = HTTPBearer()

def verify_firebase_token(token: str) -> dict:
    import firebase_admin
    from firebase_admin import auth
    
    if not firebase_admin._apps:
        # Initialize default app if not already initialized
        firebase_admin.initialize_app()
    return auth.verify_id_token(token)

def decode_mock_token(token: str) -> dict:
    # A simple mock token can just be base64 JSON for dev purposes
    try:
        decoded = base64.b64decode(token).decode("utf-8")
        return json.loads(decoded)
    except Exception:
        raise ValueError("Invalid mock token")

async def current_principal(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Principal:
    token = credentials.credentials
    use_firebase = os.environ.get("FIREBASE_PROJECT_ID") or os.environ.get("FIREBASE_CONFIG")
    
    try:
        if use_firebase:
            claims = verify_firebase_token(token)
            uid = claims.get("uid")
            role = claims.get("role", "student") # Default to student if no custom claim
        else:
            claims = decode_mock_token(token)
            uid = claims.get("uid")
            role = claims.get("role", "student")
            
        if not uid or role not in ROLES:
            raise ValueError("Invalid claims")
            
        return Principal(user_id=uid, role=role)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


def require_role(*allowed: str):
    async def _dep(principal: Principal = Depends(current_principal)) -> Principal:
        if principal.role not in allowed:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "insufficient role")
        return principal

    return _dep
