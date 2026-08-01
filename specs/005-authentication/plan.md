# Implementation Plan

## 1. Backend: JWT Verification & Dependencies
- Add `firebase-admin` and `python-jose` or similar if needed (Firebase Admin SDK handles verification directly, so just `firebase-admin`).
- Update `app/api/deps.py`:
  - Check for `Authorization: Bearer <token>`.
  - If `FIREBASE_PROJECT_ID` is set, verify via Firebase.
  - If NOT set, treat the token as a plaintext JSON (Mock Token) to extract `user_id` and `role`.
  - Remove reliance on `X-User-Id` entirely.

## 2. Frontend: Authentication Context
- Install `firebase` npm package.
- Create `web/src/lib/auth.tsx`: A React Context (`AuthContext`) that manages the current logged-in user.
- It will support switching between Firebase and Mock modes based on environment variables (e.g., `VITE_USE_FIREBASE=true`).

## 3. Frontend: Login UI & Routing
- Create `web/src/components/Login.tsx`.
- Update `web/src/App.tsx` to conditionally render `Login` if no user is authenticated.
- Render `Dashboard` or `ProfileForm` based on the user's role.

## 4. Frontend: API Client
- Update `web/src/api.ts` to fetch the token from `AuthContext` (or Firebase directly) and send it via the `Authorization` header.
