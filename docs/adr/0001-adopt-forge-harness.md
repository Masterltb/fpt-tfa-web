# ADR 0001: Adopt Forge Harness + Python/FastAPI + React

- **Status:** accepted
- **Date:** 2026-07-15
- **Deciders:** maintainer
- **Pack / scope:** tfa

## Context

Team Formation Assistant needs a disciplined agent workflow with guardrails around
fairness, student-data privacy, explainability, and hard-constraint correctness. It also
needs a stack that fits a constraint-optimization core.

## Options considered

1. **Ad-hoc rules + free choice of stack** — fast to start, drifts and duplicates over time.
2. **Adopt Forge Harness with a `tfa` pack; Python/FastAPI + React; OR-Tools optimizer** —
   shared task contract, SDD, constitution gate; Python fits the optimization core.
3. **TypeScript full-stack** — one language, but weaker optimization ecosystem than Python.

## Decision

Adopt Forge Harness (option 2). Backend Python/FastAPI, frontend React/TypeScript, matching
via OR-Tools CP-SAT. The `tfa` pack lives in **this repo** (`.forge/pack.yaml`), not inside
the harness distribution.

## Consequences

- **Positive:** enforced task contract + SDD + constitution gate; optimization core in a
  strong ecosystem; pack decoupled from the harness.
- **Cost:** must keep the pack docs current; two toolchains (Python + Node) to wire.
- **Follow-ups:** resolve the open `[NEEDS CLARIFICATION]` on the balance metric before
  planning `001-team-suggestion`; scaffold `app/` and `web/` so pack commands run.

## Verification

`validate-harness --strict` passes (it does). An L1 project audit runs clean once this ADR
is recorded.
