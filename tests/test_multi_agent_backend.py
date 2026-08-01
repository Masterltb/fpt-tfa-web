"""Integration tests for Multi-Agent Backend Endpoints.

Verifies Admin, Lecturer, Student Team DNA, and Matching workflows.
"""
from __future__ import annotations

import unittest
from fastapi.testclient import TestClient
from app.api.main import app

class TestMultiAgentBackend(unittest.TestCase):

    def setUp(self) -> None:
        self.client = TestClient(app)
        # Mock bearer token auth for testing
        self.admin_headers = {"Authorization": "Bearer eyJ1aWQiOiJhZG1pbi0wMDEiLCAicm9sZSI6ICJhZG1pbiJ9"}
        self.lecturer_headers = {"Authorization": "Bearer eyJ1aWQiOiJsZWMtMDAxIiwgInJvbGUiOiAibGVjdHVyZXIifQ=="}
        self.student_headers = {"Authorization": "Bearer eyJ1aWQiOiJzdHUtMDAxIiwgInJvbGUiOiAic3R1ZGVudCJ9"}

    def test_health(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_admin_campuses(self) -> None:
        response = self.client.get("/api/v1/admin/campuses", headers=self.admin_headers)
        self.assertEqual(response.status_code, 200)
        campuses = response.json()
        self.assertTrue(any(c["code"] == "HCM" for c in campuses))

    def test_admin_roster_import(self) -> None:
        csv_content = "student_code,name,email,major_code\nSE170001,Nguyen Van A,anv@fpt.edu.vn,SE\nSE170002,Tran Thi B,btt@fpt.edu.vn,SE\n"
        response = self.client.post(
            "/api/v1/admin/class-sections/sec-se1701/import-roster",
            headers=self.admin_headers,
            files={"file": ("roster.csv", csv_content, "text/csv")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["imported_count"], 2)

    def test_student_dna_profile(self) -> None:
        # Get profile
        response = self.client.get("/api/v1/profiles/me", headers=self.student_headers)
        self.assertEqual(response.status_code, 200)

        # Update DNA profile
        payload = {
            "class_section_id": "sec-se1701",
            "skills": [{"name": "Python", "proficiency": 5}, {"name": "React", "proficiency": 4}],
            "preferred_roles": ["leader", "backend"],
            "experiences": [],
            "experience_years": 1.5,
            "availability": ["MON_AM", "WED_PM"],
            "interests": ["AI", "Web"],
            "commitment_level": "HIGH",
            "working_preferences": {"communication": "discord"},
            "portfolio_url": "https://github.com/test",
            "preferred_team_size": 4
        }
        update_res = self.client.put("/api/v1/profiles/me", headers=self.student_headers, json=payload)
        self.assertEqual(update_res.status_code, 200)
        self.assertGreater(update_res.json()["completion_percentage"], 80)

    def test_lecturer_grouping_workflow(self) -> None:
        # Create session
        sess_payload = {
            "class_section_id": "sec-se1701",
            "name": "Fall 2026 Matching Session",
            "mode": "HYBRID",
            "team_min_size": 4,
            "team_max_size": 5
        }
        create_res = self.client.post("/api/v1/lecturer/sessions", headers=self.lecturer_headers, json=sess_payload)
        self.assertEqual(create_res.status_code, 201)
        sess_id = create_res.json()["id"]

        # Trigger matching
        match_res = self.client.post(f"/api/v1/lecturer/sessions/{sess_id}/match", headers=self.lecturer_headers)
        self.assertEqual(match_res.status_code, 200)
        self.assertEqual(match_res.json()["status"], "MATCHED")

        # Approve and publish
        approve_res = self.client.post(f"/api/v1/lecturer/sessions/{sess_id}/approve", headers=self.lecturer_headers)
        self.assertEqual(approve_res.status_code, 200)
        self.assertEqual(approve_res.json()["status"], "PUBLISHED")


if __name__ == "__main__":
    unittest.main()
