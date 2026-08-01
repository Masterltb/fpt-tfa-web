# Code Style — Team Formation Assistant (stack idioms)

Pack companion to the portable `policies/code-quality.md`. The `code-review` gate reads both.

## Python (backend / optimizer)

- Type hints on every public function; `mypy` runs in strict mode; no untyped defs.
- `ruff` for lint + format; zero-warnings policy. No bare `except` — catch specific errors.
- Validate all boundary inputs with **pydantic** models; do not trust request payloads.
- Keep the domain pure: no FastAPI, ORM, or OR-Tools imports inside `domain/`.
- The optimizer takes an explicit `seed`; never rely on process-global randomness.
- Small functions; a function that needs a comment to explain "what" should be split.
- Use `Enum` classes for status fields (not raw strings) in domain models.

## TypeScript / React (web)

- `strict` TS; no `any`. Exhaustive handling of discriminated unions.
- Function components + hooks; data fetching isolated via **TanStack Query** hooks.
- **React Router v6** for routing; no manual route state management.
- **Shadcn/ui** components; do not reinvent standard UI patterns.
- **Tailwind CSS v4** for styling; use design tokens for consistency.
- **React Hook Form** + **Zod** for form validation.
- Tests with Vitest + React Testing Library; assert behavior, not implementation.

## Naming

- Python: `snake_case` for functions/vars, `PascalCase` for classes, `UPPER_SNAKE` for consts.
- TS: `camelCase` for vars/functions, `PascalCase` for components/types.
- Domain terms match `docs/domain.md` exactly (Campus, Term, Course, ClassSection,
  GroupingSession, Student, TeamDNA, Team, Formation, Constraint).
- API routes use kebab-case: `/v1/admin/class-sections/{id}/import-roster`.

## Error handling idiom

- Backend: raise typed domain errors; the API layer maps them to the `{code,message,details}`
  contract and the right HTTP status. Never swallow an error.
- Optimizer: infeasibility is a typed result (reported), not an exception that hides the cause.
- Frontend: TanStack Query error boundaries for API errors; toast notifications for user feedback.

## Do / Don't

- **Do:** log run inputs + seed + result version for every formation (auditability).
- **Do:** use Team DNA as the branded term, not "profile" (product identity).
- **Do:** use GroupingSession as the primary formation unit, not "project" or "cohort" (new model).
- **Don't:** put authorization checks in the React UI as the only gate — server decides.
- **Don't:** read or log protected/sensitive attributes.
- **Don't:** use raw SQL — always use SQLAlchemy ORM or Alembic migrations.
