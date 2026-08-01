"""Hard-constraint validators (R1, R2, R7). Pure stdlib.

These check a produced Formation against the non-negotiable rules. The engine uses them to
guarantee it never emits an invalid formation (constitution: hard constraints never violated).
"""
from __future__ import annotations

from .models import Constraints, Formation, Project, Student


def _pairs_as_sets(pairs: list[tuple[str, str]]) -> list[frozenset[str]]:
    return [frozenset(p) for p in pairs]


def violations(
    formation: Formation,
    students: list[Student],
    project: Project,
    constraints: Constraints,
) -> list[str]:
    """Return a list of hard-constraint violations. Empty list == valid."""
    problems: list[str] = []
    if formation.status != "ok":
        return problems  # infeasible results are validated separately

    all_ids = {s.id for s in students}
    assigned: list[str] = [mid for t in formation.teams for mid in t.member_ids]
    assigned_set = set(assigned)

    # R7: exactly-once (assigned + unassignable partition the cohort, no duplicates)
    if len(assigned) != len(assigned_set):
        problems.append("R7: a student appears in more than one team")
    flagged = {sid for sid, _ in formation.unassignable}
    covered = assigned_set | flagged
    if covered != all_ids:
        missing = all_ids - covered
        extra = covered - all_ids
        if missing:
            problems.append(f"R7: students never placed or flagged: {sorted(missing)}")
        if extra:
            problems.append(f"R7: unknown students in result: {sorted(extra)}")

    # R1: team size band
    for t in formation.teams:
        if not project.min_size <= len(t.member_ids) <= project.max_size:
            problems.append(
                f"R1: team {t.id} size {len(t.member_ids)} outside "
                f"[{project.min_size}, {project.max_size}]"
            )

    # R2: must-pair together, cannot-pair apart
    team_of: dict[str, str] = {mid: t.id for t in formation.teams for mid in t.member_ids}
    for a, b in constraints.must_pair:
        if a in team_of and b in team_of and team_of[a] != team_of[b]:
            problems.append(f"R2: must-pair {a},{b} split across teams")
    for a, b in constraints.cannot_pair:
        if a in team_of and b in team_of and team_of[a] == team_of[b]:
            problems.append(f"R2: cannot-pair {a},{b} placed together")

    return problems
