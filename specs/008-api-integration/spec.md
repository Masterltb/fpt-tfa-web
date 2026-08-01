# 008: API Integration — Connect Web UI to Real FastAPI Backend

- **Version:** 1.0.0 · **Date:** 2026-07-18 · **Status:** draft
- **Traceability:** `docs/PRD.md` (BC-01, BC-02, BC-03, BC-04, BC-06, BC-08), `docs/api-contract.md`, `specs/007-ui-redesign/spec.md`

---

## 1. Executive Summary & Objective

In `feat/007-ui-redesign`, we ported 13 comprehensive screens from Figma Make (`UI-demo`) into clean, role-based Vanilla CSS components (`Shell`, `StudentDashboard`, `LecturerDashboard`, `FormationBoard`, etc.). Currently, these components rely heavily on local mock data (`web/src/data/mock.ts`) and mock state (`getStudent`, `COHORTS`, `TEAMS`, `STUDENTS`).

**Objective**: Replace all mock data reads/writes in UI components with real REST API calls to the FastAPI backend (`/v1/`) via `web/src/api.ts`, fully adhering to the authentication (`Bearer token`) and role-based access control (`RBAC`) boundaries.

---

## 2. Scope & Boundaries

### Included (`IN SCOPE`)
1. **De-mocking Dynamic Data**: Re-routing all student, cohort, constraint, and formation state in `web/src/components/` to load and save via `web/src/api.ts`.
2. **Static Constants Refactoring**: Moving pure reference constants (`SKILL_CATALOG`, `DAYS`, `SLOTS`, `SLOT_LABELS`) from `data/mock.ts` to `types/ui.ts` or a clean `constants.ts` module so components can import static catalogs without importing mock student/team instances.
3. **API Layer Enhancements (`api.ts`)**: Ensuring `api.ts` fully supports all needed request payloads (`ProfileIn`, `CreateCohortIn`, `RunFormationIn`, `OverrideFormationIn`, `CreateConstraintIn`, `UpdateConstraintStatusIn`).
4. **Loading & Error UX**: Adding consistent loading states (`ProgressBar` / spinners) and error alert notices when API calls fail or return `403 Forbidden` / `422 Unprocessable Content`.

### Excluded (`OUT OF SCOPE`)
1. **Backend Route Logic Changes**: Existing backend routes in `app/api/` (`routes_profile.py`, `routes_cohort.py`, `routes_formation.py`) are assumed functional and authoritative.
2. **OR-Tools Algorithm Changes**: Handled separately in `feat/009-optimizer-enhancements`.

---

## 3. UI Screen to API Mapping Matrix

| UI Component | Role | Dynamic Data Required | Target API Endpoint(s) (`web/src/api.ts`) |
| :--- | :---: | :--- | :--- |
| **`StudentDashboard`** | Student | Profile completeness, cohort status, teams | `GET /v1/profiles/me`<br>`GET /v1/students/me/teams` (or cohort status) |
| **`StudentProfile`** | Student | Name, major, experience years, desired role | `GET /v1/profiles/me`<br>`PUT /v1/profiles/me` |
| **`StudentSkills`** | Student | Student skill inventory (`skills` list) | `GET /v1/profiles/me`<br>`PUT /v1/profiles/me` |
| **`StudentAvailability`**| Student | 7-day $\times$ 3-slot schedule (`availability` set) | `GET /v1/profiles/me`<br>`PUT /v1/profiles/me` |
| **`StudentPreferences`**| Student | Desired role + must-pair / cannot-pair requests | `GET /v1/profiles/me`<br>`POST /v1/cohorts/{id}/constraints`<br>`GET /v1/cohorts/{id}/constraints` |
| **`StudentReview`** | Student | Full consolidated profile read-only view | `GET /v1/profiles/me` |
| **`StudentTeam`** | Student | Assigned team members, roles, rationale | `GET /v1/formations/{id}` (or active cohort formation) |
| **`LecturerCohorts`** | Lecturer | Owned cohorts list, create cohort modal | `GET /v1/cohorts`<br>`POST /v1/cohorts` |
| **`CohortWorkspace`** | Lecturer | Enrolled students, requirements, constraints | `GET /v1/cohorts/{id}/students`<br>`GET /v1/cohorts/{id}/constraints`<br>`PUT /v1/cohorts/{id}/constraints/{cid}/status` |
| **`FormationBoard`** | Lecturer | Teams, pool students, drag-and-drop overrides | `POST /v1/cohorts/{id}/formations`<br>`GET /v1/formations/{id}`<br>`POST /v1/formations/{id}/override`<br>`POST /v1/formations/{id}/commit` |

---

## 4. Architectural Design & State Management

### A. Authentication & Token Injection
Components access `token` and `user` via the `useAuth()` hook:
```tsx
const { token, user } = useAuth();
// All API calls pass { token: token! } as the auth parameter
```

### B. Static vs Dynamic Separation
To eliminate `data/mock.ts` imports while preserving static UI catalogs:
- **Move** `SKILL_CATALOG`, `DAYS`, `SLOTS`, and `SLOT_LABELS` into `web/src/types/constants.ts` (or `web/src/types/ui.ts`).
- **Remove** all imports of `STUDENTS`, `COHORTS`, `TEAMS`, and `getStudent` from component files.

---

## 5. Verification & Acceptance Criteria

1. **Type Consistency (`tsc --noEmit`)**:
   - `npm run typecheck` inside `web/` must pass with `0 errors`.
2. **Unit & Component Testing (`vitest run`)**:
   - `npm test` inside `web/` must pass (`100% tests passed`), verifying API mock handling in testing environments (`vi.spyOn(globalThis, 'fetch')`).
3. **End-to-End Functional Verification**:
   - A student can edit their profile (`PUT /v1/profiles/me`) and immediately see changes reflected upon reload (`GET /v1/profiles/me`).
   - A lecturer can list cohorts (`GET /v1/cohorts`), view enrolled students, trigger a formation run (`POST /v1/cohorts/{id}/formations`), adjust teams on the Kanban board (`POST /v1/formations/{id}/override`), and commit the final result.
