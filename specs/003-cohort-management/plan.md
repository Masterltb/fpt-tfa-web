# Implementation Plan

## 1. Repository Extensions
- The `Cohort` domain model and DB tables already exist.
- Extend `CohortRepository` protocol and `SqlCohortRepository`:
  - `add_cohort(cohort: Cohort)`
  - `get_cohorts_by_owner(owner_id: str) -> list[Cohort]`

## 2. API Routes
- Create `app/api/routes_cohort.py` (or add to an existing file):
  - `POST /v1/cohorts`: Accepts `name`, creates a new cohort for the currently authenticated lecturer (creates UUID).
  - `GET /v1/cohorts`: Returns a list of cohorts owned by the caller.

## 3. Frontend UI
- Add API wrapper functions in `web/src/api.ts` (`getCohorts`, `createCohort`).
- Create `web/src/components/Dashboard.tsx` to list cohorts and provide a creation form.
- Update `web/src/App.tsx` (or main layout) to allow navigation between the Dashboard and the FormationConsole.
