# 005: Authentication

## Business Requirements
- The system must securely identify who is making the request.
- Lecturers can only access their own cohorts.
- Students can only access their own profile and enrollments.
- Hardcoded `X-User-Id` and `X-Role` headers must be replaced with a secure JWT Bearer token system.

## Proposed Solution
We will implement a dual-mode authentication layer:
1. **Production Mode (Firebase Auth)**: Uses a secure JWT from Firebase. Students and lecturers log in via a UI. The FastAPI backend verifies the token using `firebase-admin`.
2. **Local Dev Mode (Mock Auth)**: If Firebase is not configured, the system falls back to a simple Mock UI where developers can just type in their User ID and select a Role.

This ensures the codebase is secure for production while remaining frictionless for local development.

## User Experience
- When opening the app, users see a "Login Screen" instead of directly accessing the tools.
- They choose to log in as a Student or Lecturer (in Dev Mode, they just select. In Prod Mode, roles can be assigned by admin or self-claimed for demo).
- After logging in, they are redirected to `ProfileForm` (Student) or `Dashboard` (Lecturer).
- A "Logout" button is available in the header.
