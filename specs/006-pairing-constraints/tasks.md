# Tasks

### 1. Repository [x]
- [x] Implement `add_constraint`, `get_constraints`, `update_constraint_status` in `SqlCohortRepository`.
- [x] Fix duplicate `StudentConstraintRow` — added `ForeignKey` to original, removed duplicate.

### 2. API Endpoints [x]
- [x] `POST /v1/cohorts/{cohort_id}/constraints` (student submits constraint request).
- [x] `GET /v1/cohorts/{cohort_id}/constraints` (student sees own; lecturer sees all).
- [x] `PUT /v1/cohorts/{cohort_id}/constraints/{constraint_id}/status` (lecturer approves/rejects).

### 3. Frontend API Client [x]
- [x] Add `getConstraints`, `addConstraint`, `updateConstraintStatus` to `api.ts`.

### 4. Frontend UI [x]
- [x] Create `StudentConstraints.tsx`: load + display own constraints, submit new must_pair/cannot_pair requests.
- [x] Add `StudentConstraints` component to `ProfileForm.tsx`.
- [x] Add Constraints Review panel in `FormationConsole.tsx` with Approve/Reject buttons.
- [x] Pass only `approved` constraints to `runFormation` (must_pair / cannot_pair wired through AI engine).
