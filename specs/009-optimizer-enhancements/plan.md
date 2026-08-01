# Implementation Plan — 009: Multi-Objective Optimizer & Advanced Rationale

## 1. Domain & Engine Interfaces (`app/domain/models.py`, `app/matching/engine.py`)
- Update `Project` or `Constraints` models to optionally carry weights (`weights: dict[str, float]`) or pass weights parameter through `MatchingEngine.form_teams`.
- Ensure `Team.scores` supports storing breakdown metrics (`mean_competency`, `common_slots`, `role_diversity`, `preference_score`).

## 2. Multi-Objective CP-SAT Engine (`app/matching/ortools_engine.py`)
- **Availability Variables (`R5`)**:
  - For each time slot $s$ across union of all student availabilities and each team $t$, create boolean variable $avail\_slot[s, t]$.
  - Add constraints: $avail\_slot[s, t] \le x[i, t]$ for each student $i$ who *does not* have slot $s$ (if a student in team $t$ lacks slot $s$, then $avail\_slot[s, t] = 0$).
  - Sum of $avail\_slot[s, t]$ over all $s$ equals the common shared slots of team $t$.
- **Role Diversity (`R6`)**:
  - For each role $r$ and team $t$, create boolean variable $role\_present[r, t]$.
  - Add constraints linking $role\_present[r, t]$ to whether any student with `desired_role == r` is assigned to $t$.
- **Soft Preferences (`R6`)**:
  - For each soft pair $(a, b)$ in `preferred_teammates` and team $t$, reward when $x[a, t] == x[b, t]$.
- **Objective Function**:
  - Combine: $\text{Minimize } \left( w_{comp} \times (\text{hi} - \text{lo}) - w_{avail} \times \text{total\_avail} - w_{role} \times \text{total\_roles} - w_{pref} \times \text{total\_prefs} \right)$.
- **Rationale & Breakdown Construction**:
  - After solving, inspect assigned members of each team to compute exact common availability slots, role list, and preference count.
  - Format a human-readable `rationale` string.

## 3. Mock Engine Alignment (`app/matching/mock_engine.py`)
- Update `MockEngine.form_teams` to compute and populate `scores` breakdown and dynamic rationale matching the multi-objective format so unit/property tests and mock workflows stay consistent.

## 4. API Layer (`app/api/routes_formation.py`)
- Add optional `weights` field to `RunFormationIn` (`weights: dict[str, float] | None = None`).
- Pass weights down when invoking `engine.form_teams`.

## 5. Verification & Tests (`tests/`)
- Add `tests/test_multi_objective_engine.py` verifying:
  - CP-SAT solver prefers formations with higher availability overlap when `w_avail` is prioritized.
  - CP-SAT solver avoids role clumping when `w_role` is prioritized.
  - `scores` dictionary and `rationale` string are properly generated and detailed.
  - Determinism (`R8`) and hard constraint compliance (`R1`, `R2`, `R7`) remain 100% solid.
