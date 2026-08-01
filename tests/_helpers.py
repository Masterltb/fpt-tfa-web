"""Shared test helpers (stdlib only)."""
from __future__ import annotations

import random

from app.domain.models import Skill, Student


def make_cohort(n: int, rng: random.Random) -> list[Student]:
    students: list[Student] = []
    for i in range(n):
        n_sk = rng.randint(1, 4)
        skills = [Skill(f"skill{j}", rng.randint(1, 5)) for j in range(n_sk)]
        students.append(
            Student(
                id=f"u{i}",
                name=f"Student {i}",
                skills=skills,
                experience_years=float(rng.choice([0, 1, 2, 3])),
                desired_role=rng.choice(("leader", "coordinator", "researcher", "presenter", "member", "other")),
            )
        )
    return students
