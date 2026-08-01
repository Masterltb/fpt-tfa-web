# STATE

- **Last updated:** 2026-08-01
- **Last verified commit:** (pre-restructure)
- **Active pack:** tfa
- **Loop level:** L1
- **loops_paused:** false
- **kill_switch:** false

<!--
loops_paused: false
-->

## Current focus

**Phase 0: Full-stack restructuring.** Expanding the walking skeleton from a simple
Cohort→Project model to the full FPT academic structure (Campus→Term→Course→ClassSection→
GroupingSession→Teams). Adding three roles (Student, Lecturer, Admin), Team DNA profiles,
three grouping modes (Lecturer-led, Student-led, Hybrid), and upgrading frontend tooling
(React Router, TanStack Query, Shadcn/ui, Tailwind CSS v4).

### What is verified (from previous skeleton)
- Core domain + deterministic mock matching engine (`app/`), 18 tests PASS
- OR-Tools CP-SAT engine verified (hard constraints, determinism, infeasibility)
- FastAPI API scaffolded with auth, cohort, formation, profile routes
- React web scaffolded with 18 components (student + lecturer flows)
- Firebase Auth integrated

### What is being restructured
- Domain model: adding Campus, Term, Course, Major, ClassSection, GroupingSession, TeamDNA
- API: splitting into admin, student, lecturer route groups
- Frontend: adding React Router, TanStack Query, Shadcn/ui, Tailwind CSS v4
- Database: preparing migration from SQLite to PostgreSQL (via Alembic)
- Docs: updating domain, rbac, api-contract, architecture + new docs

## Blockers

- [ ] Frontend dependencies not yet installed (React Router, TanStack Query, Tailwind, Shadcn)
- [ ] PostgreSQL not yet configured (still using SQLite)
- [ ] Alembic migrations not yet generated

## Next steps

1. Complete Phase 0: harness, domain model, docs, infrastructure setup
2. Phase 1: Admin module (academic structure CRUD + CSV import)
3. Phase 2: Auth upgrade (3 roles) + Landing page
4. Phase 3: Student module (Team DNA wizard + team creation/invite)
5. Phase 4: Lecturer module (grouping session + matching engine upgrade)
6. Phase 5: Lecturer review board (drag-drop + approve/publish)
7. Phase 6: Dashboards + Notifications + Reports + Audit
8. Phase 7: Polish, E2E tests, deploy

## Open decisions (not yet ADR'd)

- How is competency "balance" scored precisely (variance across teams vs min-max spread)?
- Minimum common availability threshold for R5.
- Exact Team DNA completion scoring weights.
- Hybrid mode: how long after deadline before AI auto-fills gaps?

## Recent loop runs

| Date | Loop | Level | Result | Link |
|------|------|-------|--------|------|
| —    | —    | —     | —      | —    |
