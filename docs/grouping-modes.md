# Grouping Modes — Team Formation Assistant

## Overview

TFA supports three grouping modes. Each mode defines who initiates team formation,
when AI steps in, and how the lecturer reviews/publishes the result.

All three modes end the same way: **the lecturer reviews, adjusts, and publishes**.
AI never auto-publishes.

---

## 1. Lecturer-led Mode

**Use case**: The lecturer wants full control. Students provide their Team DNA,
and the AI forms all teams based on the lecturer's configuration.

### Flow

```
1. Lecturer creates grouping session (mode: lecturer_led)
2. Lecturer configures: team size, required roles, required skills, weights
3. Session opens → Students complete Team DNA
4. Deadline passes (or lecturer triggers manually)
5. Lecturer clicks "Run Matching"
6. AI generates ALL teams with rationale
7. Lecturer reviews suggested teams
8. Lecturer adjusts (drag-drop students, swap, lock teams)
9. Lecturer approves and publishes
10. Students receive official team assignments
```

### Key characteristics
- Students do NOT create teams themselves
- AI generates the entire formation
- Lecturer has full review and override power
- Best for: large classes, strict requirements, first-time courses

---

## 2. Student-led Mode

**Use case**: Students have freedom to form their own teams. The lecturer only
reviews and approves submitted teams.

### Flow

```
1. Lecturer creates grouping session (mode: student_led)
2. Lecturer configures: team size limits, required roles (optional)
3. Session opens → Students complete Team DNA
4. Students create draft teams
5. Students invite members OR apply to join existing teams
6. Members accept/decline invitations
7. Teams submit for approval when complete
8. Deadline passes
9. Lecturer reviews submitted teams
10. Lecturer can merge incomplete teams or assign ungrouped students
11. Lecturer approves and publishes
12. Students receive official team assignments
```

### Key characteristics
- Students drive team formation
- AI is NOT used for initial matching (but can suggest to ungrouped students)
- Lecturer reviews for balance and completeness
- Risk: some students may be left out → lecturer or AI must handle remainders
- Best for: smaller classes, students who know each other, flexible projects

---

## 3. Hybrid Mode ⭐ (Flagship)

**Use case**: Students have freedom to start forming teams, but AI fills the gaps
to ensure no one is left behind. This is the **recommended default** mode.

### Flow

```
1. Lecturer creates grouping session (mode: hybrid)
2. Lecturer configures: team size, required roles, skills, weights, deadline
3. Session opens → Students complete Team DNA
4. Students create draft teams and invite members
5. Some students remain ungrouped
6. Deadline passes
7. System detects:
   - Complete teams (valid size) → preserved as-is
   - Partial teams (below min size) → AI fills remaining slots
   - Ungrouped students → AI assigns to teams
8. AI generates recommendations for partial/ungrouped students
9. Lecturer reviews ALL teams (student-formed + AI-completed)
10. Lecturer adjusts (drag-drop, merge, split)
11. Lecturer approves and publishes
12. Students receive official team assignments
```

### Key characteristics
- **Best of both worlds**: student choice + AI safety net
- Students who find teammates can stay together
- Students who don't find a team are matched by AI
- AI respects student-formed teams and only fills gaps
- Lecturer sees both student-formed and AI-completed teams
- Best for: most classes — gives autonomy while preventing anyone from being left out

### Why Hybrid is the flagship mode

> "No student left behind" — even if a student doesn't know anyone in the class,
> the AI will match them into a compatible team with a clear explanation of why.

This solves the core problem: friendship-based team formation leaves out students
who are less connected, which is unfair and leads to unbalanced teams.

---

## Comparison

| Aspect | Lecturer-led | Student-led | Hybrid |
|--------|-------------|-------------|--------|
| Who initiates teams | AI | Students | Students + AI |
| AI involvement | Full | None (except remainders) | Partial (fills gaps) |
| Student choice | None | Full | Partial |
| Risk of ungrouped students | None | High | None |
| Lecturer effort | Review only | Review + fix | Review only |
| Best for | Large/strict classes | Small/flexible classes | Most classes |

---

## Session Lifecycle

All three modes follow the same lifecycle, but different states are emphasized:

```
DRAFT → OPEN → MATCHING → REVIEW → PUBLISHED
```

| State | Lecturer-led | Student-led | Hybrid |
|-------|-------------|-------------|--------|
| DRAFT | Configure | Configure | Configure |
| OPEN | Students fill DNA | Students fill DNA + form teams | Students fill DNA + form teams |
| MATCHING | AI generates all teams | (skipped or AI handles remainders) | AI fills gaps |
| REVIEW | Lecturer reviews AI teams | Lecturer reviews student teams | Lecturer reviews all teams |
| PUBLISHED | Final | Final | Final |

---

## Configuration Options

When creating a grouping session, the lecturer configures:

| Setting | Description | Default |
|---------|-------------|---------|
| `mode` | Grouping mode | `hybrid` |
| `team_min_size` | Minimum team size | 3 |
| `team_max_size` | Maximum team size | 5 |
| `required_roles` | Roles every team must have | [] |
| `required_skills` | Skills every team must cover | [] |
| `required_majors` | Majors for diversity | [] |
| `deadline` | When team formation closes | None |
| `weights` | Soft constraint weights | Default weights |

### Default Soft Constraint Weights

| Constraint | Weight | Description |
|-----------|--------|-------------|
| Skill coverage | 0.25 | Does the team cover required/diverse skills? |
| Experience balance | 0.15 | Is experience spread evenly? |
| Role match | 0.15 | Do members get preferred roles? |
| Schedule overlap | 0.15 | How many common free slots? |
| Commitment compatibility | 0.10 | Are commitment levels compatible? |
| Interest similarity | 0.10 | Do members share interests? |
| Major diversity | 0.05 | Different majors in a team? |
| Working preference compatibility | 0.05 | Do work styles align? |

Lecturers can adjust these weights to prioritize different aspects.
