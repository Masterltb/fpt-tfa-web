# Tasks

### 1. Database & ORM [x]
- [x] Add `StudentRow`, `StudentSkillRow`, `EnrollmentRow` to `app/infra/db.py`.

### 2. Repositories [x]
- [x] Define `StudentRepository` protocol and `SqlStudentRepository` class.
- [x] Add `enroll_student` and `get_enrolled_students` to `CohortRepository`.

### 3. API Endpoints [x]
- [x] Create `app/api/routes_profile.py` for `/v1/profiles/me`.
- [x] Add `/v1/cohorts/{id}/enroll` and `/v1/cohorts/{id}/students` to `routes_cohort.py`.

### 4. Frontend UI [x]
- [x] Update `ProfileForm.tsx` to save/load profile and enroll in cohorts.
- [x] Update `FormationConsole.tsx` to use real enrolled students instead of `demoRoster`.
