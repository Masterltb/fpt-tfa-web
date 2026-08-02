"""Database Seed Script for Team Formation Assistant (TFA).

Populates multi-disciplinary FPT University structure across ALL faculties:
- IT & AI (Software Engineering, Information Assurance, AI)
- Business & Marketing (Business Administration, Digital Marketing, International Business)
- Design & Media (Graphic Design, Multimedia Communication)
- Languages & Hospitality (English, Japanese, Hotel Management)

Supports Capstone & Interdisciplinary courses like EXE101/EXE201 where cross-major teaming is required.
"""
from __future__ import annotations

import os
import sys
import random
import json
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infra.database import engine, SessionLocal, Base
from app.infra.db_models import (
    UserRow, CampusRow, TermRow, CourseRow, MajorRow, ProgramRow, ClassSectionRow,
    GroupingSessionRow, TeamDNARow, TeamRow, TeamMemberRow, AuditEventRow
)
from app.domain.models import UserRole, UserStatus, GroupingMode, GroupingSessionStatus, CommitmentLevel, TeamStatus


def seed() -> None:
    print("Seeding multi-disciplinary FPT University database...")

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        # Clear existing rows
        session.query(AuditEventRow).delete()
        session.query(TeamMemberRow).delete()
        session.query(TeamRow).delete()
        session.query(TeamDNARow).delete()
        session.query(GroupingSessionRow).delete()
        session.query(ClassSectionRow).delete()
        session.query(CourseRow).delete()
        session.query(MajorRow).delete()
        session.query(ProgramRow).delete()
        session.query(TermRow).delete()
        session.query(CampusRow).delete()
        session.query(UserRow).delete()
        session.commit()

        # 1. Seed 5 Campuses
        c1 = CampusRow(id="camp-hcm", code="HCM", name="FPT Campus TP.HCM", is_active=True)
        c2 = CampusRow(id="camp-hn", code="HN", name="FPT Campus Hà Nội", is_active=True)
        c3 = CampusRow(id="camp-dn", code="DN", name="FPT Campus Đà Nẵng", is_active=True)
        c4 = CampusRow(id="camp-ct", code="CT", name="FPT Campus Cần Thơ", is_active=True)
        c5 = CampusRow(id="camp-qn", code="QN", name="FPT Campus Quy Nhơn", is_active=True)
        session.add_all([c1, c2, c3, c4, c5])
        session.commit()

        # 2. Seed Academic Programs (Faculties)
        prog_it = ProgramRow(id="prog-it", code="IT", name="Khoa Công Nghệ Thông Tin", campus_id="camp-hcm")
        prog_biz = ProgramRow(id="prog-biz", code="BIZ", name="Khoa Quản Trị Kinh Doanh", campus_id="camp-hcm")
        prog_des = ProgramRow(id="prog-des", code="DES", name="Khoa Thiết Kế Đồ Họa & Truyền Thông", campus_id="camp-hcm")
        prog_lang = ProgramRow(id="prog-lang", code="LANG", name="Khoa Ngôn Ngữ", campus_id="camp-hcm")
        session.add_all([prog_it, prog_biz, prog_des, prog_lang])
        session.commit()

        # 3. Seed Majors across ALL Faculties
        majors_list = [
            MajorRow(id="maj-se", code="SE", name="Kỹ Thuật Phần Mềm (Software Engineering)", program_id="prog-it", campus_id="camp-hcm"),
            MajorRow(id="maj-ia", code="IA", name="An Toàn Thông Tin (Information Assurance)", program_id="prog-it", campus_id="camp-hcm"),
            MajorRow(id="maj-ai", code="AI", name="Trí Tuệ Nhân Tạo (Artificial Intelligence)", program_id="prog-it", campus_id="camp-hcm"),
            MajorRow(id="maj-ba", code="BA", name="Quản Trị Kinh Doanh (Business Administration)", program_id="prog-biz", campus_id="camp-hcm"),
            MajorRow(id="maj-dm", code="DM", name="Digital Marketing", program_id="prog-biz", campus_id="camp-hcm"),
            MajorRow(id="maj-ib", code="IB", name="Kinh Doanh Quốc Tế (International Business)", program_id="prog-biz", campus_id="camp-hcm"),
            MajorRow(id="maj-gd", code="GD", name="Thiết Kế Đồ Họa (Graphic Design)", program_id="prog-des", campus_id="camp-hcm"),
            MajorRow(id="maj-mc", code="MC", name="Truyền Thông Đa Phương Tiện (Multimedia Communication)", program_id="prog-des", campus_id="camp-hcm"),
            MajorRow(id="maj-eng", code="ENG", name="Ngôn Ngữ Anh (English Language)", program_id="prog-lang", campus_id="camp-hcm"),
            MajorRow(id="maj-jpn", code="JPN", name="Ngôn Ngữ Nhật (Japanese Language)", program_id="prog-lang", campus_id="camp-hcm"),
        ]
        session.add_all(majors_list)
        session.commit()

        # 4. Seed Terms
        term = TermRow(id="term_fall2026", campus_id="camp-hcm", academic_year_id="2026", name="Fall 2026", status="ACTIVE")
        session.add(term)
        session.commit()

        # 5. Seed Courses
        courses_list = [
            CourseRow(id="crs-swe201c", code="SWE201c", name="Introduction to Software Engineering", description="Môn Kỹ thuật Phần mềm cơ bản"),
            CourseRow(id="crs-prj301", code="PRJ301", name="Java Web Application Development", description="Lập trình Web Java"),
            CourseRow(id="crs-swp391", code="SWP391", name="Application Development Project", major_id="maj-se"),
            CourseRow(id="crs-exe101", code="EXE101", name="Experiential Entrepreneurship 1", description="Khởi nghiệp liên ngành"),
        ]
        session.add_all(courses_list)
        session.commit()

        # 6. Seed Users (Admin, Lecturers, Default Dev Students)
        admin = UserRow(id="adm_01", email="admin@fpt.edu.vn", display_name="Quản Trị Viên Hệ Thống", role=UserRole.ADMIN, user_status=UserStatus.ACTIVE, campus_id="camp-hcm")
        lec1 = UserRow(id="lec_01", email="hungnv@fpt.edu.vn", display_name="TS. Nguyễn Văn Hùng", role=UserRole.LECTURER, user_status=UserStatus.ACTIVE, campus_id="camp-hcm")
        stu_dev = UserRow(id="stu_01", email="student01.se@fpt.edu.vn", display_name="Nguyễn Văn A (Student)", role=UserRole.STUDENT, student_code="SE180001", user_status=UserStatus.ACTIVE, campus_id="camp-hcm")
        session.add_all([admin, lec1, stu_dev])
        session.commit()

        # 7. Seed Class Sections
        sec1 = ClassSectionRow(id="sec_se1801_swe201c", term_id="term_fall2026", course_id="crs-swe201c", lecturer_id="lec_01", code="SE1801", name="SE1801 — SWE201c", capacity=36, status="ACTIVE", campus_id="camp-hcm")
        sec2 = ClassSectionRow(id="sec_se1802_prj301", term_id="term_fall2026", course_id="crs-prj301", lecturer_id="lec_01", code="SE1802", name="SE1802 — PRJ301", capacity=32, status="ACTIVE", campus_id="camp-hcm")
        sec3 = ClassSectionRow(id="sec_se1803_swp391", term_id="term_fall2026", course_id="crs-swp391", lecturer_id="lec_01", code="SE1803", name="SE1803 — SWP391", capacity=40, status="ACTIVE", campus_id="camp-hcm")
        session.add_all([sec1, sec2, sec3])
        session.commit()

        # 8. Seed Grouping Sessions
        gs1 = GroupingSessionRow(
            id="sess_01_se1801",
            class_section_id="sec_se1801_swe201c",
            name="Phiên Ghép Nhóm SE1801 (SWE201c)",
            mode=GroupingMode.HYBRID,
            team_min_size=4,
            team_max_size=6,
            required_roles_json=json.dumps(["Leader", "Frontend", "Backend", "QA/Tester"]),
            required_skills_json=json.dumps(["React", "Node.js", "Python", "SQL"]),
            status=GroupingSessionStatus.OPEN,
            created_at=datetime.utcnow()
        )
        gs2 = GroupingSessionRow(
            id="sess_02_se1802",
            class_section_id="sec_se1802_prj301",
            name="Phiên Ghép Nhóm SE1802 (PRJ301)",
            mode=GroupingMode.LECTURER_LED,
            team_min_size=4,
            team_max_size=5,
            status=GroupingSessionStatus.OPEN,
            created_at=datetime.utcnow()
        )
        session.add_all([gs1, gs2])
        session.commit()

        # 9. Seed Teams & Members
        t1 = TeamRow(
            id="team-01",
            session_id="sess_01_se1801",
            name="Nhóm 01 — SWE201c (Team Alpha)",
            member_ids_json=json.dumps(["stu-001", "stu-002", "stu-003", "stu-004"]),
            rationale="Tối ưu hóa trùng khớp kỹ năng Frontend/Backend và 95% lịch rảnh chung",
            status=TeamStatus.APPROVED,
            leader_id="stu-001"
        )
        t2 = TeamRow(
            id="team-02",
            session_id="sess_01_se1801",
            name="Nhóm 02 — SWE201c (Team Beta)",
            member_ids_json=json.dumps(["stu-005", "stu-006", "stu-007", "stu-008"]),
            rationale="Cân bằng GPA và bổ sung thiết kế UI/UX",
            status=TeamStatus.FORMING,
            leader_id="stu-005"
        )
        session.add_all([t1, t2])
        session.commit()

        # 10. Seed 60 Students Across Multi-Disciplinary Majors with Team DNA
        majors_map = {
            "SE": ["Python", "React", "Node.js", "C#", "PostgreSQL", "Docker"],
            "DM": ["Digital Marketing", "SEO/SEM", "Content Strategy", "Social Media", "Google Analytics"],
            "GD": ["Figma Design", "Photoshop", "Illustrator", "UI/UX Prototyping", "Branding"],
            "BA": ["Financial Modeling", "Business Plan", "Market Research", "Project Management"],
            "ENG": ["Business Communication", "English Presentation", "Content Writing"],
            "MC": ["Video Editing", "Copywriting", "Media Campaign", "PR Strategy"]
        }

        roles_by_major = {
            "SE": ["Tech Lead (IT)", "Fullstack Developer", "QA Engineer"],
            "DM": ["Marketing Manager", "Growth Hacker"],
            "GD": ["UI/UX Designer", "Creative Director"],
            "BA": ["Leader/CEO", "Financial Analyst"],
            "ENG": ["Communications Specialist"],
            "MC": ["Content Creator", "PR Manager"]
        }

        all_majors_list = list(majors_map.keys())

        students_list = []
        dnas_list = []
        for i in range(1, 61):
            s_id = f"stu-{i:03d}"
            major_code = all_majors_list[(i - 1) % len(all_majors_list)]
            code = f"{major_code}17{i:04d}"
            email = f"student{i}.{major_code.lower()}@fpt.edu.vn"
            name = f"Nguyễn Văn Sinh Viên {i} ({major_code})"

            user_st = UserRow(
                id=s_id,
                email=email,
                display_name=name,
                role=UserRole.STUDENT,
                user_status=UserStatus.ACTIVE,
                student_code=code,
                campus_id="camp-hcm"
            )
            students_list.append(user_st)

            major_skills = majors_map[major_code]
            selected_skills = [
                {"name": sk, "proficiency": random.randint(3, 5)}
                for sk in random.sample(major_skills, min(3, len(major_skills)))
            ]
            pref_roles = random.sample(roles_by_major[major_code], 1)
            avail = random.sample(["MON_AM", "TUE_PM", "WED_AM", "THU_PM", "FRI_AM"], random.randint(2, 4))

            dna = TeamDNARow(
                id=f"dna-{s_id}",
                student_id=s_id,
                class_section_id="sec_se1801_swe201c",
                skills_json=json.dumps(selected_skills),
                preferred_roles_json=json.dumps(pref_roles),
                experience_years=round(random.uniform(0.5, 3.5), 1),
                availability_json=json.dumps(avail),
                interests_json=json.dumps(["Phát triển phần mềm", "Khởi nghiệp", "UI/UX", "AI"]),
                commitment_level=CommitmentLevel.HIGH,
                completion_percentage=90,
                updated_at=datetime.utcnow()
            )
            dnas_list.append(dna)

        session.add_all(students_list)
        session.commit()

        session.add_all(dnas_list)
        session.commit()

        # 11. Seed Audit Events
        ae1 = AuditEventRow(id="ae-01", cohort_id="cohort-01", user_id="lec_01", user_role="LECTURER", action="PUBLISH_TEAMS_OVERRIDE", payload='{"session_id": "sess_01_se1801", "teams_count": 8}', timestamp=datetime.utcnow())
        ae2 = AuditEventRow(id="ae-02", cohort_id="cohort-01", user_id="adm_01", user_role="ADMIN", action="IMPORT_ROSTER_EXCEL", payload='{"file": "SWE201c_Roster.xlsx", "rows": 36}', timestamp=datetime.utcnow())
        session.add_all([ae1, ae2])

        session.commit()
        print("Database successfully seeded with ALL real entities in Supabase PostgreSQL!")


if __name__ == "__main__":
    seed()
