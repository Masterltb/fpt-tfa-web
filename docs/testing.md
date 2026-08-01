# Testing — Team Formation Assistant

Verifier uses this. Commands run from the repo root; pass conditions are explicit.

## Commands

| Purpose | Command | Pass condition |
|---------|---------|----------------|
| Install | `uv sync && cd web && npm ci` | exit 0 |
| Lint | `ruff check . && cd web && npm run lint` | no errors |
| Typecheck | `mypy . && cd web && npm run typecheck` | no errors |
| Unit/integration | `pytest -q && cd web && npm test -- --run` | all pass |
| E2E | `npx playwright test` | all pass |
| Build | `cd web && npm run build` | build succeeds |
| DB migrate | `alembic upgrade head` | migration succeeds |
| Run | `uvicorn app.api.main:app --reload` | affected flow observably works |

## Rules

- Verify by **driving the affected flow** (run a formation, inspect teams), not tests alone.
- Authorization changes require a test proving the unauthorized / other-owner case is rejected.
- New/changed behavior gets a regression test; report failures with output.
- Admin CRUD operations require tests for role enforcement (non-admin → 403).

## Matching-engine tests (property-based)

The optimizer is the highest-risk component; test it with properties, not just examples:

- **Hard constraints hold** — for random feasible cohorts, every produced team satisfies R1
  (size band), R2 (must/cannot-pair), R7 (exactly-once). Never violated.
- **Determinism (R8)** — same inputs + same seed produce byte-identical formations.
- **Infeasibility is honest** — when hard constraints cannot be met, the engine reports the
  conflict (422 upstream), never a partial/invalid team.
- **Balance improves (R4)** — competency spread beats a random assignment baseline on average.

Use small hand-built fixtures for edge cases (odd cohort size, one cannot-pair clique) and
generated cohorts for the properties.

## Team DNA tests

- Completion percentage calculation is correct for all field combinations.
- Team DNA is scoped per student per class section (no cross-class leakage).
- Student can only read/write their own Team DNA.

## Grouping session tests

- Session lifecycle transitions are valid (DRAFT→OPEN→MATCHING→REVIEW→PUBLISHED).
- Invalid transitions are rejected.
- Matching can only be triggered in OPEN or MATCHING status.
- Publishing changes status to PUBLISHED.

## Frontend tests (Vitest + React Testing Library)

- Component rendering tests for critical flows (Team DNA wizard, review board).
- API hook tests with MSW (Mock Service Worker) for data fetching.
- Accessibility tests with axe-core.
