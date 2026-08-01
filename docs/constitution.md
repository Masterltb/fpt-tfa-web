# Team Formation Assistant — Constitution

- **Version:** 2.0.0    **Ratified:** 2026-07-15    **Last amended:** 2026-08-01

Project-level non-negotiables that gate every plan (the plan template's Constitution Check).
Complements the portable `policies/`; may be stricter, never looser.

## Preamble

The system exists to form fair, balanced student teams quickly. It must never trade away
fairness, student privacy, or the explainability of its suggestions for speed or convenience.

## Principles

1. **Human-in-the-loop.** The AI suggests; a lecturer decides. An override always wins over
   the optimizer and is the committed result. No auto-publish.
2. **Explainability.** Every team assignment carries a rationale a human can read and audit.
   A suggestion nobody can explain is not shippable.
3. **Fairness by construction.** Balance of competency, experience, roles, and schedule is a
   first-class objective, not an afterthought.
4. **Privacy first.** A student's profile and Team DNA are visible only to that student and
   to the lecturer who owns their class section — never to peers.
5. **Reuse before build.** Use OR-Tools / scipy for optimization; do not hand-roll a solver.
6. **Separation of concerns.** Admin manages structure and data. Lecturer manages team
   formation process. AI recommends. Students provide Team DNA and may form teams.
   Each role has clear boundaries.

## Non-negotiable rules (hard constraints)

- A suggestion **never** violates a hard constraint (team size band, must-pair, cannot-pair,
  exactly-once assignment). Infeasibility is reported, never silently patched.
- **No protected/sensitive attribute** (gender, ethnicity, religion, health, and the like) is
  used as a matching signal unless a lawful, documented policy explicitly enables it.
- **No feature ships without authorization tests** for its protected paths (student data,
  formation ownership, admin operations).
- Formation runs are **reproducible and logged** (inputs + seed + result version).
- Student personal data is **never leaked across students** or returned by student-scoped APIs.
- **Admin does NOT decide team composition.** That authority belongs exclusively to the lecturer.
- **AI does NOT publish teams.** Only a lecturer can publish final team assignments.

## Governance

- Amendments proposed via ADR (`docs/adr/`); version bumped MAJOR/MINOR/PATCH.
- When objectives conflict, **fairness and privacy win over convenience or run speed**; record
  the trade-off in an ADR.
