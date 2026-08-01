"""Tiny end-to-end demo of the matching core (stdlib only).

Run:  python -m app.demo
Drives the real flow: build a cohort -> form teams -> print teams, rationale, balance.
No external deps, no network, no PII leaves the process.
"""
from __future__ import annotations

import random

from app.domain.models import Constraints, Project, Skill, Student
from app.matching.mock_engine import MockMatchingEngine


def _build_cohort(n: int, seed: int) -> list[Student]:
    rng = random.Random(seed)
    roles = ("leader", "coordinator", "researcher", "presenter", "member", "other")
    out = []
    for i in range(n):
        skills = [Skill(f"skill{j}", rng.randint(1, 5)) for j in range(rng.randint(1, 4))]
        out.append(
            Student(
                id=f"u{i}",
                name=f"Student {i}",
                skills=skills,
                experience_years=float(rng.choice([0, 1, 2, 3])),
                desired_role=rng.choice(roles),
            )
        )
    return out


def main() -> None:
    students = _build_cohort(13, seed=7)
    project = Project(id="capstone", min_size=3, max_size=5)
    cons = Constraints(must_pair=[("u0", "u1")], cannot_pair=[("u2", "u3")])
    formation = MockMatchingEngine().form_teams(students, project, cons, seed=7)

    print(f"status={formation.status}  seed={formation.seed}  balance={formation.balance}")
    if formation.status != "ok":
        print("conflicts:", formation.conflicts)
        return
    for t in formation.teams:
        comps = {s.id: s.competency() for s in students}
        print(f"\n{t.id}  ({len(t.member_ids)} members)")
        for m in t.member_ids:
            print(f"  - {m}  competency={comps[m]}")
        print(f"  rationale: {t.rationale}")
    if formation.unassignable:
        print("\nunassignable:", formation.unassignable)


if __name__ == "__main__":
    main()
