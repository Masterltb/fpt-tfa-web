# AGENTS.md — Team Formation Assistant (TFA)

This repository adopts **Forge Harness Engineering**.
Pack manifest: `.forge/pack.yaml`

    active_pack: tfa

---

## Project Overview

**TFA (Team Formation Assistant)** is an AI-assisted web platform for FPT University designed to form balanced student project teams. It models FPT's academic hierarchy (`Campus → Term → Course → ClassSection → GroupingSession → Teams`), combines student competency, role preferences, and schedule availability via OR-Tools, and provides human-in-the-loop controls where lecturers maintain final approval.

---

## Harness Task Contract & Execution Workflow

Agents working on this repository MUST strictly follow the Harness Execution Contract:

```
Understand → (Specify) → Plan → Implement → Verify → Review → Human Gate
```

1. **Understand**: Inspect repository context, documentation in `docs/`, and active implementation before making assumptions.
2. **Specify**: For non-trivial features, execute Spec-Driven Development using `scripts/new-feature`.
3. **Plan**: Draft explicit implementation plans (`implementation_plan.md`) with verification strategy before mutating code.
4. **Implement**: Write production-grade code adhering to layering (`web → api → application → domain ← infrastructure | matching-engine`).
5. **Verify**: Always run automated tests and build commands before declaring completion (`pytest`, `npm test`, `npm run build`).
6. **Review**: Generate clear walkthrough summaries (`walkthrough.md`) highlighting changes and test results.
7. **Human Gate**: Stop for explicit user/lecturer approval at critical checkpoints. **Agents never self-merge.**

---

## Tech Stack & Command Registry

### Toolchain Architecture
- **Backend**: Python 3.11+ / FastAPI + SQLAlchemy 2.0 + Alembic + OR-Tools + PostgreSQL
- **Frontend**: React 18 + TypeScript + Vite 5 + React Router v6 + TanStack Query + Shadcn/ui + Tailwind CSS v4
- **Auth**: Firebase Auth (3 RBAC roles: `student`, `lecturer`, `admin`)
- **Package Managers**: `uv` (Python) & `npm` (Web)

### Command Registry
- **Install**: `uv sync && cd web && npm ci`
- **Lint**: `ruff check . && cd web && npm run lint`
- **Typecheck**: `mypy . && cd web && npm run typecheck`
- **Test Unit**: `pytest -q && cd web && npm test -- --run`
- **Test E2E**: `npx playwright test`
- **Build**: `cd web && npm run build`
- **Run Backend**: `uvicorn app.api.main:app --reload`
- **Run Frontend**: `cd web && npm run dev`
- **Database**: `alembic upgrade head` | Seed: `python scripts/seed.py`

---

## Domain Architecture & Core Concepts

### 1. Hierarchy Flow
```
Campus → Term → Course → ClassSection → GroupingSession → Teams
```

### 2. Three Roles (RBAC)
- **Admin**: Manages campuses, terms, courses, class sections, user rosters; imports rosters via CSV/Excel.
- **Lecturer**: Owns grouping sessions, configures requirements/constraints, runs AI matching, reviews with Drag & Drop board, approves and publishes official teams.
- **Student**: Completes Team DNA profile, creates/joins draft teams, receives explainable recommendations, views official assignments.

### 3. Three Grouping Modes
- **Lecturer-Led**: Lecturer configures requirements → AI generates all teams → Lecturer reviews & approves.
- **Student-Led**: Students self-form teams → Submit for review → Lecturer approves.
- **Hybrid (Flagship)**: Students self-form partial teams until deadline → AI fills remaining gaps & unassigned students → Lecturer reviews & approves.

---

## Non-Negotiables & Policies (Constitution)

- **Hard Constraints are Inviolable**: Team size bounds (`[min_size, max_size]`), `must-pair`, and `cannot-pair` rules are hard constraints and are NEVER violated by matching suggestions.
- **Human-in-the-Loop**: AI recommends; Lecturers decide. No team assignment is published without explicit lecturer approval.
- **Explainable Matching**: Every team recommendation MUST include a human-readable explanation (*Rationale*).
- **Privacy & PII Protection**: Student Team DNA data is private (visible only to the student and owning lecturer). Student PII remains on local/self-hosted infrastructure.
- **Ethical Matching Signals**: No protected or sensitive attributes (gender, ethnicity, religion, health, finance) are ever used as matching signals.
- **Ponytail Policy**: Reuse pre-existing solvers (OR-Tools, scipy) and libraries before hand-rolling custom optimizers.
