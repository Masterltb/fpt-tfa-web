# Implementation Plan

## 1. Database & Repositories
- `StudentConstraintRow` is already defined in `app/infra/db.py`.
- Update `SqlCohortRepository` to implement:
  - `add_constraint`
  - `get_constraints(cohort_id)`
  - `update_constraint_status(cohort_id, constraint_id, status)`

## 2. API Endpoints
- Add to `app/api/routes_cohort.py`:
  - `POST /v1/cohorts/{cohort_id}/constraints` (Roles: student)
  - `GET /v1/cohorts/{cohort_id}/constraints` (Roles: student, lecturer)
  - `PUT /v1/cohorts/{cohort_id}/constraints/{constraint_id}/status` (Roles: lecturer)

## 3. Frontend API
- Update `web/src/types.ts` to include `Constraint` if not fully typed.
- Update `web/src/api.ts` with wrapper functions for the new endpoints.

## 4. Frontend UI
- Update `web/src/components/ProfileForm.tsx` to list constraints and allow creating new ones for enrolled cohorts.
- Update `web/src/components/FormationConsole.tsx` to display pending constraints and allow approval/rejection.
- Update `FormationConsole.tsx` `onRun` to pass only `status === 'approved'` constraints to the engine.
