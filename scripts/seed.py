"""Database Seed Script for Team Formation Assistant (TFA).

Seeds FPT Academic structure (Campuses, Terms, Courses, Majors, Class Sections),
Users (Admin, Lecturers, Students), Team DNA profiles, Grouping Sessions, and Constraints.
"""
from __future__ import annotations

import os
import sys
import random
import json
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infra.database import engine, SessionLocal, Base
from app.infra.db_models import (
    UserRow, CampusRow, TermRow, CourseRow, MajorRow, ClassSectionRow,
    GroupingSessionRow, TeamDNARow, TeamRow, TeamMemberRow
)
from app.domain.models import UserRole, UserStatus, GroupingMode, GroupingSessionStatus, CommitmentLevel, TeamStatus


def seed() -> None:
    print("Starting database seeding process...")

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        # Clear existing rows cleanly
        session.query(TeamMemberRow).delete()
        session.query(TeamRow).delete()
        session.query(TeamDNARow).delete()
        session.query(GroupingSessionRow).delete()
        session.query(ClassSectionRow).delete()
        session.query(CourseRow).delete()
        session.query(MajorRow).delete()
        session.query(TermRow).delete()
        session.query(CampusRow).delete()
        session.query(UserRow).delete()
        session.commit()

        # 1. Seed Campuses
        hcm = CampusRow(id="camp-hcm", code="HCM", name="FPT Campus TP.HCM", is_active=True)
        hn = CampusRow(id="camp-hn", code="HN", name="FPT Campus Ha Noi", is_active=True)
        dn = CampusRow(id="camp-dn", code="DN", name="FPT Campus Da Nang", is_active=True)
        session.add_all([hcm, hn, dn])
        session.commit()

        # 2. Seed Terms & Majors
        term = TermRow(id="term-fall26", campus_id="camp-hcm", academic_year_id="2026", name="Fall 2026", status="ACTIVE")
        major_se = MajorRow(id="maj-se", code="SE", name="Software Engineering", campus_id="camp-hcm")
        major_ia = MajorRow(id="maj-ia", code="IA", name="Information Assurance", campus_id="camp-hcm")
        major_ai = MajorRow(id="maj-ai", code="AI", name="Artificial Intelligence", campus_id="camp-hcm")
        session.add_all([term, major_se, major_ia, major_ai])
        session.commit()

        # 3. Seed Courses
        course_prn = CourseRow(id="crs-prn232", code="PRN232", name="C# & .NET Enterprise Applications", major_id="maj-se")
        course_exe = CourseRow(id="crs-exe101", code="EXE101", name="Experiential Entrepreneurship 1", major_id="maj-se")
        session.add_all([course_prn, course_exe])
        session.commit()

        # 4. Seed Users (Admin & Lecturer)
        admin = UserRow(
            id="admin-001",
            email="admin@fpt.edu.vn",
            display_name="System Admin",
            role=UserRole.ADMIN,
            user_status=UserStatus.ACTIVE,
            campus_id="camp-hcm"
        )
        lecturer = UserRow(
            id="lec-001",
            email="lecturer@fpt.edu.vn",
            display_name="Dr. Le Van A",
            role=UserRole.LECTURER,
            user_status=UserStatus.ACTIVE,
            campus_id="camp-hcm"
        )
        session.add_all([admin, lecturer])
        session.commit()

        # 5. Seed Class Section
        sec = ClassSectionRow(
            id="sec-se1701",
            term_id="term-fall26",
            course_id="crs-prn232",
            lecturer_id="lec-001",
            code="SE1701",
            name="SE1701 - Fall 2026",
            capacity=40,
            status="ACTIVE",
            campus_id="camp-hcm"
        )
        session.add(sec)
        session.commit()

        # 6. Seed Grouping Session
        gs = GroupingSessionRow(
            id="sess-fall26-01",
            class_section_id="sec-se1701",
            name="Capstar Team Formation - Fall 2026",
            mode=GroupingMode.HYBRID,
            team_min_size=4,
            team_max_size=5,
            required_roles_json=json.dumps(["leader", "backend", "frontend", "qa"]),
            required_skills_json=json.dumps(["Python", "React", "PostgreSQL"]),
            required_majors_json=json.dumps(["SE", "IA"]),
            allow_cross_major=True,
            status=GroupingSessionStatus.OPEN,
            created_at=datetime.utcnow()
        )
        session.add(gs)
        session.commit()

        # 7. Seed 40 Student Users & Team DNA Profiles
        skills_pool = ["Python", "React", "Node.js", "C#", "PostgreSQL", "Figma", "Docker", "Go", "AWS", "TypeScript"]
        roles_pool = ["leader", "backend", "frontend", "qa", "designer", "devops"]


        for i in range(1, 41):
            s_id = f"stu-{i:03d}"
            code = f"SE17{i:04d}"
            email = f"student{i}@fpt.edu.vn"
            name = f"Nguyen Van Student {i}"

            user_st = UserRow(
                id=s_id,
                email=email,
                display_name=name,
                role=UserRole.STUDENT,
                user_status=UserStatus.ACTIVE,
                student_code=code,
                campus_id="camp-hcm"
            )
            session.add(user_st)


            # Team DNA
            selected_skills = [
                {"name": sk, "proficiency": random.randint(2, 5)}
                for sk in random.sample(skills_pool, random.randint(3, 5))
            ]
            pref_roles = random.sample(roles_pool, 2)
            avail = random.sample(["MON_AM", "TUE_PM", "WED_AM", "THU_PM", "FRI_AM"], random.randint(2, 4))

            dna = TeamDNARow(
                id=f"dna-{s_id}",
                student_id=s_id,
                class_section_id="sec-se1701",
                skills_json=json.dumps(selected_skills),
                preferred_roles_json=json.dumps(pref_roles),
                experience_years=round(random.uniform(0.5, 3.5), 1),
                availability_json=json.dumps(avail),
                interests_json=json.dumps(["Web", "AI", "Cloud"]),
                commitment_level=CommitmentLevel.HIGH,
                completion_percentage=85,
                updated_at=datetime.utcnow()
            )
            session.add(dna)

        session.commit()

        # 8. Seed 2 Pre-formed Teams (Student-led / Hybrid)
        team1 = TeamRow(
            id="team-001",
            session_id="sess-fall26-01",
            name="Team Alpha",
            member_ids_json=json.dumps(["stu-001", "stu-002", "stu-003", "stu-004"]),
            rationale="Pre-formed student-led team.",
            status=TeamStatus.FORMING,
            leader_id="stu-001",
            project_topic="Enterprise AI Team Matcher"
        )
        team2 = TeamRow(
            id="team-002",
            session_id="sess-fall26-01",
            name="Team Beta",
            member_ids_json=json.dumps(["stu-005", "stu-006", "stu-007", "stu-008"]),
            rationale="Pre-formed student-led team.",
            status=TeamStatus.FORMING,
            leader_id="stu-005",
            project_topic="Smart Roster Import System"
        )
        session.add_all([team1, team2])
        session.commit()

        print("Database seeded successfully with FPT academic structure, 40 students, 40 Team DNAs, 1 Grouping Session, and 2 teams.")


if __name__ == "__main__":
    seed()
