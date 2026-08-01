"""Comprehensive QA Test Automation Suite for API Contract v1.0.0 (Agent Role: QA / Tester).

Tests Auth & User Management, Academic Catalogs & Sections, Student Profile & DNA,
Grouping Sessions State Machine, Teams & Invitations, and Async Matching Runs.
"""
from __future__ import annotations

import unittest
from fastapi.testclient import TestClient
from app.api.main import app


class TestApiFullContract(unittest.TestCase):

    def setUp(self) -> None:
        self.client = TestClient(app)
        self.admin_headers = {"Authorization": "Bearer eyJ1aWQiOiJhZG1pbi0wMDEiLCAicm9sZSI6ICJhZG1pbiJ9"}
        self.lecturer_headers = {"Authorization": "Bearer eyJ1aWQiOiJsZWMtMDAxIiwgInJvbGUiOiAibGVjdHVyZXIifQ=="}
        self.student_headers = {"Authorization": "Bearer eyJ1aWQiOiJzdHUtMDAxIiwgInJvbGUiOiAic3R1ZGVudCJ9"}

    # ---------------------------------------------------------------------------
    # Stream 1: Auth & User Management
    # ---------------------------------------------------------------------------

    def test_auth_login(self) -> None:
        res = self.client.post("/api/v1/auth/login", json={"email": "student@fpt.edu.vn", "password": "password123"})
        self.assertEqual(res.status_code, 200)
        self.assertIn("access_token", res.json()["data"])

    def test_auth_me(self) -> None:
        res = self.client.get("/api/v1/auth/me", headers=self.student_headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["data"]["id"], "stu-001")

    def test_users_list_admin_only(self) -> None:
        # Non-admin should be forbidden (403)
        forbidden_res = self.client.get("/api/v1/users", headers=self.student_headers)
        self.assertEqual(forbidden_res.status_code, 403)

        # Admin should succeed (200)
        res = self.client.get("/api/v1/users", headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        self.assertGreater(len(res.json()["data"]), 0)

    # ---------------------------------------------------------------------------
    # Stream 2: Academic Catalogs & Sections
    # ---------------------------------------------------------------------------

    def test_academic_catalogs(self) -> None:
        res_campuses = self.client.get("/api/v1/campuses")
        self.assertEqual(res_campuses.status_code, 200)

        res_terms = self.client.get("/api/v1/terms")
        self.assertEqual(res_terms.status_code, 200)

        res_majors = self.client.get("/api/v1/majors")
        self.assertEqual(res_majors.status_code, 200)

        res_skills = self.client.get("/api/v1/skills")
        self.assertEqual(res_skills.status_code, 200)

    # ---------------------------------------------------------------------------
    # Stream 3: Student Profile & DNA
    # ---------------------------------------------------------------------------

    def test_student_dashboard_and_dna(self) -> None:
        dash_res = self.client.get("/api/v1/students/me/dashboard", headers=self.student_headers)
        self.assertEqual(dash_res.status_code, 200)
        self.assertEqual(dash_res.json()["data"]["student_id"], "stu-001")

        dna_res = self.client.get("/api/v1/students/me/team-profile", headers=self.student_headers)
        self.assertEqual(dna_res.status_code, 200)

    # ---------------------------------------------------------------------------
    # Stream 4: Grouping Sessions & State Machine
    # ---------------------------------------------------------------------------

    def test_grouping_sessions_state_machine(self) -> None:
        # Create session (DRAFT)
        payload = {
            "class_section_id": "sec-se1701",
            "name": "Fall 2026 Test Session",
            "mode": "HYBRID",
            "team_min_size": 4,
            "team_max_size": 5
        }
        create_res = self.client.post("/api/v1/grouping-sessions", headers=self.lecturer_headers, json=payload)
        self.assertEqual(create_res.status_code, 201)
        sess_id = create_res.json()["data"]["id"]

        # Transition: DRAFT -> OPEN
        open_res = self.client.post(f"/api/v1/grouping-sessions/{sess_id}/open", headers=self.lecturer_headers)
        self.assertEqual(open_res.status_code, 200)
        self.assertEqual(open_res.json()["data"]["status"], "OPEN")

        # Transition: OPEN -> FROZEN
        freeze_res = self.client.post(f"/api/v1/grouping-sessions/{sess_id}/freeze", headers=self.lecturer_headers)
        self.assertEqual(freeze_res.status_code, 200)
        self.assertEqual(freeze_res.json()["data"]["status"], "FROZEN")

    # ---------------------------------------------------------------------------
    # Stream 5: Teams, Invitations & Join Requests
    # ---------------------------------------------------------------------------

    def test_teams_and_invitations(self) -> None:
        # Create team
        team_res = self.client.post(
            "/api/v1/grouping-sessions/sess-fall26-01/teams",
            headers=self.student_headers,
            json={"name": "Team Delta", "project_topic": "FastAPI TFA Project"}
        )
        self.assertEqual(team_res.status_code, 201)
        team_id = team_res.json()["data"]["id"]

        # Send invitation
        inv_res = self.client.post(
            f"/api/v1/teams/{team_id}/invitations",
            headers=self.student_headers,
            json={"to_student_id": "stu-002", "message": "Join our team!"}
        )
        self.assertEqual(inv_res.status_code, 201)

    # ---------------------------------------------------------------------------
    # Stream 6: Matching Runs, Reports & Audit
    # ---------------------------------------------------------------------------

    def test_async_matching_run_and_reports(self) -> None:
        match_res = self.client.post(
            "/api/v1/grouping-sessions/sess-fall26-01/match-runs",
            headers=self.lecturer_headers,
            json={"seed": 42, "time_limit_seconds": 5.0}
        )
        self.assertEqual(match_res.status_code, 202)
        self.assertIn("id", match_res.json()["data"])

        report_res = self.client.get("/api/v1/reports/dashboard/lecturer", headers=self.lecturer_headers)
        self.assertEqual(report_res.status_code, 200)

        export_res = self.client.get("/api/v1/grouping-sessions/sess-fall26-01/exports/teams.csv", headers=self.lecturer_headers)
        self.assertEqual(export_res.status_code, 200)
        self.assertEqual(export_res.headers["content-type"], "text/csv; charset=utf-8")


if __name__ == "__main__":
    unittest.main()
