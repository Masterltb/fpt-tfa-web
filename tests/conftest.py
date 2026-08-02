"""Pytest conftest: override get_db with isolated SQLite in-memory DB for all API tests.

Applies the override at **module level** (not inside a fixture) so it is guaranteed
to take effect before any test class — including unittest.TestCase subclasses — runs.

Why: pytest autouse fixtures are not reliably applied to unittest.TestCase before
setUp() is called. Module-level override is set as soon as conftest.py is imported,
which happens before any test module is collected.
"""
from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.main import app
from app.infra.database import Base, get_db

# ---------------------------------------------------------------------------
# In-memory SQLite engine — completely isolated from Supabase PostgreSQL
# ---------------------------------------------------------------------------

_test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    future=True,
)

_TestSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=_test_engine,
    future=True,
)

# Create all ORM tables once at import time
Base.metadata.create_all(bind=_test_engine)


# ---------------------------------------------------------------------------
# Override dependency — applied at module level (runs before any test setUp)
# ---------------------------------------------------------------------------

def _override_get_db():
    db = _TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db
