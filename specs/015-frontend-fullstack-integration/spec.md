# Feature Spec: 015-frontend-fullstack-integration

## Summary
Integrate the React 18 TypeScript frontend web application with the newly built FastAPI backend REST API (v1.0.0). Provides complete fullstack interfaces for Admin, Student, and Lecturer roles using React Router v6, TanStack Query v5, Tailwind CSS v4, and Shadcn/ui components.

## Requirements
- [ ] **Admin Portal**: Manage Campuses, Terms, Courses, Class Sections, Users, and CSV Student Roster Imports.
- [ ] **Student DNA Portal**: Student Dashboard, Team DNA profile intake (skills, preferred roles, availability matrix, experiences, readiness score), and Student-led team invitations.
- [ ] **Lecturer Portal**: Grouping Session management, AI Matching trigger, Lecturer Review Board with drag-and-drop team overrides, and Approve/Publish controls.
- [ ] **Auth & Role Guards**: Support JWT / Bearer token authentication and route guards per role (`STUDENT`, `LECTURER`, `ADMIN`).
- [ ] **RFC 7807 Error Envelope Handling**: Gracefully render API errors and success envelopes.

## UI / Components
- `web/src/api/client.ts`: Centralized API fetch client with Authorization header handling.
- `web/src/pages/admin/AdminDashboard.tsx`: Admin catalog management & roster import dropzone.
- `web/src/pages/student/StudentPortal.tsx`: Student Team DNA profile wizard & team invitation board.
- `web/src/pages/lecturer/LecturerReviewBoard.tsx`: Lecturer grouping session control board & AI team review.

## Verification Plan
- Backend Harness Gate: `uv run ruff check .` & `uv run pytest`
- Frontend Harness Gate: `cd web && npm run build`
