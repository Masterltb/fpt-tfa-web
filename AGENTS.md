# AGENTS.md — Team Formation Assistant

This repo adopts **Forge Harness**. Pack manifest: `.forge/pack.yaml`.

    active_pack: tfa

## Project one-liner
TFA is a standalone web platform for FPT University that helps students form balanced project
teams through AI-assisted matching, with lecturers maintaining full control over final team
assignments. Three roles (Student, Lecturer, Admin), three grouping modes (Lecturer-led,
Student-led, Hybrid), and explainable matching.

## Harness Engineering Process (`harness-engineering`)

This repository follows the **Forge Harness Engineering Process**, an operational framework designed to ensure rigor, reproducibility, and human-in-the-loop control across all agentic and engineering workflows.

### 1. Durable Layer (Operational Framework)
- **Pack-Driven Configuration**: The active pack (`.forge/pack.yaml`) defines single-source-of-truth commands, toolchain conventions, and domain boundaries.
- **Spec-Driven Development (SDD)**: For any non-trivial feature or architectural change, agents and engineers must scaffold a specification first using `./scripts/new-feature <feature-name>` under `specs/<NNN>-<feature-name>/spec.md`.
- **Architecture Decision Records (ADRs)**: Fundamental technical and architectural decisions are recorded immutably in `docs/adr/`.
- **API Contract Synchronization**: Backend implementations (`app/api/`) must conform strictly to `docs/api-contract.md` (RFC 7807 errors, standard success envelopes, and RBAC rules).

### 2. Task Execution Loop & Task Contract
Every task must adhere strictly to the following execution lifecycle:
`Understand → (Specify via SDD) → Plan → Implement → Verify → Review → Human Gate`

- **Understand**: Check existing documentation (`docs/`), specifications (`specs/`), and current code state before proposing changes.
- **Specify & Plan**: Detail proposed modifications, schema changes, and verification strategies.
- **Implement**: Execute code changes with clean modular boundaries (`web → api → application → domain ← infrastructure | matching-engine`).
- **Verify (Continuous Verification)**: Run automated checks before completing work:
  - Backend unit & API contract tests: `pytest -q`
  - Code formatting & linting: `ruff check .` / `ruff format`
  - Frontend typecheck & tests: `npm run typecheck` and `npm test`
- **Review & Human Gate**: Present findings, explanations, and trade-offs to the user. **Agents never self-merge or deploy without explicit human approval.**

### 3. Decision-Making & Guardrail Policies
- **Constitution Gate (`docs/constitution.md`)**: Hard constraints (team size, must-pair, cannot-pair) are never violated by AI suggestions.
- **RBAC & Privacy (`docs/rbac.md`)**: Student PII stays on local/self-hosted infrastructure; authorization is enforced per-role and per-ownership.
- **Explainability & Human-In-The-Loop**: AI recommends; Lecturers decide. The optimizer must emit an explainable rationale for every team suggestion.
- **Ponytail & Free-First Principle**: Prefer open-source, proven optimizers (`OR-Tools`, `scipy`) and free OSS services over rebuilding from scratch.

## Architecture
- **Backend**: Python 3.11+ / FastAPI + SQLAlchemy 2.0 + PostgreSQL + Alembic + OR-Tools
- **Frontend**: React 18 + TypeScript + Vite 5 + React Router v6 + TanStack Query + Shadcn/ui + Tailwind CSS v4
- **Auth**: Firebase Auth (3 roles: student, lecturer, admin)
- **Domain flow**: Campus → Term → Course → ClassSection → GroupingSession → Teams
- **Dependency direction**: `web → api → application → domain ← infrastructure | matching-engine`

## Three roles
- **Admin**: Manages campuses, terms, courses, classes, users; imports rosters via CSV/Excel.
- **Lecturer**: Owns grouping sessions; configures requirements; runs matching; reviews, adjusts, approves and publishes teams.
- **Student**: Completes Team DNA profile; creates/joins teams; receives recommendations; views official assignments.

## Three grouping modes
- **Lecturer-led**: Lecturer configures → AI generates → Lecturer reviews → Publish.
- **Student-led**: Students form teams → Submit for approval → Lecturer reviews → Publish.
- **Hybrid** (flagship): Students form partial teams → Deadline → AI fills gaps → Lecturer reviews → Publish.

## Non-negotiables (see docs/constitution.md)
- Hard constraints (team size, must-pair, cannot-pair) are never violated.
- Student data is private; access is per-role + per-ownership (docs/rbac.md).
- Every suggestion is explainable; a lecturer's override is final (human-in-the-loop).
- AI recommends. Lecturers decide. No auto-publish without lecturer approval.
- No protected/sensitive attributes (gender, ethnicity, religion, health) used as matching signals.
