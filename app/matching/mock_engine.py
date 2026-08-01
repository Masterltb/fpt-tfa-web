"""Deterministic mock matching engine. Pure stdlib.

A placeholder for the real OR-Tools engine (free, OSS — deferred). It GUARANTEES the hard
constraints (R1 size band, R2 must/cannot-pair, R7 exactly-once) or returns status='infeasible'
with conflicts. Deterministic given (inputs, seed) — R8.

Strategy: union-find must-pairs into units, pick a feasible team count, snake-balance units by
competency into target-sized teams while honoring cannot-pair, then rebalance to meet min size.
"""
from __future__ import annotations

import math
import random

from ..domain.models import Constraints, Formation, Project, Student, Team
from . import balance as balance_mod


class _UnionFind:
    def __init__(self, ids: list[str]) -> None:
        self.parent = {i: i for i in ids}

    def find(self, x: str) -> str:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: str, b: str) -> None:
        self.parent[self.find(a)] = self.find(b)


class MockMatchingEngine:
    def form_teams(
        self,
        students: list[Student],
        project: Project,
        constraints: Constraints,
        seed: int = 0,
    ) -> Formation:
        by_id = {s.id: s for s in students}
        n = len(students)
        if n == 0:
            return Formation(status="ok", seed=seed, teams=[], balance=1.0)

        cannot = {frozenset(p) for p in constraints.cannot_pair}

        # 1. Build units (must-pair grouped, transitive).
        uf = _UnionFind([s.id for s in students])
        for a, b in constraints.must_pair:
            if a in by_id and b in by_id:
                uf.union(a, b)
        units_map: dict[str, list[str]] = {}
        for s in students:
            units_map.setdefault(uf.find(s.id), []).append(s.id)
        units = list(units_map.values())

        # 2. Feasibility of units.
        for unit in units:
            if len(unit) > project.max_size:
                return Formation(
                    status="infeasible", seed=seed,
                    conflicts=[f"must-pair unit {sorted(unit)} larger than max_size {project.max_size}"],
                )
            for i in range(len(unit)):
                for j in range(i + 1, len(unit)):
                    if frozenset((unit[i], unit[j])) in cannot:
                        return Formation(
                            status="infeasible", seed=seed,
                            conflicts=[f"must-pair and cannot-pair conflict within {sorted(unit)}"],
                        )

        # 3. Team count feasibility.
        k_min = math.ceil(n / project.max_size)
        k_max = n // project.min_size
        if k_min > k_max:
            return Formation(
                status="infeasible", seed=seed,
                conflicts=[f"cohort size {n} cannot be partitioned into teams of "
                           f"[{project.min_size}, {project.max_size}]"],
            )
        k = k_min
        base, rem = divmod(n, k)
        target = [base + 1] * rem + [base] * (k - rem)  # each within [min, max]

        # 4. Order units: highest competency first; seeded tie-break; stable by competency.
        def unit_comp(u: list[str]) -> float:
            return sum(by_id[i].competency() for i in u)

        rng = random.Random(seed)
        shuffled = units[:]
        rng.shuffle(shuffled)  # seed-dependent order among equals
        order = sorted(shuffled, key=lambda u: -unit_comp(u))

        # 5. Greedy balanced placement.
        teams: list[list[str]] = [[] for _ in range(k)]
        comp: list[float] = [0.0] * k
        unassignable: list[tuple[str, str]] = []

        def mean(t: int) -> float:
            return comp[t] / len(teams[t]) if teams[t] else 0.0

        def conflicts_with(t: int, unit: list[str]) -> bool:
            return any(frozenset((m, u)) in cannot for m in teams[t] for u in unit)

        for unit in order:
            usize = len(unit)
            eligible = [
                t for t in range(k)
                if len(teams[t]) + usize <= project.max_size and not conflicts_with(t, unit)
            ]
            if not eligible:
                for sid in unit:
                    unassignable.append((sid, "no team can accept this student without violating a hard constraint"))
                continue
            # prefer below-target teams, then lowest mean competency (balance), then index
            eligible.sort(key=lambda t: (len(teams[t]) >= target[t], mean(t), t))
            chosen = eligible[0]
            teams[chosen].extend(unit)
            comp[chosen] += unit_comp(unit)

        # 6. Rebalance to satisfy min size (move only movable single-student units).
        unit_size_of = {sid: len(u) for u in units for sid in u}

        def movable_single(team_idx: int) -> str | None:
            for sid in teams[team_idx]:
                if unit_size_of[sid] == 1:
                    return sid
            return None

        for t in range(k):
            guard = 0
            while len(teams[t]) < project.min_size and guard < n:
                guard += 1
                moved = False
                for d in range(k):
                    if d == t or len(teams[d]) <= project.min_size:
                        continue
                    sid = None
                    for cand in teams[d]:
                        if unit_size_of[cand] == 1 and not conflicts_with(t, [cand]):
                            sid = cand
                            break
                    if sid is not None:
                        teams[d].remove(sid)
                        comp[d] -= by_id[sid].competency()
                        teams[t].append(sid)
                        comp[t] += by_id[sid].competency()
                        moved = True
                        break
                if not moved:
                    break
            if len(teams[t]) < project.min_size:
                return Formation(
                    status="infeasible", seed=seed,
                    conflicts=[f"cannot satisfy min size {project.min_size} for a team given the constraints"],
                )

        # 7. Build result + rationale + balance.
        result_teams: list[Team] = []
        for idx, members in enumerate(teams):
            members_sorted = sorted(members)  # deterministic member order
            mean_comp = mean(idx)
            common_slots_list = sorted(list(set.intersection(*(set(by_id[m].availability) for m in members_sorted)) if members_sorted else set()))
            common_slots = len(common_slots_list)
            roles_covered = sorted(list({by_id[m].desired_role for m in members_sorted if by_id[m].desired_role}))
            role_diversity = len(roles_covered)
            pref_count = sum(1 for m in members_sorted for p in by_id[m].preferred_teammates if p in members_sorted) // 2

            slots_str = ", ".join(common_slots_list[:3]) + ("..." if len(common_slots_list) > 3 else "")
            slots_part = f"{common_slots} common availability slots ({slots_str})" if common_slots > 0 else "0 common availability slots (schedule trade-off)"
            roles_str = ", ".join(roles_covered) if roles_covered else "none"

            tm = Team(
                id=f"team-{idx + 1}",
                member_ids=members_sorted,
                scores={
                    "mean_competency": round(mean_comp, 4),
                    "common_slots": common_slots,
                    "role_diversity": role_diversity,
                    "preference_score": pref_count,
                },
                rationale=(
                    f"Balanced by competency (mean {round(mean_comp, 2)}); "
                    f"{slots_part}; roles covered: {roles_str}; "
                    f"{pref_count} soft peer preferences satisfied; "
                    f"{len(members_sorted)} members within [{project.min_size},{project.max_size}]."
                ),
            )
            result_teams.append(tm)

        formation = Formation(
            status="ok", seed=seed, teams=result_teams, unassignable=unassignable,
            balance=balance_mod.balance_score(result_teams, by_id),
        )
        return formation
