# Domain — Team Formation Assistant

## FPT Academic Structure

```
Campus (HCM, HN, DN, CT)
  └── Term (Fall 2026, Spring 2027)
       └── Course (PRN232, SWP391)
            └── ClassSection (SE18xx) ← owned by a Lecturer
                 ├── Students (enrolled)
                 │    └── TeamDNA (per student per class)
                 └── GroupingSession (one round of team formation)
                      ├── Configuration (mode, size, roles, skills, weights)
                      ├── DraftTeams (student-created)
                      └── Formation (AI-generated)
                           └── Teams (published result)
```

## Glossary

| Term | Meaning |
|------|---------|
| Campus | An FPT University campus (HCM, HN, DN, CT). |
| Major | The student's field of study / program (SE, IA, AI). |
| Term | An academic term within a campus (Fall 2026). |
| Course | A course offered by FPT (PRN232). |
| ClassSection | One section of a course in a term, owned by a lecturer. Replaces old "Cohort". |
| Student | A person to be placed into a team; owns a profile. |
| Team DNA | A student's team formation profile for a specific class section: skills, roles, experience, availability, interests, commitment, working preferences. Branded concept. |
| Skill | A named competency with a proficiency level (1-5: beginner..expert). |
| Experience | Prior project experience (projects, internships), weighted into balance. |
| Availability | The time slots a student is free (used for schedule overlap). |
| Preferred Role | The role a student wants in the team. Free-form, configured per course/project. |
| Interest | Topics or project types a student is interested in. |
| Commitment Level | How much time/effort a student is willing to invest (low, medium, high). |
| Working Preference | Communication style, meeting frequency, work style preferences. |
| GroupingSession | One round of team formation within a class section. Has a mode, configuration, deadline, and lifecycle. |
| GroupingMode | How teams are formed: Lecturer-led, Student-led, or Hybrid. |
| DraftTeam | A team created by a student (in Student-led or Hybrid mode). |
| TeamInvitation | An invitation from a team to a student to join. |
| JoinRequest | A request from a student to join a team. |
| Constraint | A rule on formation. **Hard** (must hold) or **soft** (maximize if possible). |
| Team | A set of students assigned together, with a balance score and rationale. |
| Formation | One versioned run: the full set of teams for a session + scores + rationale. |
| Balance score | How well competency, experience, roles, and schedule are distributed. |
| Enrollment | Links a student to a class section. |

## Core entities and invariants

- **Campus** — top-level organizational unit. All terms belong to a campus.
- **ClassSection** — the unit where a lecturer teaches students. Replaces old "Cohort".
  Owns grouping sessions and student enrollments. Object-level authz anchor (BR-13).
- **Student** — has basic identity. Team DNA is per-class-section (one student can have
  different DNA entries for different classes).
- **TeamDNA** — the branded profile for team formation. Includes skills, roles, experience,
  availability, interests, commitment, and working preferences. Has a completion percentage.
- **GroupingSession** — one round of team formation. Configured with mode, team size band,
  required roles/skills, soft constraint weights, and a deadline.
- **Constraint**
  - *Hard*: team size within the session's size band; must-pair (two students together);
    cannot-pair (two students apart); required-skill coverage per team.
  - *Soft*: skill coverage, experience balance, role match, schedule overlap,
    commitment compatibility, interest similarity, major diversity, working preference compatibility.
- **Team** — size within the band; satisfies every hard constraint; carries a rationale.
- **Formation** — every eligible student is assigned to exactly one team, or explicitly
  flagged as unassignable with a reason. Immutable once committed; a new run is a new version.

## Business rules (testable)

- **R1** Team size stays within the session's `[min, max]` band. (hard)
- **R2** No suggestion violates a must-pair or cannot-pair constraint. (hard)
- **R3** Each team covers the session's required skills/roles when the section makes it feasible;
  otherwise the gap is reported, not hidden. (hard-report)
- **R4** Competency and experience are spread across teams (no team is all-expert or all-novice)
  as far as hard constraints allow. (soft, maximized)
- **R5** Team members share at least the session's minimum common availability. (soft, maximized)
- **R6** Soft preferences are maximized but may be traded off; every trade-off is explained. (soft)
- **R7** Every student is assigned exactly once, or flagged unassignable with a reason. (hard)
- **R8** A run is reproducible: same inputs + same seed produce the same formation. (hard)
- **R9** A student belongs to at most one team per grouping session. (hard)
- **R10** In Hybrid mode, student-created teams are preserved where valid; AI fills remaining students. (soft)

## Session lifecycle

```
DRAFT → OPEN → MATCHING → REVIEW → PUBLISHED
```

1. **DRAFT**: Lecturer creates and configures the session.
2. **OPEN**: Students complete Team DNA and (in Student-led/Hybrid) create/join teams. Deadline is active.
3. **MATCHING**: AI runs the matching engine. In Lecturer-led: generates all teams. In Hybrid: fills gaps.
4. **REVIEW**: Lecturer reviews suggested teams, adjusts (drag-drop), resolves warnings.
5. **PUBLISHED**: Teams are finalized and students are notified.

## Out of scope (v1)

- Cross-class formation, live re-balancing after teams start, and peer-review scoring.
- Direct FAP integration (reserved for Phase 3 roadmap).
- Auto-fetch grades or real schedules from external systems.
