"""API tests: authorization (SC-004) + happy path + infeasible (422).

Requires fastapi/httpx (installed in .venv). Uses FastAPI TestClient to drive the real app.
"""
from __future__ import annotations

import unittest

try:
    from fastapi.testclient import TestClient

    from app.api.deps import get_cohort_repo, get_engine
    from app.api.main import app
    from app.domain.models import Cohort
    from app.matching.mock_engine import MockMatchingEngine
    from app.repositories import InMemoryCohortRepository

    _HAVE_FASTAPI = True
except Exception:  # pragma: no cover - skipped when deps absent
    _HAVE_FASTAPI = False


def _cohort(n: int) -> list[dict]:
    return [
        {"id": f"u{i}", "name": f"Student {i}",
         "skills": [{"name": "s0", "proficiency": (i % 5) + 1}],
         "experience_years": float(i % 3)}
        for i in range(n)
    ]


def _body(n: int = 9, **over) -> dict:
    b = {"project_id": "p1", "min_size": 3, "max_size": 5, "students": _cohort(n), "seed": 1}
    b.update(over)
    return b


@unittest.skipUnless(_HAVE_FASTAPI, "fastapi not installed")
class TestApiAuthz(unittest.TestCase):
    def setUp(self) -> None:
        # Seed a repo where cohort "c1" is owned by lecturer "lec1".
        repo = InMemoryCohortRepository([Cohort(id="c1", owner_id="lec1", name="Capstone 2026")])
        app.dependency_overrides[get_cohort_repo] = lambda: repo
        # API tests focus on authz/HTTP — use the fast mock engine; the real OR-Tools engine
        # has its own tests (tests/test_ortools_engine.py).
        app.dependency_overrides[get_engine] = lambda: MockMatchingEngine()
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_health_ok(self) -> None:
        r = self.client.get("/health")
        self.assertEqual(r.status_code, 200)

    def test_missing_auth_is_401(self) -> None:
        r = self.client.post("/v1/cohorts/c1/formations", json=_body())
        self.assertEqual(r.status_code, 401)

    def test_student_role_forbidden_403(self) -> None:
        r = self.client.post(
            "/v1/cohorts/c1/formations", json=_body(),
            headers={"Authorization": "Bearer eyJ1aWQiOiAiczEiLCAicm9sZSI6ICJzdHVkZW50In0="},
        )
        self.assertEqual(r.status_code, 403)  # SC-004

    def test_lecturer_can_run_200(self) -> None:
        r = self.client.post(
            "/v1/cohorts/c1/formations", json=_body(9),
            headers={"Authorization": "Bearer eyJ1aWQiOiAibGVjMSIsICJyb2xlIjogImxlY3R1cmVyIn0="},
        )
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data["status"], "ok")
        self.assertTrue(data["teams"])
        members = [m for t in data["teams"] for m in t["members"]]
        self.assertEqual(sorted(members), [f"u{i}" for i in range(9)])

    def test_infeasible_is_422(self) -> None:
        r = self.client.post(
            "/v1/cohorts/c1/formations", json=_body(2),  # 2 students, min_size 3
            headers={"Authorization": "Bearer eyJ1aWQiOiAibGVjMSIsICJyb2xlIjogImxlY3R1cmVyIn0="},
        )
        self.assertEqual(r.status_code, 422)

    def test_lecturer_not_owner_forbidden_403(self) -> None:
        # lec2 is a lecturer but does NOT own cohort c1 (object-level authz, BR-13 / IDOR guard)
        r = self.client.post(
            "/v1/cohorts/c1/formations", json=_body(9),
            headers={"Authorization": "Bearer eyJ1aWQiOiAibGVjMiIsICJyb2xlIjogImxlY3R1cmVyIn0="},
        )
        self.assertEqual(r.status_code, 403)

    def test_unknown_cohort_404(self) -> None:
        r = self.client.post(
            "/v1/cohorts/does-not-exist/formations", json=_body(9),
            headers={"Authorization": "Bearer eyJ1aWQiOiAibGVjMSIsICJyb2xlIjogImxlY3R1cmVyIn0="},
        )
        self.assertEqual(r.status_code, 404)


if __name__ == "__main__":
    unittest.main()
