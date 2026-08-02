"""Tests for SqlCohortRepository persistence methods."""
from __future__ import annotations

import unittest
from datetime import datetime, timezone

try:
    from sqlalchemy import create_engine
    from sqlalchemy.pool import StaticPool

    from app.domain.models import Cohort, FormationRun, Team
    from app.infra.db import init_db, make_session_factory
    from app.infra.sql_repository import SqlCohortRepository

    _HAVE_SA = True
except Exception:
    _HAVE_SA = False

@unittest.skipUnless(_HAVE_SA, "sqlalchemy not installed")
class TestPersistence(unittest.TestCase):
    def setUp(self) -> None:
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            future=True,
        )
        init_db(engine)
        self.repo = SqlCohortRepository(make_session_factory(engine))
        self.repo.add(Cohort(id="c1", owner_id="lec1", name="Capstone"))

    def test_save_and_get_formation_run(self) -> None:
        run_data = FormationRun(
            id="f1",
            cohort_id="c1",
            project_id="p1",
            min_size=3,
            max_size=5,
            seed=0,
            status="succeeded",
            balance=1.2,
            created_at=datetime.now(timezone.utc),
            teams=[Team(id="t1", member_ids=["u1", "u2"], rationale="")]
        )
        self.repo.save_formation_run(run_data)
        
        got = self.repo.get_formation_run("f1")
        self.assertIsNotNone(got)
        self.assertEqual(got.id, "f1")
        self.assertEqual(len(got.teams), 1)
        self.assertEqual(got.teams[0].id, "t1")
        self.assertEqual(got.teams[0].member_ids, ["u1", "u2"])
        
    def test_update_run_teams(self) -> None:
        run_data = FormationRun(
            id="f2",
            cohort_id="c1",
            project_id="p1",
            min_size=3,
            max_size=5,
            seed=0,
            status="succeeded",
            balance=1.2,
            created_at=datetime.now(timezone.utc),
            teams=[Team(id="t1", member_ids=["u1", "u2"], rationale="")]
        )
        self.repo.save_formation_run(run_data)
        self.repo.update_formation_run_teams("f2", [Team(id="t1", member_ids=["u1"], rationale="new"), Team(id="t2", member_ids=["u2"], rationale="split")])
        got = self.repo.get_formation_run("f2")
        self.assertEqual(len(got.teams), 2)

    def test_commit_run(self) -> None:
        run_data = FormationRun(
            id="f3", cohort_id="c1", project_id="p1", min_size=3, max_size=5, seed=0, status="succeeded", balance=1.0, created_at=datetime.now(timezone.utc), teams=[]
        )
        self.repo.save_formation_run(run_data)
        self.repo.commit_formation_run("f3", "lec1")
        got = self.repo.get_formation_run("f3")
        self.assertEqual(got.status, "committed")

if __name__ == "__main__":
    unittest.main()
