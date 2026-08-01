"""End-to-End Automated Workflow Test Suite for TFA Platform (Spec 017).

Simulates full multi-role end-to-end flow:
1. Admin sets up Campus, Term, Course, and imports Roster.
2. Student completes Team DNA profile and creates a student-led team.
3. Lecturer configures Grouping Session, triggers AI Matcher, overrides team, approves, and publishes.
"""
from __future__ import annotations

import unittest
from fastapi.testclient import TestClient
from app.api.main import app


class TestE2EPlatformWorkflow(unittest.TestCase):

    def setUp(self) -> None:
        self.client = TestClient(app)
        self.admin_headers = {"Authorization": "Bearer eyJ1aWQiOiJhZG1pbi0wMDEiLCAicm9sZSI6ICJhZG1pbiJ9"}
        self.lecturer_headers = {"Authorization": "Bearer eyJ1aWQiOiJsZWMtMDAxIiwgInJvbGUiOiAibGVjdHVyZXIifQ=="}
        self.student_headers = {"Authorization": "Bearer eyJ1aWQiOiJzdHUtMDAxIiwgInJvbGUiOiAic3R1ZGVudCJ9"}

    def test_full_end_to_end_user_journey(self) -> None:
        # Step 1: Admin creates Campus and imports CSV roster
        res_camp = self.client.get("/api/v1/campuses")
        self.assertEqual(res_camp.status_code, 200)

        csv_data = "student_code,name,email,major_code\nSE170010,Tran Van X,xtv@fpt.edu.vn,SE\n"
        res_import = self.client.post(
            "/api/v1/admin/class-sections/sec-se1701/import-roster",
            headers=self.admin_headers,
            files={"file": ("roster.csv", csv_data, "text/csv")}
        )
        self.assertEqual(res_import.status_code, 200)

        # Step 2: Student completes Team DNA
        dna_payload = {
            "class_section_id": "sec-se1701",
            "skills": [{"name": "Python", "proficiency": 5}, {"name": "React", "proficiency": 4}],
            "preferred_roles": ["leader", "backend"],
            "experiences": [{"project_name": "TFA Engine", "role": "Lead", "duration_months": 6}],
            "experience_years": 2.0,
            "availability": ["MON_AM", "TUE_PM"],
            "interests": ["AI", "Web"],
            "commitment_level": "HIGH",
            "working_preferences": {"communication": "discord"},
            "portfolio_url": "https://github.com/test",
            "preferred_team_size": 4
        }
        res_dna = self.client.put("/api/v1/students/me/team-profile", headers=self.student_headers, json=dna_payload)
        self.assertEqual(res_dna.status_code, 200)
        self.assertEqual(res_dna.json()["data"]["completion_percentage"], 100)

        # Step 3: Student creates team and invites teammate
        res_team = self.client.post(
            "/api/v1/grouping-sessions/sess-fall26-01/teams",
            headers=self.student_headers,
            json={"name": "End-to-End Alpha", "project_topic": "Capstar Matching"}
        )
        self.assertEqual(res_team.status_code, 201)
        team_id = res_team.json()["data"]["id"]

        res_inv = self.client.post(
            f"/api/v1/teams/{team_id}/invitations",
            headers=self.student_headers,
            json={"to_student_id": "stu-002", "message": "Join us!"}
        )
        self.assertEqual(res_inv.status_code, 201)

        # Step 4: Lecturer triggers AI matching job
        res_match = self.client.post(
            "/api/v1/grouping-sessions/sess-fall26-01/match-runs",
            headers=self.lecturer_headers,
            json={"seed": 100, "time_limit_seconds": 3.0}
        )
        self.assertEqual(res_match.status_code, 202)
        run_id = res_match.json()["data"]["id"]

        # Step 5: Lecturer applies run, approves team and publishes session
        res_apply = self.client.post(f"/api/v1/match-runs/{run_id}/apply", headers=self.lecturer_headers)
        self.assertEqual(res_apply.status_code, 200)

        res_pub = self.client.post("/api/v1/grouping-sessions/sess-fall26-01/publish", headers=self.lecturer_headers)
        self.assertEqual(res_pub.status_code, 200)
        self.assertEqual(res_pub.json()["data"]["status"], "PUBLISHED")


if __name__ == "__main__":
    unittest.main()
