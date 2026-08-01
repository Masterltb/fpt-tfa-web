"""SqlCohortRepository verified against SQLite in-memory. Skipped if SQLAlchemy absent.

Proves the SQL repository satisfies the CohortRepository behavior against a real SQL backend.
Production uses the identical code against Postgres (only DATABASE_URL differs).
"""
from __future__ import annotations

import unittest

try:
    from sqlalchemy import create_engine
    from sqlalchemy.pool import StaticPool

    from app.domain.models import Cohort
    from app.infra.db import init_db, make_session_factory
    from app.infra.sql_repository import SqlCohortRepository

    _HAVE_SA = True
except Exception:  # pragma: no cover
    _HAVE_SA = False


@unittest.skipUnless(_HAVE_SA, "sqlalchemy not installed")
class TestSqlCohortRepository(unittest.TestCase):
    def setUp(self) -> None:
        # Shared in-memory SQLite (StaticPool keeps one connection so tables persist).
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            future=True,
        )
        init_db(engine)
        self.repo = SqlCohortRepository(make_session_factory(engine))

    def test_add_then_get_returns_domain_cohort(self) -> None:
        self.repo.add(Cohort(id="c1", owner_id="lec1", name="Capstone 2026"))
        got = self.repo.get("c1")
        self.assertIsNotNone(got)
        assert got is not None
        self.assertEqual(got.owner_id, "lec1")
        self.assertEqual(got.name, "Capstone 2026")

    def test_missing_returns_none(self) -> None:
        self.assertIsNone(self.repo.get("does-not-exist"))

    def test_upsert_via_merge(self) -> None:
        self.repo.add(Cohort(id="c1", owner_id="lec1"))
        self.repo.add(Cohort(id="c1", owner_id="lec2"))  # same id, new owner
        got = self.repo.get("c1")
        assert got is not None
        self.assertEqual(got.owner_id, "lec2")


if __name__ == "__main__":
    unittest.main()
