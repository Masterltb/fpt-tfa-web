# Web (React + TypeScript) — placeholder

Scaffold only. Not built in this iteration (needs `npm ci`, which requires network).

## Setup (next iteration)

```sh
npm ci
npm run dev        # dev server
npm run typecheck  # tsc --noEmit
npm run test       # vitest
npm run build      # production build
```

## Planned surfaces

- **Student:** profile intake (skills, experience, availability, preferences, desired role).
- **Lecturer:** create cohort/project, run formation, review teams + rationale, override, commit.

Authorization is enforced server-side (see `app/api/`); the UI never gates security by itself.
Meets WCAG 2.1 AA (NFR-08).
