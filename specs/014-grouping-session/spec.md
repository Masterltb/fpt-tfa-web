# Feature Spec: Grouping Session (Lecturer)

## Summary
A grouping session is one round of team formation within a class section. The lecturer
creates a session, configures team requirements, selects a grouping mode, and manages
the entire lifecycle from opening through matching to publishing.

## Requirements

### Session Creation
- [ ] FR-GS-01: Lecturer can create a grouping session for their class section
- [ ] FR-GS-02: Session has a name, mode, team size band, deadline
- [ ] FR-GS-03: Three modes: Lecturer-led, Student-led, Hybrid
- [ ] FR-GS-04: Default mode is Hybrid

### Configuration
- [ ] FR-GS-05: Lecturer sets team_min_size and team_max_size
- [ ] FR-GS-06: Lecturer sets required roles (e.g. Backend Developer, Frontend Developer)
- [ ] FR-GS-07: Lecturer sets required skills (e.g. Java, React)
- [ ] FR-GS-08: Lecturer can optionally require major diversity
- [ ] FR-GS-09: Lecturer can adjust soft constraint weights (sliders)
- [ ] FR-GS-10: Lecturer sets a deadline for student submissions

### Student Readiness
- [ ] FR-GS-11: Lecturer can view Team DNA completion stats for their class
- [ ] FR-GS-12: Dashboard shows: total students, profiles completed, percentage ready
- [ ] FR-GS-13: Lecturer can send reminder to students with incomplete Team DNA
- [ ] FR-GS-14: Minimum readiness threshold before matching is recommended (warning, not blocking)

### Lifecycle Management
- [ ] FR-GS-15: Session transitions: DRAFT → OPEN → MATCHING → REVIEW → PUBLISHED
- [ ] FR-GS-16: Lecturer can open a session (DRAFT → OPEN)
- [ ] FR-GS-17: Lecturer can trigger matching (OPEN → MATCHING)
- [ ] FR-GS-18: Matching completes and moves to REVIEW
- [ ] FR-GS-19: Lecturer can re-run matching (REVIEW → MATCHING)
- [ ] FR-GS-20: Lecturer can publish (REVIEW → PUBLISHED)
- [ ] FR-GS-21: Published sessions cannot be modified (final)

### Multiple Sessions
- [ ] FR-GS-22: A class section can have multiple grouping sessions
- [ ] FR-GS-23: Each session is independent (different configs, different teams)

## Security
- [ ] SC-GS-01: Only the lecturer who owns the class section can manage sessions
- [ ] SC-GS-02: Other lecturers → 403
- [ ] SC-GS-03: Students can view session info (mode, deadline) but not configure

## UI / Components
- Session list within class view
- Session creation form (mode selector, size inputs, role/skill configurator)
- Weight adjustment sliders with tooltips
- Student readiness dashboard (progress bars, completion table)
- Lifecycle status badge and transition buttons
- Session detail page with tabs (Config, Students, Teams)

## Verification Plan
- Unit test: session lifecycle state machine (valid/invalid transitions)
- Unit test: weight normalization
- API test: create session → 200
- API test: non-owner lecturer → 403
- API test: student → 403 on configuration endpoints
- API test: invalid lifecycle transition → 409
- E2E test: Lecturer creates session → opens → runs matching → reviews → publishes
