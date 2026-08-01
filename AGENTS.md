# AGENTS.md — Team Formation Assistant

This repo adopts **Forge Harness**. Pack manifest: `.forge/pack.yaml`.

    active_pack: tfa

## Project one-liner
TFA is a standalone web platform for FPT University that helps students form balanced project
teams through AI-assisted matching, with lecturers maintaining full control over final team
assignments. Three roles (Student, Lecturer, Admin), three grouping modes (Lecturer-led,
Student-led, Hybrid), and explainable matching.

## Task contract
Understand → (Specify) → Plan → Implement → Verify → Review → Human gate.
For non-trivial features use Spec-Driven Development (`scripts/new-feature`).

Policies: ponytail, code-quality, security, git-and-worktree, human-gate.
Agents never self-merge.

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
