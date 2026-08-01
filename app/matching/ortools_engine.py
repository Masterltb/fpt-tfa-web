"""Real matching engine using OR-Tools CP-SAT (free, OSS, runs locally — no PII leaves).

Same MatchingEngine interface as the mock, so it drops in without route/test changes.
Hard constraints are model constraints (guaranteed by the solver or reported infeasible):
  - exactly-once assignment (R7)
  - team size band (R1)
  - must-pair / cannot-pair (R2)

Multi-Objective Function (009):
  - Competency spread (hi - lo) minimized (R4 / A-01 proxy)
  - Common availability slots maximized across team members (R5)
  - Role diversity across team members maximized (R6)
  - Soft peer preferences (preferred_teammates) maximized (R6)
  - Weighted combination configurable via project.weights (w_comp, w_avail, w_role, w_pref)

Determinism (R8): single worker + fixed random_seed, and output teams are canonicalized
so the result is identical for the same inputs + seed.
"""
from __future__ import annotations

import math

from ortools.sat.python import cp_model

from ..domain.models import Constraints, Formation, Project, Student, Team
from . import balance as balance_mod


class OrToolsMatchingEngine:
    def __init__(self, max_time_s: float = 5.0) -> None:
        self.max_time_s = max_time_s

    def form_teams(
        self,
        students: list[Student],
        project: Project,
        constraints: Constraints,
        seed: int = 0,
    ) -> Formation:
        by_id = {s.id: s for s in students}
        ids = [s.id for s in students]
        n = len(ids)
        if n == 0:
            return Formation(status="ok", seed=seed, balance=1.0)

        idx = {sid: i for i, sid in enumerate(ids)}

        k_min = math.ceil(n / project.max_size)
        k_max = n // project.min_size
        if k_min > k_max:
            return Formation(
                status="infeasible", seed=seed,
                conflicts=[f"cohort size {n} cannot be partitioned into teams of "
                           f"[{project.min_size}, {project.max_size}]"],
            )
        k = k_min
        comp = [round(by_id[sid].competency() * 100) for sid in ids]  # integer-scaled
        total = sum(comp)

        model = cp_model.CpModel()
        x = {(i, t): model.new_bool_var(f"x_{i}_{t}") for i in range(n) for t in range(k)}

        for i in range(n):  # R7 exactly-once
            model.add(sum(x[i, t] for t in range(k)) == 1)
        for t in range(k):  # R1 size band
            size = sum(x[i, t] for i in range(n))
            model.add(size >= project.min_size)
            model.add(size <= project.max_size)
        for a, b in constraints.must_pair:  # R2 must-pair
            if a in idx and b in idx:
                for t in range(k):
                    model.add(x[idx[a], t] == x[idx[b], t])
        for a, b in constraints.cannot_pair:  # R2 cannot-pair
            if a in idx and b in idx:
                for t in range(k):
                    model.add(x[idx[a], t] + x[idx[b], t] <= 1)

        # Objective 1: Competency spread (hi - lo) across teams.
        team_comp = []
        for t in range(k):
            tc = model.new_int_var(0, total, f"tc_{t}")
            model.add(tc == sum(comp[i] * x[i, t] for i in range(n)))
            team_comp.append(tc)
        hi = model.new_int_var(0, total, "hi")
        lo = model.new_int_var(0, total, "lo")
        for t in range(k):
            model.add(hi >= team_comp[t])
            model.add(lo <= team_comp[t])

        # Objective 2: Common availability slots across team members (R5).
        all_slots = sorted(list({slot for s in students for slot in s.availability}))
        avail_vars = []
        for t in range(k):
            for slot in all_slots:
                v = model.new_bool_var(f"avail_{slot}_{t}")
                avail_vars.append(v)
                for i in range(n):
                    if slot not in by_id[ids[i]].availability:
                        model.add(v + x[i, t] <= 1)

        # Objective 3: Role diversity across team members (R6).
        all_roles = sorted(list({s.desired_role for s in students if s.desired_role}))
        role_vars = []
        for t in range(k):
            for r in all_roles:
                v = model.new_bool_var(f"role_{r}_{t}")
                role_vars.append(v)
                students_with_role = [i for i in range(n) if by_id[ids[i]].desired_role == r]
                if students_with_role:
                    model.add(v <= sum(x[i, t] for i in students_with_role))
                else:
                    model.add(v == 0)

        # Objective 4: Soft peer preferences (preferred_teammates, R6).
        soft_pairs = set()
        for s in students:
            for p_id in s.preferred_teammates:
                if p_id in idx and p_id != s.id:
                    pair = tuple(sorted([idx[s.id], idx[p_id]]))
                    soft_pairs.add(pair)
        pref_vars = []
        for i, j in sorted(list(soft_pairs)):
            for t in range(k):
                v = model.new_bool_var(f"pref_{i}_{j}_{t}")
                pref_vars.append(v)
                model.add(v <= x[i, t])
                model.add(v <= x[j, t])

        # Multi-objective weights configuration (defaults: comp=10, avail=5, role=3, pref=2).
        w_comp = int(round(float(project.weights.get("w_comp", 10.0)) * 10))
        w_avail = int(round(float(project.weights.get("w_avail", 5.0)) * 10))
        w_role = int(round(float(project.weights.get("w_role", 3.0)) * 10))
        w_pref = int(round(float(project.weights.get("w_pref", 2.0)) * 10))

        model.minimize(
            w_comp * (hi - lo)
            - w_avail * sum(avail_vars)
            - w_role * sum(role_vars)
            - w_pref * sum(pref_vars)
        )

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = self.max_time_s
        solver.parameters.random_seed = int(seed)
        solver.parameters.num_workers = 1  # determinism
        status = solver.solve(model)

        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            return Formation(
                status="infeasible", seed=seed,
                conflicts=["no valid formation satisfies the hard constraints"],
            )

        members_by_team = [[] for _ in range(k)]
        for i in range(n):
            for t in range(k):
                if solver.value(x[i, t]) == 1:
                    members_by_team[t].append(ids[i])
                    break

        # Canonicalize: sort members, then sort teams by members, then relabel (R8-stable).
        canonical = sorted((sorted(m) for m in members_by_team))
        result_teams: list[Team] = []
        for t, members in enumerate(canonical):
            mean_comp = sum(by_id[m].competency() for m in members) / len(members) if members else 0.0
            common_slots_list = sorted(list(set.intersection(*(set(by_id[m].availability) for m in members)) if members else set()))
            common_slots = len(common_slots_list)
            roles_covered = sorted(list({by_id[m].desired_role for m in members if by_id[m].desired_role}))
            role_diversity = len(roles_covered)
            pref_count = sum(1 for m in members for p in by_id[m].preferred_teammates if p in members) // 2

            slots_str = ", ".join(common_slots_list[:3]) + ("..." if len(common_slots_list) > 3 else "")
            slots_part = f"{common_slots} common availability slots ({slots_str})" if common_slots > 0 else "0 common availability slots (schedule trade-off)"
            roles_str = ", ".join(roles_covered) if roles_covered else "none"

            result_teams.append(
                Team(
                    id=f"team-{t + 1}",
                    member_ids=members,
                    scores={
                        "mean_competency": round(mean_comp, 4),
                        "common_slots": common_slots,
                        "role_diversity": role_diversity,
                        "preference_score": pref_count,
                    },
                    rationale=(
                        f"Multi-objective CP-SAT balance: mean competency {round(mean_comp, 2)}; "
                        f"{slots_part}; roles covered: {roles_str}; "
                        f"{pref_count} soft peer preferences satisfied; "
                        f"{len(members)} members within [{project.min_size},{project.max_size}]."
                    ),
                )
            )

        return Formation(
            status="ok", seed=seed, teams=result_teams,
            balance=balance_mod.balance_score(result_teams, by_id),
        )
