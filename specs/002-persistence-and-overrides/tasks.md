# Tasks List: Persistence and Overrides (Feature 002)

- **Feature dir:** specs/002-persistence-and-overrides/
- **Status:** planned
- **Pack:** tfa

## Task Trackers

### 1. Database Schema & ORM [x]
- [x] Define SQLAlchemy tables in `app/infra/db.py` for:
  - `formation_runs`
  - `formation_teams`
  - `committed_results`
  - `student_constraints`
  - `audit_events`
- [x] Add foreign keys, indices, and verify relationships.
- [x] Verify automatic table creation on startup.

### 2. Repository Persistence Code [x]
- [x] Add `save_run` and `get_run` methods to `SqlCohortRepository`.
- [x] Add `update_run_teams` for overrides.
- [x] Add `commit_run` to save committed results under transaction and handle version increments.
- [x] Add `log_audit_event` and `update_constraint_status`.

### 3. API Routes [x]
- [x] Implement `GET /v1/formations/{formation_id}`.
- [x] Implement `POST /v1/formations/{formation_id}/override`.
- [x] Implement `POST /v1/formations/{formation_id}/commit`.
- [x] Implement `POST /v1/cohorts/{cohort_id}/constraints/{constraint_id}/approve` & `reject`.
- [x] Wire object-ownership checks using fastapi principal dependencies.

### 4. React Frontend Console [x]
- [x] Update frontend UI state for manual student moves.
- [x] Connect "Save Overrides" to call the backend route.
- [x] Connect "Commit Teams" to save/lock results.
- [x] Add simple UI to display and approve/reject student-proposed constraints.

### 5. Automated Tests [x]
- [x] Create `tests/test_persistence.py` to cover repo persistence operations.
- [x] Add integration tests in `tests/test_api_persistence.py` covering overrides and commit routes.
- [x] Run pytest to verify all test cases pass.
