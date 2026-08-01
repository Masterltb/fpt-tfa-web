# Feature Spec: 017-e2e-playwright-testing

## Summary
End-to-End Playwright automated browser test suite for testing the full Team Formation Assistant web application workflow across Student, Lecturer, and Admin roles.

## Requirements
- [ ] **Admin Flow**: Login as Admin, view campuses/terms, create new class section, import student CSV roster.
- [ ] **Student Flow**: Login as Student, fill Team DNA profile, set weekly availability matrix, create student-led team, invite teammate.
- [ ] **Lecturer Flow**: Login as Lecturer, create Grouping Session (`HYBRID` mode), trigger AI Matching engine, review suggested teams on Review Board, approve and publish.

## Verification Plan
- `npx playwright test` or automated Playwright test execution.
- Pytest integration tests pass: `uv run pytest`.
- Ruff lint check pass: `uv run ruff check .`.
