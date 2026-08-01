# Tasks: AI team suggestion (walking skeleton)

- **Feature dir:** specs/001-team-suggestion/  ·  **Plan:** ./plan.md  ·  **Spec:** ./spec.md
- **Pack:** tfa

`[P]` = parallelizable (disjoint files). Each task names its path and the FR/SC it serves.

## Phase 1 — Setup

- [x] T001 pyproject.toml with deps (fastapi, pydantic, pytest, mypy, ruff) — pyproject.toml

## Phase 2 — Foundational (core, stdlib, verified)

- [x] T010 Domain models — app/domain/models.py (FR-001 data, A-04)
- [x] T011 Hard-constraint validators — app/domain/rules.py (FR-002/003/004, R1/R2/R7)
- [x] T012 Balance scoring — app/matching/balance.py (FR-008, A-01)
- [x] T013 Engine interface + result types — app/matching/engine.py (FR-005/007)
- [x] T014 Deterministic mock engine — app/matching/mock_engine.py (FR-002..008, R8)

## Phase 3 — Verify core

- [x] T020 [P] Property test: hard constraints hold on generated feasible cohorts — tests/test_hard_constraints.py (SC-001)
- [x] T021 [P] Determinism test (seed) — tests/test_determinism.py (SC-002)
- [x] T022 [P] Infeasibility is reported, not crashed — tests/test_infeasible.py (FR-007)

## Phase 4 — API / UI scaffold (not run here; needs deps)

- [x] T030 FastAPI app + role auth dependency (stub) — app/api/main.py, app/api/deps.py (FR-001/009)
- [x] T031 Formation routes — app/api/routes_formation.py (FR-007)
- [x] T032 React placeholder — web/ (FR UI surface, next iteration)

## Phase 5 — Polish

- [x] T091 API authz + happy-path + infeasible tests (FastAPI TestClient) — tests/test_api_authz.py (SC-004)
- [x] T092 Cohort ownership check + repository (BR-13) — app/repositories.py, route 404/403 (IDOR guard)
- [x] T090 Real OR-Tools CP-SAT engine behind the same interface — app/matching/ortools_engine.py
- [ ] T093 Postgres CohortRepository + web e2e (next iteration)

## Coverage

FR-001..008 + SC-001/SC-002 covered by Phase 2–3. FR-009/010 surfaced by Phase 4 scaffold,
full enforcement + tests in the next iteration.
