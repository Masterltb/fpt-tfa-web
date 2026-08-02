---
version: 1
slug: "src-routes-reviewboard-tsx"
primary_target: "src/routes/ReviewBoard.tsx"
related_targets: []
---

Scope: the lecturer review board for one formation run, plus the infeasible path. Visitor mode: Operate.

Audience & job: an FPT lecturer, usually the night before class, deciding whether to accept the solver's grouping for ~30 students / 6-8 teams. They are accountable to students who will complain about their team, so every team must be defensible.

Task & proof: read the proposal, understand why each team exists, override where needed, commit. Real evidence only, from POST/GET /v1 formations: `teams[{id, members, scores, rationale}]`, `balance`, `seed`, `unassignable`, and `conflicts` on 422. Nothing else may be shown as a metric.

Direction: the rail concourse split-flap board. The whole class is held in one gaze; teams are rows, not cards. Status is a lamp column — amber = awaiting the lecturer, white = settled, red = conflict. Memorable moment: an override makes the affected rows re-flap, so the lecturer sees the cost of their edit as it lands. Anchor against the world's implied transience with durable marks: visible seed, audit trail, and a committed state that stops flapping.

Constraints: Vietnamese-first, diacritics never clipped — caps only for short labels, names in sentence case at generous line-height. Drag-and-drop must have a keyboard equivalent. Roster is synthetic demonstration data (scripts/seed_dev_cohort.py) and must stay labeled as such.

Unresolved: rationale and conflict strings still arrive in English from the engine; Vietnamese wording is a backend change, not a frontend translation. `explainability.py` is dead code and is not the rationale source.
