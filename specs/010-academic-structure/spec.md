# Feature Spec: Academic Structure (Admin)

## Summary
Admin CRUD for FPT academic entities: Campus, Major, Term, Course, ClassSection.
This is the foundational data that enables all downstream features (enrollment,
grouping sessions, team formation).

## Requirements

### Campus Management
- [ ] FR-AS-01: Admin can create a campus (code, name)
- [ ] FR-AS-02: Admin can list all campuses
- [ ] FR-AS-03: Admin can update a campus
- [ ] FR-AS-04: Admin can deactivate a campus (soft delete)

### Major Management
- [ ] FR-AS-05: Admin can create a major (code, name, campus)
- [ ] FR-AS-06: Admin can list majors (filter by campus)
- [ ] FR-AS-07: Admin can update a major

### Term Management
- [ ] FR-AS-08: Admin can create a term (name, campus, dates, status)
- [ ] FR-AS-09: Admin can list terms (filter by campus, status)
- [ ] FR-AS-10: Admin can update a term
- [ ] FR-AS-11: Term status transitions: upcoming → active → completed

### Course Management
- [ ] FR-AS-12: Admin can create a course (code, name, major)
- [ ] FR-AS-13: Admin can list courses (filter by major)
- [ ] FR-AS-14: Admin can update a course

### Class Section Management
- [ ] FR-AS-15: Admin can create a class section (term, course, lecturer, code, max students)
- [ ] FR-AS-16: Admin can list class sections (filter by term, course, lecturer)
- [ ] FR-AS-17: Admin can update a class section
- [ ] FR-AS-18: Admin can assign/change lecturer for a class section
- [ ] FR-AS-19: Admin can view enrolled students for a class section

## Security
- [ ] SC-AS-01: All endpoints require admin role (non-admin → 403)
- [ ] SC-AS-02: Input validation on all fields (code uniqueness, date ranges)

## UI / Components
- Admin sidebar with navigation to each entity type
- DataTable component with search, filter, sort, pagination
- Create/Edit modal or form page per entity
- Breadcrumb navigation: Dashboard → Campuses → HCM

## Verification Plan
- Unit tests for each CRUD service method
- API tests for role enforcement (student/lecturer → 403)
- API tests for validation (duplicate codes, invalid date ranges)
- E2E test: Admin creates a full hierarchy (Campus → Term → Course → ClassSection)
