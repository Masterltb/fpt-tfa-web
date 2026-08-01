# Tasks

### 1. Backend [x]
- [x] Install `firebase-admin` in `.venv`.
- [x] Update `app/api/deps.py` to support Bearer token authentication (Firebase + Mock fallback).
- [x] Remove `X-User-Id` dependencies in backend code.

### 2. Frontend Settings & State [x]
- [x] Install `firebase` in `web/`.
- [x] Create `AuthContext` in `web/src/lib/auth.tsx`.
- [x] Create `Login.tsx` with Mock Login UI (and Firebase hooks ready).

### 3. Frontend UI Integration [x]
- [x] Update `web/src/api.ts` to use `Authorization: Bearer` instead of `X-User-Id`.
- [x] Update `App.tsx` to require Login before showing main app.
- [x] Remove hardcoded `userId = "u1"` and `userId = "lec1"` from components.
