# Feature Spec: AI team suggestion

- **Feature dir:** specs/001-team-suggestion/
- **Status:** ready-for-plan
- **Author / date:** adoption / 2026-07-15
- **Pack:** tfa

The spec is the source of truth for *what* and *why* — never *how*. Every requirement is testable.

## Overview

A lecturer runs a formation for a cohort/project and receives suggested teams that are
balanced (competency, experience, roles, schedule), satisfy all hard constraints, and come
with a readable rationale. The lecturer reviews, optionally overrides, and commits. Goal:
shorten team formation, reduce conflict, raise team quality.

## User scenarios

- **As a lecturer** I want to run a formation for my project so that I get balanced teams in
  minutes instead of arranging them by hand.
  - Primary flow: open the project, set weights (or accept defaults), run, review suggested
    teams with rationale, adjust if needed, commit.
  - Edge: cohort size not divisible by team size; a cannot-pair clique; students with no
    common availability; more required roles than members.
- **As a student** I want to see the team I was placed in and a short reason, without seeing
  other students' private profiles.

## Functional requirements

- **FR-001** A lecturer who owns the cohort can trigger a formation run for one project.
- **FR-002** The run produces teams whose size is within the project's `[min, max]` band. (R1)
- **FR-003** No suggested team violates a must-pair or cannot-pair constraint. (R2)
- **FR-004** Every eligible student is assigned exactly once, or listed as unassignable with a
  reason. (R7)
- **FR-005** Each team includes a rationale explaining the assignment (balance + any traded-off
  soft preferences).
- **FR-006** The run is reproducible: same inputs + same seed yield the same teams. (R8)
- **FR-007** When hard constraints are infeasible, the run reports the conflicting constraints
  instead of returning a partial formation. (R3)
- **FR-008** Competency and experience are distributed across teams; a suggested formation
  scores better on balance than a random assignment baseline. (R4)
  Default balance metric (assumption A-01): **variance of per-team mean competency** — lower
  variance is better; reported as `balance = 1 / (1 + variance)`.
- **FR-009** A lecturer can override any assignment; the override is the committed result and
  overrides the AI. (constitution: human-in-the-loop)
- **FR-010** Student-scoped responses never expose another student's profile. (privacy)

## Success criteria

- **SC-001** For a feasible cohort, 100% of produced teams satisfy FR-002/FR-003/FR-004
  (checked by property tests over generated cohorts).
- **SC-002** Reproducibility: two runs with the same seed produce byte-identical formations.
- **SC-003** A lecturer can go from "run" to "committed teams" in under 2 minutes for a cohort
  of 60 students (p95), excluding review time.
- **SC-004** An unauthorized user (not the cohort owner) receives 403 on every formation endpoint.
- **SC-005** Balance score of the suggestion beats the random baseline on average across the
  generated test cohorts (threshold set once FR-008 is resolved).

## Assumptions

Defaults chosen (option B) to unblock the walking skeleton. Each is **(needs confirmation)**;
a human may veto it. See BRD Open Questions.

- **A-01 Balance metric:** variance of per-team mean competency, reported as `1/(1+variance)`. (OQ-03)
- **A-02 Team size band:** default `min = 3, max = 5`. (OQ-04)
- **A-03 Min common availability:** at least `1` shared weekly slot counts as enough (soft).
- **A-04 Data model:** proficiency `1..5`; competency = mean proficiency + capped experience
  bonus; availability as weekly slots; desired role is a **free-form string configured per
  course/project** (NOT software-specific), with a generic default suggestion list
  {leader, coordinator, researcher, presenter, member, other}.
- **A-05 Forbidden signals:** gender, ethnicity, religion, health, age are never matching
  signals. (OQ-05)
- Default weights let a lecturer run without tuning; v1 forms teams within one cohort/project.

## Out of scope

- Live re-balancing after teams start; peer-review scoring; cross-cohort formation.

## Open clarifications

None blocking. The two prior items are resolved by defaults A-01 and A-03 above (each marked
needs confirmation); a human may veto them without re-opening the plan.
