# Implementation Plan: AI team suggestion (walking skeleton)

- **Feature dir:** specs/001-team-suggestion/  ·  **Spec:** ./spec.md
- **Status:** gated
- **Pack:** tfa

Derived from `spec.md`. Scope of THIS plan: a **walking skeleton** — a runnable, tested core
(domain + a deterministic mock matching engine that respects all hard constraints) plus a
scaffolded API/UI. The real OR-Tools optimizer is deferred behind the engine interface.

## Constitution Check (gate)

| Principle / rule | Upheld? | Note |
|------------------|---------|------|
| Human-in-the-loop (override is final) | yes | Engine only suggests; commit/override is a lecturer action (API deferred, contract honored) |
| Explainability (rationale per team) | yes | Mock engine emits a per-team rationale |
| Fairness by construction (balance is first-class) | yes | Balance score (A-01) is a primary output |
| Privacy first | yes | Domain/engine take no protected attributes (A-05); competency derives only from skills/experience |
| Reuse before build | yes | Mock is stdlib-only; real solver will reuse OR-Tools, not hand-rolled |
| Hard constraints never violated | yes | Engine guarantees size band, must/cannot-pair, exactly-once, or reports infeasible |
| No protected attributes as signals | yes | Not present in the model |

Ponytail: mock engine is minimal stdlib; no new dependency for the skeleton core. The real
engine will **reuse OR-Tools (free, OSS, runs locally)** — not a hand-rolled solver. Free-first
strategy + privacy caveat: see `docs/architecture.md` (Technology strategy). Student PII never
goes to a third-party hosted service.

## Technical context

- Backend Python 3.11; domain + matching are **pure stdlib** (dataclasses, unittest) so the
  risky core runs and is verified without external deps.
- FastAPI API layer and React web are scaffolded as code; running them needs `uv sync` /
  `npm ci` (not run in this environment) — clearly marked.

## Approach

`domain` (models + hard-constraint validators) ← `matching` (engine interface + mock engine +
balance) ; `api` wires FastAPI over the application; `web` is a minimal placeholder. FR-001..010
are honored by the domain/engine; API/UI FRs are scaffolded for the next iteration.

## File / area changes

| Path | Change | Reason |
|------|--------|--------|
| app/domain/ | models + rules | entities + hard-constraint checks (R1,R2,R7) |
| app/matching/ | engine interface + mock_engine + balance | deterministic suggestions + rationale (FR-002..008) |
| app/api/ | FastAPI app + routes + auth dep (scaffold) | FR-001/007/009 surface |
| tests/ | unittest property + example + determinism | SC-001/SC-002 on the core |
| web/ | React placeholder | FR UI surface (next iteration) |
| pyproject.toml | deps declaration | uv install |

## Risks & rollback

- **Risk:** mock cannot guarantee size for pathological pair cliques → **Mitigation:** report
  infeasibility (never emit an invalid team). **Rollback:** feature is on a branch; discard.

## Test plan

`python -m unittest discover -s tests` (stdlib) verifies SC-001 (hard constraints on generated
feasible cohorts), SC-002 (determinism), and infeasibility reporting. API/UI tests deferred to
the next iteration (need deps).
