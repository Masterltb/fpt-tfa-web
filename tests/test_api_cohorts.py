"""API tests for cohort management."""
from __future__ import annotations

import unittest

try:
    from fastapi.testclient import TestClient

    from app.api.deps import get_cohort_repo
    from app.api.main import app
    from app.domain.models import Cohort
    from app.repositories import InMemoryCohortRepository

    _HAVE_FASTAPI = True
except Exception:
    _HAVE_FASTAPI = False


@unittest.skipUnless(_HAVE_FASTAPI, "fastapi not installed")
class TestApiCohorts(unittest.TestCase):
    def setUp(self) -> None:
        self.repo = InMemoryCohortRepository([
            Cohort(id="c1", owner_id="lec1", name="Capstone 2026"),
            Cohort(id="c2", owner_id="lec2", name="Other Class"),
        ])
        app.dependency_overrides[get_cohort_repo] = lambda: self.repo
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()

    def test_list_cohorts(self) -> None:
        r = self.client.get("/v1/cohorts", headers={"Authorization": "Bearer eyJ1aWQiOiAibGVjMSIsICJyb2xlIjogImxlY3R1cmVyIn0="})
        self.assertEqual(r.status_code, 200)
        cohorts = r.json()["cohorts"]
        self.assertEqual(len(cohorts), 1)
        self.assertEqual(cohorts[0]["id"], "c1")
        self.assertEqual(cohorts[0]["name"], "Capstone 2026")

    def test_create_cohort(self) -> None:
        r = self.client.post(
            "/v1/cohorts",
            json={"name": "New Cohort"},
            headers={"Authorization": "Bearer eyJ1aWQiOiAibGVjMSIsICJyb2xlIjogImxlY3R1cmVyIn0="}
        )
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], "New Cohort")
        self.assertEqual(data["owner_id"], "lec1")
        
        # Verify it was added to the repo
        self.assertIsNotNone(self.repo.get(data["id"]))

if __name__ == "__main__":
    unittest.main()
