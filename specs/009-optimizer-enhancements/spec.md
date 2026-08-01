# 009: Multi-Objective Optimizer & Advanced Explainable Rationale

- **Version:** 1.0.0 · **Date:** 2026-07-18 · **Status:** draft
- **Traceability:** `docs/PRD.md` (BC-04, BC-05, FR-06, FR-11, FR-13, R4, R5, R6), `docs/domain.md`, `docs/constitution.md`

---

## 1. Executive Summary & Objectives

Currently, our CP-SAT optimizer (`OrToolsMatchingEngine`) guarantees all hard constraints (`R1` size band, `R2` must/cannot pair, `R7` exactly once assignment) and minimizes the spread of per-team competency (`R4`). However, it does not yet optimize for soft constraints like schedule availability overlap (`R5`) or soft peer preferences and role diversity (`R6`), nor does it generate detailed explanations for trade-offs (`FR-13`).

**Objective**: Upgrade `OrToolsMatchingEngine` to a multi-objective CP-SAT solver that balances competency, maximizes availability overlap, maximizes role diversity / soft preferences, and outputs human-auditable per-team rationale with multi-dimensional score breakdowns.

---

## 2. Business & Functional Requirements

### A. Multi-Objective Optimization (`FR-06`, `FR-11`, `R4`, `R5`, `R6`)
1. **Competency Spread (`R4`)**: Minimize the gap (`max - min`) between total competency across teams.
2. **Common Availability Overlap (`R5`)**: Maximize the number of shared weekly time slots (`availability`) among members of the same team.
3. **Role Diversity & Soft Preferences (`R6`)**:
   - Maximize distinct `desired_role` coverage across team members to prevent clumping (e.g., all leaders on one team).
   - Maximize satisfaction of `preferred_teammates` (soft peer wishes).
4. **Weighted Objective Function (`FR-06`)**: Combine these objectives into a linear scalar objective using normalized weights (`w_comp`, `w_avail`, `w_role`, `w_pref`) with sensible defaults when not explicitly overridden by the lecturer.

### B. Advanced Explainable Rationale (`FR-13`, `BC-05`)
1. Each generated `Team` must return:
   - A descriptive human-auditable `rationale` string explicitly listing:
     - Mean competency & average experience years.
     - Number and names of common shared availability slots (or trade-off warning if minimal).
     - Covered distinct roles in the team.
     - Number of soft peer preferences fulfilled.
   - A detailed `scores` dictionary containing:
     `{"mean_competency": float, "common_slots": int, "role_diversity": int, "preference_score": int}`.

---

## 3. Non-Functional Requirements & Invariants

1. **Determinism (`R8`)**: Single worker + fixed `random_seed` and stable canonical sorting of output teams must be preserved.
2. **Hard Constraint Supremacy**: Under no circumstances may multi-objective scoring violate `R1`, `R2`, or `R7`.
3. **Execution Speed (`NFR-01`)**: CP-SAT solving for standard cohorts ($\le 60$ students) must complete within `max_time_s` ($\le 5.0$ seconds).
