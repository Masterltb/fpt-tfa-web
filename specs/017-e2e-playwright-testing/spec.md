# Feature Spec: 017-e2e-playwright-testing

## Summary
End-to-End Playwright automated browser test suite for testing the full Team Formation Assistant web application workflow across Student, Lecturer, and Admin roles.

## Requirements
- [x] **Admin Flow**: Login as Admin, view campuses/terms, create new class section, import student CSV roster.
- [x] **Student Flow**: Login as Student, fill Team DNA profile, set weekly availability matrix, create student-led team, invite teammate.
- [x] **Lecturer Flow**: Login as Lecturer, create Grouping Session (`HYBRID` mode), trigger AI Matching engine, review suggested teams on Review Board, approve and publish.

## Verification Plan
- `npx playwright test` or automated Playwright test execution.
- Pytest integration tests pass: `uv run pytest`.
- Ruff lint check pass: `uv run ruff check .`.

## Implementation Notes
- 3 Playwright spec files: `web/e2e/student-portal.spec.ts`, `web/e2e/lecturer-portal.spec.ts`, `web/e2e/admin-portal.spec.ts`.
- `playwright.config.ts`: HTML reporter in CI, screenshot on failure, 60s webServer timeout.
- GitHub Actions: dedicated `playwright-e2e` job in `.github/workflows/deploy.yml` (runs after `frontend-ci`).
- Docker and GitHub Pages deployments gate on Playwright tests passing.
- HTML report uploaded as GitHub Actions artifact (`playwright-report`, 14 days retention).
