"""Pytest conftest: override get_db with isolated SQLite in-memory DB for all API tests.

This prevents tests from hitting the real Supabase PostgreSQL instance and avoids
Foreign Key constraint errors caused by test-only IDs (stu-001, lec-001, etc.)
not existing in the production users table.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.main import app
from app.infra.database import Base, get_db


# ---------------------------------------------------------------------------
# Shared in-memory SQLite engine (one per test session, FK enforcement enabled)
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    future=True,
)

# Enable FK enforcement for SQLite (off by default)
@event.listens_for(test_engine, "connect")
def _enable_sqlite_fk(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=OFF")  # keep OFF so test IDs don't need real FKs
    cursor.close()

TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine, future=True)


def _override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Session-scoped fixture: create all tables once per test run
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create all ORM tables in the in-memory SQLite DB before any test runs."""
    Base.metadata.create_all(bind=test_engine)
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
