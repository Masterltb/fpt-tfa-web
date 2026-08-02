# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- **Backend (built):** Python FastAPI + SQLAlchemy 2.0 + PostgreSQL (Alembic migrations) + OR-Tools matching engine. Firebase Auth for identity.
- **Frontend (committed, not yet built):** React 18 + Vite + TypeScript, React Router v6, TanStack Query, Tailwind v4, shadcn/ui, lucide-react.
- **Frontend status:** The previous `web/` frontend has been deleted and is being **rebuilt from scratch**. Its visual language is retired — treat surviving screenshots or git history as evidence and anti-reference only, never as a world to preserve. The stack above is installed and the app shell boots (routing, role guard, mock auth, backend proxy verified); every screen is still a placeholder awaiting its Phase 1 design.
- **API prefixes:** the backend mounts **both** `/api/v1` (most routers) and bare `/v1` (legacy cohort + formation routers). Client calls pass full paths and dev proxies both — assuming a single prefix silently 404s half the API.

## Users

- **Students (FPT University):** Want to build or find compatible project teams based on skills, preferred roles, experience, weekly availability, commitment, and interests without being left out or forced into friend-only/unbalanced groups.
- **Lecturers (FPT University):** Own the class sections and team formation process. Want to configure course requirements, run automated AI matching, inspect explainable team balance & conflict warnings, perform drag-and-drop manual adjustments, and approve & publish official teams.
- **Administrators (FPT University):** Manage campuses, academic terms, majors, courses, class sections, lecturer assignments, CSV/Excel student roster imports, grouping policies, and audit logs.

## Product Purpose

Team Formation Assistant (TFA) is a web platform for FPT University that automates balanced student team formation through AI-assisted matching while keeping lecturers in complete control (*Human-in-the-loop*). It eliminates manual spreadsheet grouping and friendship bias, ensuring fair competency distribution, schedule overlap, role coverage, and transparent explanations for every team assignment.

## Positioning

TFA is a standalone team formation platform built specifically around FPT University's academic structure (`Campus → Term → Course → ClassSection → GroupingSession`). The MVP operates independently of FAP via CSV/Excel roster import, with architecture designed for future FAP/LMS integration. Unlike generic random groupers or Trello-style task tools, TFA offers **Explainable Matching** where every recommendation is auditable and lecturer approval is mandatory.

## Operating Context

- **Academic Flow:** Campus → Term → Course → ClassSection → GroupingSession → Teams.
- **Three Grouping Modes:**
  - `Lecturer-Led`: Lecturer configures requirements → AI generates all teams → Lecturer reviews & approves.
  - `Student-Led`: Students create draft teams & invite/join → Lecturer reviews & approves.
  - `Hybrid (Flagship)`: Students self-form partial teams until deadline → AI fills remaining gaps & unassigned students → Lecturer reviews & approves.
- **Team DNA Intake:** Students complete class-specific profiles (Skills 1-5, Preferred Roles, Project Experience, Weekly Availability Grid, Commitment Level, Interests, Work Style).

## Capabilities and Constraints

- **Hard Constraints (Never Violated):**
  - Team size band (`[team_min_size, team_max_size]`).
  - Must-pair (students required to be together) & Cannot-pair (students kept apart).
  - Required role coverage per team (e.g. Backend, Frontend, Presenter).
  - Exactly-once assignment per active session.
  - Enrollment & section eligibility.
- **Soft Constraints (Maximized Score):**
  - Skill coverage & competency balance (no all-expert or all-novice teams).
  - Schedule availability overlap.
  - Role match & commitment compatibility.
  - Interest similarity & major diversity.
- **Non-Negotiables (Constitution):**
  - AI recommends; Lecturers decide. No auto-publishing.
  - No protected/sensitive attributes (gender, ethnicity, religion, health, finance) used as matching signals.
  - Every team assignment includes a human-readable explanation (Rationale).
  - Student Team DNA is private (visible only to student and owning lecturer).
- **Language:** Vietnamese-first. All UI copy, labels, empty states, and error messages ship in Vietnamese (`<html lang="vi">`); English is not a requirement. Domain terms already fixed in English (Team DNA, Rationale, Hybrid) stay English.

## Brand Commitments

- **Product Name:** Team Formation Assistant (TFA)
- **Taglines:** *"Build balanced teams. Create better projects."* / *"Đúng người, đúng vai trò, đúng đội nhóm."*
- **Vietnamese typeface:** Be Vietnam Pro is binding — chosen for full Vietnamese diacritic coverage, not for aesthetics. Any additional face must pair with it and cover Vietnamese.
- **FPT tricolour is binding:** orange (primary), green, and blue. Approximate values in use are `#F37021` / `#00A94F` / `#0067B1` — **confirm against the official FPT brand guideline before release; these were not verified from a source document.**
- **Register:** academic and formal. The interface should read as a trustworthy institutional document a lecturer could print and submit, not as consumer software.
- The former `#4F46E5` / Slate / Inter stack was Tailwind + shadcn defaults inherited from the retired frontend, not FPT brand truth; retired 2026-08-02, never to be reintroduced.

## Evidence on Hand

- Complete specification suite: [docs/BRD.md](file:///e:/fpt-tfa-web/docs/BRD.md), [docs/PRD.md](file:///e:/fpt-tfa-web/docs/PRD.md), [docs/constitution.md](file:///e:/fpt-tfa-web/docs/constitution.md), [docs/architecture.md](file:///e:/fpt-tfa-web/docs/architecture.md), [docs/domain.md](file:///e:/fpt-tfa-web/docs/domain.md), [docs/grouping-modes.md](file:///e:/fpt-tfa-web/docs/grouping-modes.md), [docs/rbac.md](file:///e:/fpt-tfa-web/docs/rbac.md), [docs/team-dna.md](file:///e:/fpt-tfa-web/docs/team-dna.md), [docs/api-contract.md](file:///e:/fpt-tfa-web/docs/api-contract.md).
- Working backend: OR-Tools matching engine ([app/matching/ortools_engine.py](file:///e:/fpt-tfa-web/app/matching/ortools_engine.py)) with explainability rationale generator, 135 REST endpoints, and a passing pytest suite (`uv run pytest` for the current count).
- **Absent — do not fabricate:** no DESIGN.md and no documented visual system exists; no real student roster, pilot cohort, adoption metric, testimonial, or FPT institutional endorsement exists. Screens must be built from seeded/demo data, and no usage or outcome claim may be stated as fact.

## Product Principles

1. **Human-in-the-Loop:** AI suggests, lecturers decide. Lecturer override always wins and is final.
2. **Explainability:** Every team assignment carries an auditable, human-readable rationale.
3. **Fairness by Construction:** Competency, experience, role, and schedule balance are first-class objectives.
4. **Privacy First:** Student Team DNA is shielded from peers; no sensitive attributes used in matching.

## Accessibility & Inclusion

- Target Standard: **WCAG 2.2 AA**.
- Minimum color contrast ratio 4.5:1 for body copy; visible 2px outline focus indicators on interactive elements.
- Full keyboard navigation support across Team DNA wizard, availability grids, and drag-and-drop review board.
