# Tasks — 007 UI Redesign

### Phase 1: Design System Foundation [x]
- [x] Extend `styles.css` with design tokens from `UI-demo/src/styles/theme.css`
- [x] Add lucide-react to `web/package.json`
- [x] Create `web/src/components/Shell.tsx` — shared header + sidebar layout (student & lecturer modes)
- [x] Create `web/src/components/ui/` — Avatar, Badge, ProgressBar, StatCard primitives

### Phase 2: Student Screens [x]
- [x] StudentDashboard
- [x] StudentProfile (replaces ProfileForm.tsx)
- [x] StudentSkills
- [x] StudentAvailability
- [x] StudentPreferences (replaces StudentConstraints.tsx)
- [x] StudentReview
- [x] StudentTeam

### Phase 3: Lecturer Screens [x]
- [x] LecturerDashboard (replaces Dashboard.tsx)
- [x] LecturerCohorts
- [x] CohortWorkspace (replaces FormationConsole.tsx)
- [x] FormationBoard (drag-and-drop team builder)

### Phase 4: Router & Integration [x]
- [x] Update `App.tsx` to use new Shell + role-based routing
- [x] Wire all API calls from `api.ts` into new screens
- [x] Remove legacy components (old ProfileForm, Dashboard, FormationConsole)
