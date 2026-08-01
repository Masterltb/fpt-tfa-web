# Team Formation Assistant

> Build balanced teams. Create better projects.

TFA is a standalone web platform for FPT University that helps students form balanced project
teams through AI-assisted matching, with lecturers maintaining full control over final team
assignments.

Adopts **Forge Harness** (`../forge-harness`). Rules: `AGENTS.md`; product docs: `docs/`.

## Key Features

- **Team DNA** — branded student profiles with skills, roles, experience, availability, interests
- **Three grouping modes** — Lecturer-led, Student-led, Hybrid (no student left behind)
- **Explainable matching** — AI generates balanced teams with clear rationale per team
- **Human-in-the-loop** — lecturers review, drag-drop adjust, and publish final teams
- **FPT academic structure** — Campus → Term → Course → ClassSection → GroupingSession → Teams

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+ / FastAPI / SQLAlchemy 2.0 |
| Database | PostgreSQL (Alembic migrations) |
| Optimizer | OR-Tools CP-SAT (local, OSS) |
| Frontend | React 18 / TypeScript / Vite 5 |
| UI | Shadcn/ui + Tailwind CSS v4 |
| Routing | React Router v6 |
| Data Fetching | TanStack Query |
| Auth | Firebase Auth (3 roles: student, lecturer, admin) |
| Dev | Docker Compose (PostgreSQL + pgAdmin) |

## Layout

```
app/domain/      Pure entities + hard-constraint validators (R1/R2/R7)
app/matching/    Engine interface + OR-Tools CP-SAT engine + balance scoring
app/api/         FastAPI routes (admin, student, lecturer)
app/infra/       Database models, repositories
app/services/    Application services (use cases)
tests/           pytest: property + determinism + infeasibility + API authz
web/             React + TypeScript frontend
docs/            BRD, PRD, architecture, domain, rbac, api-contract, testing,
                 constitution, code-style, team-dna, grouping-modes, adr
specs/           Spec-Driven Development feature dirs
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (for PostgreSQL)

### Setup

```bash
# 1. Start database
docker-compose up -d

# 2. Install backend dependencies
uv sync  # or: pip install -e ".[dev]"

# 3. Run migrations
alembic upgrade head

# 4. Install frontend dependencies
cd web && npm ci

# 5. Seed sample data (optional)
python scripts/seed.py
```

### Run

```bash
# Backend API (port 8000)
uvicorn app.api.main:app --reload --port 8000

# Frontend dev server (port 5173)
cd web && npm run dev
```

### Test

```bash
# Backend tests
pytest -q

# Frontend tests
cd web && npm test -- --run

# Full check
ruff check . && mypy . && pytest -q && cd web && npm run typecheck && npm test -- --run
```

## Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage campuses, terms, courses, classes, users; import CSV rosters |
| **Lecturer** | Create grouping sessions; configure team requirements; run matching; review and publish teams |
| **Student** | Complete Team DNA; create/join teams; view AI recommendations; view official assignments |

## Status

Phase 0 complete: harness restructured, domain model expanded, documentation updated.
Frontend tooling upgrade and Phase 1 (Admin module) in progress.
