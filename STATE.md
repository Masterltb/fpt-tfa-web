# STATE

- **Last updated:** 2026-08-02
- **Last verified commit:** 6e25cde (feat/018: replace mock data with Supabase DB queries across academic, sessions & teams)
- **Active pack:** tfa
- **Loop level:** L2
- **loops_paused:** false
- **kill_switch:** false

<!--
loops_paused: false
-->

## Current focus

**Phase 2 — Real Database Integration & E2E Test Suite (In Progress).**

Phase 1 (3 Core Portals) is fully complete. Phase 2 is now active: all backend API mock arrays have been replaced with live Supabase PostgreSQL queries, and Playwright E2E tests are integrated into the GitHub Actions CI/CD pipeline.

### What is verified
- **48 Backend tests PASS** (`uv run pytest`) — unit, domain, OR-Tools, persistence, contract, and E2E workflow suites.
- **Frontend Typecheck & Production Build PASS** (`npx tsc -b` and `npm run build`) with 0 errors.
- **Mock Data Removed (feat/018)**: All in-memory arrays `_campuses_db`, `_terms_db`, `_majors_db`, `_courses_db`, `_sections_db`, `_sessions_db`, `_teams_db`, `_invitations_db`, `_join_requests_db` eliminated from `routes_academic.py`, `routes_sessions.py`, `routes_teams.py`. All endpoints now query Supabase via SQLAlchemy ORM.
- **Playwright E2E Tests**: 3 spec files (`student-portal.spec.ts`, `lecturer-portal.spec.ts`, `admin-portal.spec.ts`) covering all 3 roles. Integrated into GitHub Actions CI as dedicated `playwright-e2e` job.
- **GitHub Pages**: Live web app auto-deployed to GitHub Pages on every push to `main`.
- **SDD Specifications**: `specs/001-student-portal/spec.md`, `specs/002-lecturer-portal/spec.md`, `specs/003-admin-portal/spec.md`, `specs/017-e2e-playwright-testing/spec.md`.
- **Implemented Screens across 3 Roles**:
  - **Student Portal**: Dashboard (Screen 11), Team DNA Profile Wizard (Screen 12), Class Section Workspace (Screen 13), AI Recommended Teammates with XAI Rationale (Screen 14).
  - **Lecturer Portal**: Dashboard (Screen 20), Session Builder Wizard (Screen 21), AI Matching Run Progress & CP-SAT Solver Logs (Screen 23), Drag-Drop Override Studio & Human-in-the-Loop Publish (Screen 24).
  - **Admin Portal**: Admin Dashboard & System KPIs (Screen 29), Roster Import Wizard with CSV/Excel validation (Screen 30), Constitution Guardrail Editor (Screen 31), Security & RBAC Audit Log Viewer (Screen 36).

## Next steps

1. **Phase 2 (Remaining)**:
   - Connect Firebase Auth production tokens to replace mock base64 tokens in `deps.py`.
   - Compute real `dnaCompletionRate` from `TeamDNARow.completion_percentage` instead of hardcoded `92`.
2. **Phase 3 Production Deployment Prep**:
   - Configure Docker / containerization environment and Firebase production authentication integration.
