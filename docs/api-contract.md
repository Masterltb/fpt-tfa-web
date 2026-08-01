# API Contract — Team Formation Assistant

## Conventions

- Transport: REST/JSON over HTTPS. Auth: bearer token (Firebase); never a token in a URL.
- Error shape: `{ "code": string, "message": string, "details": object }`; HTTP status is authoritative.
- Versioned under `/v1`. Timestamps are ISO-8601 UTC. Pagination via `limit` and `cursor`.
- All endpoints require authentication unless marked PUBLIC.

---

## Admin Endpoints

| Method | Path | Purpose | Errors |
|--------|------|---------|--------|
| GET | /v1/admin/dashboard | Dashboard statistics | 401, 403 |
| **Campuses** | | | |
| POST | /v1/admin/campuses | Create a campus | 400, 403 |
| GET | /v1/admin/campuses | List all campuses | 403 |
| PUT | /v1/admin/campuses/{id} | Update a campus | 400, 403, 404 |
| DELETE | /v1/admin/campuses/{id} | Deactivate a campus | 403, 404 |
| **Majors** | | | |
| POST | /v1/admin/majors | Create a major | 400, 403 |
| GET | /v1/admin/majors | List all majors | 403 |
| PUT | /v1/admin/majors/{id} | Update a major | 400, 403, 404 |
| **Terms** | | | |
| POST | /v1/admin/terms | Create a term | 400, 403 |
| GET | /v1/admin/terms | List terms (filter by campus) | 403 |
| PUT | /v1/admin/terms/{id} | Update a term | 400, 403, 404 |
| **Courses** | | | |
| POST | /v1/admin/courses | Create a course | 400, 403 |
| GET | /v1/admin/courses | List courses | 403 |
| PUT | /v1/admin/courses/{id} | Update a course | 400, 403, 404 |
| **Class Sections** | | | |
| POST | /v1/admin/class-sections | Create a class section | 400, 403 |
| GET | /v1/admin/class-sections | List class sections (filter by term, course) | 403 |
| PUT | /v1/admin/class-sections/{id} | Update a class section | 400, 403, 404 |
| POST | /v1/admin/class-sections/{id}/import-roster | Import students via CSV/Excel | 400, 403, 404 |
| GET | /v1/admin/class-sections/{id}/roster | View roster | 403, 404 |
| **Users** | | | |
| POST | /v1/admin/users | Create a user | 400, 403 |
| GET | /v1/admin/users | List users (filter by role) | 403 |
| PUT | /v1/admin/users/{id} | Update a user | 400, 403, 404 |
| PATCH | /v1/admin/users/{id}/status | Activate/deactivate | 403, 404 |
| **Audit** | | | |
| GET | /v1/admin/audit-logs | Query audit events | 403 |

---

## Student Endpoints

| Method | Path | Purpose | Errors |
|--------|------|---------|--------|
| GET | /v1/students/me/profile | Read own profile | 401 |
| PUT | /v1/students/me/profile | Update own profile | 400, 401 |
| GET | /v1/students/me/dashboard | Dashboard data | 401 |
| **Classes** | | | |
| GET | /v1/students/me/classes | List enrolled class sections | 401 |
| **Team DNA** | | | |
| GET | /v1/students/me/team-dna/{classSectionId} | Read own Team DNA | 401, 404 |
| PUT | /v1/students/me/team-dna/{classSectionId} | Update Team DNA | 400, 401 |
| GET | /v1/students/me/team-dna/{classSectionId}/completion | Completion percentage | 401, 404 |
| **Teams** | | | |
| POST | /v1/students/me/teams | Create a draft team | 400, 401 |
| GET | /v1/students/me/teams | List own teams | 401 |
| POST | /v1/students/me/teams/{teamId}/invite | Invite a student | 400, 401, 403 |
| POST | /v1/students/me/teams/{teamId}/submit | Submit team for approval | 401, 403, 409 |
| POST | /v1/students/me/join-requests | Submit a join request | 400, 401 |
| **Invitations** | | | |
| GET | /v1/students/me/invitations | List pending invitations | 401 |
| POST | /v1/students/me/invitations/{id}/respond | Accept or decline | 400, 401, 404 |
| **Recommendations** | | | |
| GET | /v1/students/me/recommendations/{sessionId} | AI-recommended teams | 401, 404 |
| **Official Team** | | | |
| GET | /v1/students/me/official-team/{sessionId} | View published team result | 401, 404 |
| **Constraints** | | | |
| POST | /v1/students/me/constraints | Propose must/cannot-pair | 400, 401 |

---

## Lecturer Endpoints

| Method | Path | Purpose | Errors |
|--------|------|---------|--------|
| GET | /v1/lecturer/dashboard | Dashboard data | 401, 403 |
| **Classes** | | | |
| GET | /v1/lecturer/my-classes | List owned class sections | 401, 403 |
| GET | /v1/lecturer/classes/{id}/roster | View class roster | 403, 404 |
| GET | /v1/lecturer/classes/{id}/student-readiness | Team DNA completion stats | 403, 404 |
| **Grouping Sessions** | | | |
| POST | /v1/lecturer/classes/{id}/sessions | Create grouping session | 400, 403 |
| GET | /v1/lecturer/classes/{id}/sessions | List sessions | 403 |
| PUT | /v1/lecturer/sessions/{id} | Update session config | 400, 403, 404 |
| PATCH | /v1/lecturer/sessions/{id}/status | Change session status | 403, 404, 409 |
| **Matching** | | | |
| POST | /v1/lecturer/sessions/{id}/run-matching | Trigger AI matching | 403, 409, 422 |
| GET | /v1/lecturer/sessions/{id}/results | Get formation results | 403, 404 |
| **Review & Override** | | | |
| POST | /v1/lecturer/sessions/{id}/override | Adjust team assignments | 400, 403, 409 |
| POST | /v1/lecturer/sessions/{id}/publish | Approve and publish | 403, 409 |
| **Constraints** | | | |
| GET | /v1/lecturer/sessions/{id}/constraints | List constraints | 403 |
| PATCH | /v1/lecturer/constraints/{id}/status | Approve/reject constraint | 403, 404 |
| **Reports** | | | |
| GET | /v1/lecturer/classes/{id}/reports | Basic class reports | 403, 404 |

---

## Public Endpoints

| Method | Path | Purpose | Errors |
|--------|------|---------|--------|
| GET | /health | Health check | — |

---

## Formation request/response (shape)

### Run Matching Request
```json
{
  "session_id": "string",
  "seed": 42
}
```

### Run Matching Response (per team)
```json
{
  "team_id": "string",
  "name": "Team 03",
  "members": [
    { "student_id": "string", "name": "string", "role": "string" }
  ],
  "scores": {
    "overall": 0.91,
    "skill_coverage": 0.95,
    "experience_balance": 0.88,
    "schedule_overlap": 0.85,
    "role_match": 0.92,
    "commitment_compat": 0.90,
    "interest_similarity": 0.78,
    "major_diversity": 0.80,
    "working_pref_compat": 0.75
  },
  "rationale": "Team 03 has a 91% compatibility score because it covers all required roles, has strong backend and UI skills, and all five members share two common free-time slots.",
  "warnings": ["No common Monday slots"],
  "unmet_soft": ["Interest similarity below threshold"]
}
```

### Unassignable student
```json
{
  "student_id": "string",
  "reason": "Cannot satisfy must-pair constraint with student X who is already in a full team."
}
```

## Validation and errors

- Every input is validated at the API boundary with pydantic models; unknown fields rejected.
- `422` when a run is infeasible (hard constraints cannot be satisfied) — the response names
  the conflicting constraints rather than returning a partial, invalid formation.
- `409` when attempting to modify a published/committed formation.
