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

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.infra.database import engine, SessionLocal, Base
from app.infra.db_models import (
    UserRow, CampusRow, TermRow, CourseRow, MajorRow, ProgramRow, ClassSectionRow,
    GroupingSessionRow, TeamDNARow, TeamRow, TeamMemberRow
)
from app.domain.models import UserRole, UserStatus, GroupingMode, GroupingSessionStatus, CommitmentLevel


def seed() -> None:
    print("Seeding multi-disciplinary FPT University database...")

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as session:
        # Clear existing rows
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

        # 1. Seed Campuses
        hcm = CampusRow(id="camp-hcm", code="HCM", name="FPT Campus TP.HCM", is_active=True)
        hn = CampusRow(id="camp-hn", code="HN", name="FPT Campus Ha Noi", is_active=True)
        dn = CampusRow(id="camp-dn", code="DN", name="FPT Campus Da Nang", is_active=True)
        ct = CampusRow(id="camp-ct", code="CT", name="FPT Campus Can Tho", is_active=True)
        session.add_all([hcm, hn, dn, ct])
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
            # IT & AI
            MajorRow(id="maj-se", code="SE", name="Kỹ Thuật Phần Mềm (Software Engineering)", program_id="prog-it", campus_id="camp-hcm"),
            MajorRow(id="maj-ia", code="IA", name="An Thống Thông Tin (Information Assurance)", program_id="prog-it", campus_id="camp-hcm"),
            MajorRow(id="maj-ai", code="AI", name="Trí Tuệ Nhân Tạo (Artificial Intelligence)", program_id="prog-it", campus_id="camp-hcm"),
            # Business & Marketing
            MajorRow(id="maj-ba", code="BA", name="Quản Trị Kinh Doanh (Business Administration)", program_id="prog-biz", campus_id="camp-hcm"),
            MajorRow(id="maj-dm", code="DM", name="Digital Marketing", program_id="prog-biz", campus_id="camp-hcm"),
            MajorRow(id="maj-ib", code="IB", name="Kinh Doanh Quốc Tế (International Business)", program_id="prog-biz", campus_id="camp-hcm"),
            # Design & Media
            MajorRow(id="maj-gd", code="GD", name="Thiết Kế Đồ Họa (Graphic Design)", program_id="prog-des", campus_id="camp-hcm"),
            MajorRow(id="maj-mc", code="MC", name="Truyền Thông Đa Phương Tiện (Multimedia Communication)", program_id="prog-des", campus_id="camp-hcm"),
            # Languages
            MajorRow(id="maj-eng", code="ENG", name="Ngôn Ngữ Anh (English Language)", program_id="prog-lang", campus_id="camp-hcm"),
            MajorRow(id="maj-jpn", code="JPN", name="Ngôn Ngữ Nhật (Japanese Language)", program_id="prog-lang", campus_id="camp-hcm"),
        ]
        session.add_all(majors_list)
        session.commit()

        # 4. Seed Terms
        term = TermRow(id="term-fall26", campus_id="camp-hcm", academic_year_id="2026", name="Fall 2026", status="ACTIVE")
        session.add(term)
        session.commit()

        # 5. Seed Multi-disciplinary Courses
        courses_list = [
            # Interdisciplinary Capstone Course (ALL MAJORS)
            CourseRow(id="crs-exe101", code="EXE101", name="Trải Nghiệm Khởi Nghiệp 1 (Experiential Entrepreneurship 1)", description="Môn học liên ngành bắt buộc kết hợp sinh viên IT, Kinh tế và Thiết kế."),
            CourseRow(id="crs-exe201", code="EXE201", name="Trải Nghiệm Khởi Nghiệp 2 (Experiential Entrepreneurship 2)", description="Dự án khởi nghiệp thực chiến đa ngành."),
            # IT Courses
            CourseRow(id="crs-swp391", code="SWP391", name="Dự Án Phôi Phần Mềm (Software Development Project)", major_id="maj-se"),
            CourseRow(id="crs-prn232", code="PRN232", name="C# & .NET Enterprise Applications", major_id="maj-se"),
            # Business Courses
            CourseRow(id="crs-mkt201", code="MKT201", name="Nguyên Lý Marketing (Marketing Principles)", major_id="maj-dm"),
            CourseRow(id="crs-bus301", code="BUS301", name="Quản Trị Chiến Lược (Strategic Management)", major_id="maj-ba"),
            # Design Courses
            CourseRow(id="crs-des302", code="DES302", name="Thiết Kế UI/UX & Nhận Diện Thương Hiệu", major_id="maj-gd"),
        ]
        session.add_all(courses_list)
        session.commit()

        # 6. Seed Users (Admin & Lecturers)
        admin = UserRow(
            id="admin-001",
            email="admin@fpt.edu.vn",
            display_name="System Admin",
            role=UserRole.ADMIN,
            user_status=UserStatus.ACTIVE,
            campus_id="camp-hcm"
        )
        lecturer_it = UserRow(
            id="lec-001",
            email="lecturer.it@fpt.edu.vn",
            display_name="Dr. Le Van A (Khoa CNTT)",
            role=UserRole.LECTURER,
            user_status=UserStatus.ACTIVE,
            campus_id="camp-hcm"
        )
        lecturer_biz = UserRow(
            id="lec-002",
            email="lecturer.biz@fpt.edu.vn",
            display_name="ThS. Tran Thi B (Khoa QTKD)",
            role=UserRole.LECTURER,
            user_status=UserStatus.ACTIVE,
            campus_id="camp-hcm"
        )
        session.add_all([admin, lecturer_it, lecturer_biz])
        session.commit()

        # 7. Seed Interdisciplinary Class Section (EXE101 Interdisciplinary Capstone)
        sec_exe = ClassSectionRow(
            id="sec-exe101-01",
            term_id="term-fall26",
            course_id="crs-exe101",
            lecturer_id="lec-002",
            code="EXE101_FALL26",
            name="EXE101 - Lớp Dự Án Khởi Nghiệp Đa Ngành",
            capacity=50,
            status="ACTIVE",
            campus_id="camp-hcm"
        )
        session.add(sec_exe)
        session.commit()

        # 8. Seed Interdisciplinary Grouping Session (Hybrid Mode with Cross-Major Teaming Rules)
        gs_exe = GroupingSessionRow(
            id="sess-exe101-cross",
            class_section_id="sec-exe101-01",
            name="Đợt Ghép Nhóm Khởi Nghiệp Đa Ngành EXE101",
            mode=GroupingMode.HYBRID,
            team_min_size=4,
            team_max_size=5,
            required_roles_json=json.dumps(["Leader/CEO", "Tech Lead (IT)", "Marketing Manager (Kinh Tế)", "UI/UX Designer (Thiết Kế)"]),
            required_skills_json=json.dumps(["Python/React", "Digital Marketing", "Figma Design", "Financial Modeling"]),
            required_majors_json=json.dumps(["SE", "DM", "GD", "BA"]),
            allow_cross_major=True,
            max_same_major_count=2,
            weights_json=json.dumps({
                "skillCoverage": 30.0,
                "majorDiversity": 25.0,  # High weight on cross-major diversity!
                "roleFit": 20.0,
                "availability": 15.0,
                "commitmentLevel": 10.0
            }),
            status=GroupingSessionStatus.OPEN,
            created_at=datetime.utcnow()
        )
        session.add(gs_exe)
        session.commit()

        # 9. Seed 60 Students Across Multi-Disciplinary Majors
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
            "DM": ["Marketing Manager (Kinh Tế)", "Growth Hacker"],
            "GD": ["UI/UX Designer (Thiết Kế)", "Creative Director"],
            "BA": ["Leader/CEO", "Financial Analyst"],
            "ENG": ["Communications Specialist"],
            "MC": ["Content Creator", "PR Manager"]
        }

        all_majors_list = list(majors_map.keys())

        for i in range(1, 61):
            s_id = f"stu-{i:03d}"
            major_code = all_majors_list[(i - 1) % len(all_majors_list)]
            code = f"{major_code}17{i:04d}"
            email = f"student{i}.{major_code.lower()}@fpt.edu.vn"
            name = f"Nguyen Student {i} ({major_code})"

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

            # Generate realistic Team DNA per major
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
                class_section_id="sec-exe101-01",
                skills_json=json.dumps(selected_skills),
                preferred_roles_json=json.dumps(pref_roles),
                experience_years=round(random.uniform(0.5, 3.5), 1),
                availability_json=json.dumps(avail),
                interests_json=json.dumps(["Khởi nghiệp Đa ngành", "EdTech", "FinTech", "E-Commerce"]),
                commitment_level=CommitmentLevel.HIGH,
                completion_percentage=90,
                updated_at=datetime.utcnow()
            )
            session.add(dna)

        session.commit()

        print("Database successfully seeded with multi-disciplinary FPT faculties (IT, Business, Design, Languages), 60 students, 60 Team DNAs, and Interdisciplinary Grouping Session EXE101!")


if __name__ == "__main__":
    seed()
