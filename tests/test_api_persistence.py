"""API tests for persistence features (overrides, commits, constraints)."""
from __future__ import annotations

import unittest
from datetime import datetime, timezone

try:
    from fastapi.testclient import TestClient

    from app.api.deps import get_cohort_repo, get_engine
    from app.api.main import app
    from app.domain.models import Cohort, FormationRun, Team
    from app.matching.mock_engine import MockMatchingEngine
    from app.repositories import InMemoryCohortRepository

    _HAVE_FASTAPI = True
except Exception:
    _HAVE_FASTAPI = False

@unittest.skipUnless(_HAVE_FASTAPI, "fastapi not installed")
class TestApiPersistence(unittest.TestCase):
    def setUp(self) -> None:
        self.repo = InMemoryCohortRepository([Cohort(id="c1", owner_id="lec1", name="Capstone 2026")])
        
        run = FormationRun(
            id="f1", cohort_id="c1", project_id="p1", min_size=3, max_size=5, seed=0,
            status="ok", balance=1.0, created_at=datetime.now(timezone.utc),
            teams=[Team(id="t1", member_ids=["u1", "u2"], rationale="")]
        )
        self.repo.runs = {"f1": run}
        
        def get_formation_run(fid):
            return self.repo.runs.get(fid)
        def update_formation_run_teams(fid, teams):
            self.repo.runs[fid].teams = teams
        def commit_formation_run(fid, lec_id):
            self.repo.runs[fid].status = "committed"
        def log_audit_event(cid, uid, act, pld):
            pass

        self.repo.get_formation_run = get_formation_run
        self.repo.update_formation_run_teams = update_formation_run_teams
        self.repo.commit_formation_run = commit_formation_run
        self.repo.log_audit_event = log_audit_event

        app.dependency_overrides[get_cohort_repo] = lambda: self.repo
        app.dependency_overrides[get_engine] = lambda: MockMatchingEngine()
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_get_formation(self) -> None:
        r = self.client.get("/v1/formations/f1", headers={"Authorization": "Bearer eyJ1aWQiOiAibGVjMSIsICJyb2xlIjogImxlY3R1cmVyIn0="})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["id"], "f1")

    def test_override_formation(self) -> None:
        body = {"teams": [{"id": "t1", "member_ids": ["u1", "u2", "u3"], "rationale": "override"}]}
        r = self.client.post("/v1/formations/f1/override", json=body, headers={"Authorization": "Bearer eyJ1aWQiOiAibGVjMSIsICJyb2xlIjogImxlY3R1cmVyIn0="})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.repo.runs["f1"].teams[0].member_ids, ["u1", "u2", "u3"])

    def test_commit_formation(self) -> None:
        r = self.client.post("/v1/formations/f1/commit", headers={"Authorization": "Bearer eyJ1aWQiOiAibGVjMSIsICJyb2xlIjogImxlY3R1cmVyIn0="})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(self.repo.runs["f1"].status, "committed")

if __name__ == "__main__":
    unittest.main()
