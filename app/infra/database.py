"""Database connection setup for FastAPI + SQLAlchemy 2.0.

Supports SQLite (development/testing) and PostgreSQL (production).
Student PII stays on local/controlled infrastructure (docs/architecture.md & constitution BR-08/BR-09).
"""
from __future__ import annotations

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from urllib.parse import quote_plus

def format_database_url(raw_url: str) -> str:
    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)
    if "://" in raw_url and "@" in raw_url:
        try:
            scheme, rest = raw_url.split("://", 1)
            # Find last '@' which separates userinfo from host
            userinfo, host_part = rest.rsplit("@", 1)
            if ":" in userinfo:
                user, pwd = userinfo.split(":", 1)
                # Avoid double encoding if already quoted
                if "%" not in pwd:
                    pwd = quote_plus(pwd)
                return f"{scheme}://{user}:{pwd}@{host_part}"
        except Exception:
            pass
    return raw_url

DATABASE_URL = format_database_url(os.environ.get("DATABASE_URL", "sqlite:///./tfa.db"))

# Configure engine arguments
engine_kwargs = {"future": True}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
    if ":memory:" in DATABASE_URL:
        from sqlalchemy.pool import StaticPool
        engine_kwargs["poolclass"] = StaticPool
else:
    # Supabase PostgreSQL / PgBouncer connection settings
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    })

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy ORM models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """Dependency for providing a SQLAlchemy database session to API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
