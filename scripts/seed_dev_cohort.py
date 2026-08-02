"""Seed a synthetic cohort onto the real /v1 formation path (app/infra/db.py tables).

scripts/seed.py targets the other ORM (app/infra/db_models.py) and does not populate
the cohort/student/enrollment tables the /v1 endpoints actually read.

SYNTHETIC DEMONSTRATION DATA. Every student below is invented. Replace with a real
CSV roster import before this is shown to anyone as production content.

    uv run python scripts/seed_dev_cohort.py [lecturer_uid]
"""
from __future__ import annotations

import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.domain.models import Cohort, Skill, Student
from app.infra.db import init_db, make_engine, make_session_factory
from app.infra.sql_repository import SqlCohortRepository, SqlStudentRepository

COHORT_ID = "cohort-se1801-demo"

HO = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Vũ", "Đặng", "Bùi", "Đỗ"]
DEM = ["Văn", "Thị", "Hữu", "Đức", "Minh", "Quốc", "Thanh", "Ngọc"]
TEN = ["An", "Bình", "Chi", "Dũng", "Giang", "Hà", "Khoa", "Linh", "Mai", "Nam",
       "Oanh", "Phúc", "Quân", "Sơn", "Thảo", "Tuấn", "Uyên", "Vy", "Xuân", "Yến"]

MAJORS = ["SE", "AI", "IS", "IA"]
ROLES = ["backend", "frontend", "presenter", "qa", "leader"]
SKILLS = ["Java", "React", "SQL", "Figma", "Testing", "Python", "Docker", "TypeScript"]
SLOTS = ["mon-am", "mon-pm", "tue-am", "tue-pm", "wed-am", "wed-pm", "thu-am", "thu-pm", "fri-am"]


def build_roster(n: int = 30) -> list[Student]:
    students = []
    for i in range(n):
        # Deterministic spread so reruns produce the same roster.
        name = f"{HO[i % len(HO)]} {DEM[i % len(DEM)]} {TEN[i % len(TEN)]}"
        skills = [
            Skill(SKILLS[(i + k) % len(SKILLS)], (i * 7 + k * 3) % 5 + 1)
            for k in range(2 + i % 2)
        ]
        availability = frozenset(SLOTS[(i + s * 3) % len(SLOTS)] for s in range(2 + i % 3))
        students.append(
            Student(
                id=f"SE{170000 + i + 1}",
                name=name,
                major=MAJORS[i % len(MAJORS)],
                experience_years=round((i % 6) * 0.5, 1),
                skills=skills,
                availability=availability,
                desired_role=ROLES[i % len(ROLES)],
                preferred_teammates=frozenset(),
            )
        )
    return students


def main(lecturer_uid: str) -> None:
    url = os.environ.get("DATABASE_URL", "sqlite:///./tfa.db")
    engine = make_engine(url)
    init_db(engine)
    factory = make_session_factory(engine)
    cohorts = SqlCohortRepository(factory)
    students_repo = SqlStudentRepository(factory)

    cohorts.add(Cohort(id=COHORT_ID, owner_id=lecturer_uid, name="SE1801 — Capstone Project"))

    roster = build_roster()
    for s in roster:
        students_repo.save(s)
        cohorts.enroll_student(COHORT_ID, s.id)

    print(f"Seeded cohort {COHORT_ID} owned by {lecturer_uid} with {len(roster)} synthetic students.")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "dev-lecturer")
