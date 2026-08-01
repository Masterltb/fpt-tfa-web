# Implementation Plan

## 1. Database Schema
- `StudentRow` (id, name, major, experience_years, desired_role, availability JSON)
- `StudentSkillRow` (student_id, skill_name, proficiency)
- `EnrollmentRow` (student_id, cohort_id)

## 2. Repository Updates (`SqlCohortRepository` / `StudentRepository`)
- Create `StudentRepository` protocol for profile management.
- Implement `SqlStudentRepository`: `save_profile`, `get_profile`.
- Update `SqlCohortRepository` to support `enroll_student` and `get_enrolled_students(cohort_id)`.

## 3. API Routes
- `PUT /v1/profiles/me`: Create/Update the caller's profile.
- `GET /v1/profiles/me`: Fetch the caller's profile.
- `POST /v1/cohorts/{cohort_id}/enroll`: Enroll in a cohort.
- `GET /v1/cohorts/{cohort_id}/students`: Get list of students (for the lecturer).

## 4. Frontend Integration
- Update `api.ts` with new endpoints.
- Wire `ProfileForm.tsx` to actually submit to `PUT /v1/profiles/me`.
- Add an "Enroll in Cohort" UI for students inside `ProfileForm.tsx`.
- Update `FormationConsole.tsx` to fetch `GET /v1/cohorts/{cohort_id}/students` and pass them to `runFormation`.
