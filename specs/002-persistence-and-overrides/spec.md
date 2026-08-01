# Functional Specification: Persistence and Overrides (Feature 002)

- **Feature dir:** specs/002-persistence-and-overrides/
- **Status:** specified
- **Pack:** tfa

## 1. User Stories & Use Cases

### 1.1 Persistence of Formation Runs
- As a **Lecturer**, when I click "Run Formation", I want my trial parameters (project, min/max size, student snapshot, seed) and the suggested teams to be saved in the database.
- Each run has a unique `formationId` (UUID or string), status (`SUCCEEDED`, `INFEASIBLE`, `COMMITTED`), and result metrics (balance score).
- A lecturer can retrieve any previous run using `GET /v1/formations/{formationId}`.

### 1.2 Persisting Manual Overrides
- As a **Lecturer**, after reviewing the suggested teams on the console, I want to move students between teams (manual overrides) and save those overrides.
- Saving overrides updates the current trial run in the database with the overridden team assignments and reasons.

### 1.3 Committing Team Formations
- As a **Lecturer**, when I am satisfied with the team assignments (including any overrides), I want to "Commit Teams".
- Committing:
  - Changes the status of the formation run to `COMMITTED`.
  - Creates a new active committed result (`committedResults`) for the cohort, incrementing the cohort's `resultVersion`.
  - Supersedes any previous active committed result for that cohort (updating its status to `SUPERSEDED`).

### 1.4 Constraint Approvals
- As a **Lecturer**, I want to view a list of student-proposed constraints (Must-Pair / Cannot-Pair) and either approve or reject them.
- Approved constraints are marked as `APPROVED` and will be loaded and honored in subsequent AI matching runs.
- Rejected constraints are marked as `REJECTED` and ignored.

### 1.5 Audit Logs
- All lecturer state-changing actions (running a matching algorithm, saving overrides, committing results, approving/rejecting constraints) must be appended to the cohort's `auditEvents` collection in the database.

---

## 2. API Contract Specification

### 2.1 Get Formation Details
- **Route:** `GET /v1/formations/{formationId}`
- **Response:**
  ```json
  {
    "formationId": "uuid-string",
    "cohortId": "c1",
    "projectId": "p1",
    "seed": 1,
    "status": "succeeded",
    "balance": 0.84,
    "teams": [
      {
        "id": "team-1",
        "members": ["student-1", "student-2", "student-3"],
        "rationale": "Description"
      }
    ]
  }
  ```

### 2.2 Save Manual Overrides
- **Route:** `POST /v1/formations/{formationId}/override`
- **Request Body:**
  ```json
  {
    "teamOverrides": {
      "team-1": ["student-1", "student-2", "student-4"],
      "team-2": ["student-3", "student-5", "student-6"]
    }
  }
  ```
- **Response:** Updated formation details showing the overridden assignments.

### 2.3 Commit Formation Run
- **Route:** `POST /v1/formations/{formationId}/commit`
- **Response:**
  ```json
  {
    "status": "committed",
    "resultId": "new-committed-result-id",
    "version": 1
  }
  ```

### 2.4 Approve/Reject Constraints
- **Route:** `POST /v1/cohorts/{cohortId}/constraints/{constraintId}/approve`
- **Route:** `POST /v1/cohorts/{cohortId}/constraints/{constraintId}/reject`
- **Response:** `{"success": true}`

---

## 3. Security and RBAC Constraints
- **Authorization:** Standard custom headers `X-User-Id` and `X-Role` are required for all endpoints.
- **Ownership Check:** The lecturer must be verified as the owner of the cohort to run, override, commit, or manage constraints.
