"""Regression tests for the SQL formation store.

These run against a real SQLite file, not the in-memory repo. The bugs they lock
down were all invisible to the in-memory tests: a global primary key on
formation_teams.id made every run after the first fail, and the solver's scores
and unassignable list were computed and then dropped on write.
"""
from __future__ import annotations

import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

try:
    from fastapi.testclient import TestClient

    from app.api.deps import get_cohort_repo, get_engine
    from app.api.main import app
    from app.domain.models import Cohort, FormationRun, Team
    from app.infra.db import init_db, make_engine, make_session_factory
    from app.infra.sql_repository import SqlCohortRepository
    from app.matching.mock_engine import MockMatchingEngine
    from app.repositories import InMemoryCohortRepository

    _HAVE_DEPS = True
except Exception:
    _HAVE_DEPS = False

LEC1 = {"Authorization": "Bearer eyJ1aWQiOiAibGVjMSIsICJyb2xlIjogImxlY3R1cmVyIn0="}


def _run(run_id: str, teams: list[Team], unassignable=()) -> FormationRun:
    return FormationRun(
        id=run_id, cohort_id="c1", project_id="p1", min_size=3, max_size=5, seed=7,
        status="ok", balance=1.0, created_at=datetime.now(timezone.utc),
        teams=teams, unassignable=list(unassignable),
    )


@unittest.skipUnless(_HAVE_DEPS, "fastapi/sqlalchemy not installed")
class TestSqlFormationStore(unittest.TestCase):
    def setUp(self) -> None:
        self._dir = tempfile.TemporaryDirectory()
        self._engine = make_engine(f"sqlite:///{Path(self._dir.name) / 'test.db'}")
        init_db(self._engine)
        self.repo = SqlCohortRepository(make_session_factory(self._engine))
        self.repo.add(Cohort(id="c1", owner_id="lec1", name="Capstone"))

    def tearDown(self) -> None:
        # Windows will not unlink the file while the pool still holds it open.
        self._engine.dispose()
        self._dir.cleanup()

    def test_consecutive_runs_reuse_team_ids(self) -> None:
        """The engine numbers teams per run, so "team-1" recurs in every run."""
        for run_id in ("f1", "f2", "f3"):
            self.repo.save_formation_run(
                _run(run_id, [Team(id="team-1", member_ids=["u1", "u2"]),
                              Team(id="team-2", member_ids=["u3", "u4"])])
            )
        for run_id in ("f1", "f2", "f3"):
            got = self.repo.get_formation_run(run_id)
            self.assertIsNotNone(got, f"{run_id} was not persisted")
            self.assertEqual([t.id for t in got.teams], ["team-1", "team-2"])

    def test_scores_and_unassignable_survive_reload(self) -> None:
        scores = {"mean_competency": 3.25, "common_slots": 1.0}
        self.repo.save_formation_run(
            _run("f1", [Team(id="team-1", member_ids=["u1"], scores=scores)],
                 unassignable=[("u9", "no common slot")])
        )
        got = self.repo.get_formation_run("f1")
        self.assertEqual(got.teams[0].scores, scores)
        self.assertEqual(got.unassignable, [("u9", "no common slot")])

    def test_override_flag_survives_reload(self) -> None:
        """The record must keep showing that a team was amended by hand."""
        self.repo.save_formation_run(_run("f1", [Team(id="team-1", member_ids=["u1"])]))
        self.assertFalse(self.repo.get_formation_run("f1").teams[0].overridden)

        self.repo.update_formation_run_teams(
            "f1", [Team(id="team-1", member_ids=["u1", "u2"], overridden=True)]
        )
        self.assertTrue(self.repo.get_formation_run("f1").teams[0].overridden)

    def test_override_keeps_scores(self) -> None:
        scores = {"mean_competency": 4.0}
        self.repo.save_formation_run(_run("f1", [Team(id="team-1", member_ids=["u1"], scores=scores)]))
        self.repo.update_formation_run_teams(
            "f1", [Team(id="team-1", member_ids=["u1", "u2"], scores=scores)]
        )
        got = self.repo.get_formation_run("f1")
        self.assertEqual(got.teams[0].member_ids, ["u1", "u2"])
        self.assertEqual(got.teams[0].scores, scores)


@unittest.skipUnless(_HAVE_DEPS, "fastapi/sqlalchemy not installed")
class TestOverrideAcceptsResponseShape(unittest.TestCase):
    """GET returns "members"; override must accept that object unmodified."""

    def setUp(self) -> None:
        self.repo = InMemoryCohortRepository([Cohort(id="c1", owner_id="lec1", name="Capstone")])
        self.repo.runs = {"f1": _run("f1", [Team(id="t1", member_ids=["u1"], scores={"balance": 2.0})])}
        self.repo.get_formation_run = lambda fid: self.repo.runs.get(fid)
        self.repo.update_formation_run_teams = lambda fid, teams: setattr(self.repo.runs[fid], "teams", teams)
        self.repo.log_audit_event = lambda *a: None

        app.dependency_overrides[get_cohort_repo] = lambda: self.repo
        app.dependency_overrides[get_engine] = lambda: MockMatchingEngine()
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_get_exposes_seed_and_unassignable(self) -> None:
        body = self.client.get("/v1/formations/f1", headers=LEC1).json()
        self.assertIn("seed", body)
        self.assertIn("unassignable", body)

    def test_override_round_trips_get_response(self) -> None:
        team = self.client.get("/v1/formations/f1", headers=LEC1).json()["teams"][0]
        team["members"] = ["u1", "u2"]  # posted straight back, "members" and all
        r = self.client.post("/v1/formations/f1/override", json={"teams": [team]}, headers=LEC1)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.repo.runs["f1"].teams[0].member_ids, ["u1", "u2"])

    def test_override_without_scores_keeps_stored_scores(self) -> None:
        body = {"teams": [{"id": "t1", "member_ids": ["u1", "u3"], "rationale": "moved"}]}
        r = self.client.post("/v1/formations/f1/override", json=body, headers=LEC1)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.repo.runs["f1"].teams[0].scores, {"balance": 2.0})

    def test_changing_members_marks_the_team_overridden(self) -> None:
        body = {"teams": [{"id": "t1", "member_ids": ["u1", "u3"], "rationale": "moved"}]}
        self.client.post("/v1/formations/f1/override", json=body, headers=LEC1)
        self.assertTrue(self.repo.runs["f1"].teams[0].overridden)

    def test_untouched_team_is_not_marked(self) -> None:
        body = {"teams": [{"id": "t1", "member_ids": ["u1"], "rationale": "same"}]}
        self.client.post("/v1/formations/f1/override", json=body, headers=LEC1)
        self.assertFalse(self.repo.runs["f1"].teams[0].overridden)


if __name__ == "__main__":
    unittest.main()
