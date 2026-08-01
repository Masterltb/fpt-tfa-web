# Implementation Plan: Persistence and Overrides (Feature 002)

- **Feature dir:** specs/002-persistence-and-overrides/
- **Spec:** ./spec.md
- **Status:** planned
- **Pack:** tfa

## 1. Technical Context
- Uses SQLite database (`sqlite:///./tfa.db` via SQLAlchemy 2.0).
- Extend `app/infra/db.py` to add tables for persistence.
- Refactor/Extend `app/infra/sql_repository.py` to handle these new tables.
- Wires the FastAPI routes in `app/api/routes_formation.py`.
- Wires the React console in `web/src/components/FormationConsole.tsx` to handle saving overrides and committing.

---

## 2. Approach & Database Changes

### 2.1 New Database Schema Tables
1. **`formation_runs` Table:**
   - `id`: primary key (UUID/str)
   - `cohort_id`: string (indexed, foreign key)
   - `project_id`: string
   - `min_size`: integer
   - `max_size`: integer
   - `seed`: integer
   - `status`: string (`succeeded`, `infeasible`, `committed`)
   - `balance`: float
   - `created_at`: datetime

2. **`formation_teams` Table:**
   - `id`: primary key (UUID/str)
   - `formation_id`: string (foreign key to `formation_runs.id`)
   - `name`: string (e.g., "team-1")
   - `rationale`: string
   - `member_ids`: string (comma-separated student IDs or JSON)

3. **`committed_results` Table:**
   - `id`: primary key (UUID/str)
   - `cohort_id`: string (indexed)
   - `formation_id`: string (foreign key to `formation_runs.id`)
   - `version`: integer
   - `status`: string (`active`, `superseded`)
   - `committed_by`: string
   - `committed_at`: datetime

4. **`student_constraints` Table:**
   - `id`: primary key (UUID/str)
   - `cohort_id`: string
   - `type`: string (`must_pair`, `cannot_pair`)
   - `student_a`: string
   - `student_b`: string
   - `status`: string (`pending`, `approved`, `rejected`)

5. **`audit_events` Table:**
   - `id`: primary key (integer, autoincrement)
   - `cohort_id`: string
   - `user_id`: string
   - `action`: string (e.g., "run_formation", "save_override", "commit_teams")
   - `payload`: string (JSON description of change)
   - `timestamp`: datetime

---

## 3. Implementation Steps

### Step 1: Database Models & Migrations
- Define SQLAlchemy ORM mapped classes in `app/infra/db.py` for all new tables.
- Update `init_db(engine)` to create the tables.

### Step 2: Repository updates
- Update `SqlCohortRepository` to support:
  - `save_formation_run(run_data) -> None`
  - `get_formation_run(formation_id) -> FormationRun | None`
  - `update_formation_run_teams(formation_id, teams) -> None`
  - `commit_formation_run(formation_id, lecturer_id) -> None`
  - `get_cohort_constraints(cohort_id) -> list[Constraint]`
  - `update_constraint_status(cohort_id, constraint_id, status) -> None`
  - `log_audit_event(cohort_id, user_id, action, payload) -> None`

### Step 3: API endpoints
- Modify `POST /v1/cohorts/{cohort_id}/formations` to automatically save the new run in DB.
- Create `GET /v1/formations/{formation_id}`.
- Create `POST /v1/formations/{formation_id}/override`.
- Create `POST /v1/formations/{formation_id}/commit`.
- Create `POST /v1/cohorts/{cohort_id}/constraints/{constraint_id}/approve`.
- Create `POST /v1/cohorts/{cohort_id}/constraints/{constraint_id}/reject`.

### Step 4: React UI console
- Update the team cards to render a simple drag-and-drop mechanism or manual select dropdown for reassignment.
- Enable the "Save Overrides" and "Commit Teams" buttons to call their corresponding backend endpoints.
- Display a list of pending constraints for the lecturer to approve/reject.

---

## 4. Test Plan
- Write `tests/test_persistence.py` to:
  - Test saving and fetching formation runs via repo.
  - Test applying overrides and checking if CSDL matches.
  - Test committing a run, verifying it marks old ones as superseded and increments the version.
  - Test constraint approvals/rejections.
- Verify using pytest.
