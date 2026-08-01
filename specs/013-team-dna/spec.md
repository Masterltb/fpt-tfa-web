# Feature Spec: Team DNA (Student)

## Summary
Team DNA is the branded student profile for team formation. Each student completes a
multi-step wizard to build their Team DNA for a specific class section. The system tracks
completion percentage and displays readiness to both students and lecturers.

## Requirements

### Team DNA Wizard
- [ ] FR-TD-01: Student can access Team DNA for each enrolled class section
- [ ] FR-TD-02: Wizard has 7 steps: Skills → Roles → Experience → Schedule → Interests → Commitment → Working Preferences
- [ ] FR-TD-03: Each step can be saved independently (no need to complete all at once)
- [ ] FR-TD-04: Student can navigate between steps freely (non-linear)
- [ ] FR-TD-05: Auto-save on field change (debounced)

### Skills & Proficiency
- [ ] FR-TD-06: Student adds skills with proficiency level (1-5 scale with labels)
- [ ] FR-TD-07: Skill suggestions based on course (configurable by admin/lecturer)
- [ ] FR-TD-08: Custom skill entry allowed
- [ ] FR-TD-09: At least 1 skill required for completion

### Preferred Roles
- [ ] FR-TD-10: Student selects preferred roles from a list (ordered by preference)
- [ ] FR-TD-11: Default role suggestions provided (leader, coordinator, researcher, etc.)
- [ ] FR-TD-12: Custom role entry allowed

### Project Experience
- [ ] FR-TD-13: Student adds past project experiences (name, role, description, duration)
- [ ] FR-TD-14: Summary experience_years is computed or manually set

### Available Schedule
- [ ] FR-TD-15: Visual weekly calendar grid (7 days × 3 time slots)
- [ ] FR-TD-16: Student toggles available slots by clicking
- [ ] FR-TD-17: At least 3 available slots recommended (warning if fewer)

### Interests
- [ ] FR-TD-18: Student selects from predefined interest tags
- [ ] FR-TD-19: Custom interest entry allowed
- [ ] FR-TD-20: Tags displayed as chips/badges

### Commitment Level
- [ ] FR-TD-21: Student selects commitment level (Low / Medium / High)
- [ ] FR-TD-22: Each level has a clear description

### Working Preferences
- [ ] FR-TD-23: Student sets preferences for communication, meeting frequency, work style, etc.
- [ ] FR-TD-24: Each preference is a dropdown with clear options

### Completion Tracking
- [ ] FR-TD-25: System calculates completion percentage (weighted by section)
- [ ] FR-TD-26: Progress bar shown at top of wizard
- [ ] FR-TD-27: Incomplete sections highlighted in the step navigation

## Security
- [ ] SC-TD-01: Student can only view/edit their own Team DNA
- [ ] SC-TD-02: Lecturer can view (read-only) Team DNA of students in their class
- [ ] SC-TD-03: Students cannot see other students' Team DNA

## UI / Components
- Multi-step wizard with sidebar step navigation
- SkillInput component (name + proficiency slider)
- ScheduleGrid component (weekly calendar with toggleable slots)
- RolePicker component (ordered multi-select with drag reorder)
- InterestTags component (chip/badge selector)
- CompletionProgressBar component
- CommitmentLevelSelector component

## Verification Plan
- Unit test: completion percentage calculation
- Unit test: skill proficiency validation (1-5 range)
- API test: save and retrieve Team DNA
- API test: student A cannot access student B's Team DNA → 403
- API test: lecturer can read Team DNA of their class students
- E2E test: Student completes full wizard → 100% completion
