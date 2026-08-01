# Tasks

### 1. Backend: Repository Updates [x]
- [x] Add `get_cohorts_by_owner(owner_id)` to `SqlCohortRepository`.
- [x] Add `add_cohort(cohort)` to `SqlCohortRepository`.

### 2. Backend: API Routes [x]
- [x] Implement `POST /v1/cohorts` router endpoint.
- [x] Implement `GET /v1/cohorts` router endpoint.
- [x] Write API tests in `tests/test_api_cohorts.py`.

### 3. Frontend: API Client [x]
- [x] Add `createCohort` and `getCohorts` wrappers in `web/src/api.ts`.
- [x] Add `Cohort` interface to `web/src/types.ts`.

### 4. Frontend: UI Components [x]
- [x] Create `Dashboard.tsx` for viewing and adding cohorts.
- [x] Modify `App.tsx` to handle simple routing between Dashboard and FormationConsole.
