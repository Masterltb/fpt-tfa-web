# 006: Student Pairing Constraints

## Business Requirements
- **Constraint Submission**: Students can request to work with specific peers (`must_pair`) or avoid specific peers (`cannot_pair`).
- **Lecturer Approval**: Constraints are submitted in a "pending" state. Lecturers can review and mark them as "approved" or "rejected".
- **Algorithm Enforcement**: Only approved constraints are sent to the AI matching engine.

## User Experience
- **Student View**: After enrolling in a cohort, the profile page shows a "Team Preferences" section for that cohort. Students can type the peer's user ID and select the constraint type.
- **Lecturer View**: In the `FormationConsole`, there is a new section "Pending Constraints". Lecturers can click 👍 or 👎 on each request. The algorithm automatically picks up the approved constraints when running formation.
