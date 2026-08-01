# 004: Student Profile Intake

## Business Requirements
- **Profile Management**: Students can create/update their profile including name, major, years of experience, and a list of skills with proficiency levels (1-5).
- **Enrollment**: Students can enroll in a specific Cohort using the Cohort ID provided by their lecturer.
- **Formation Integration**: Lecturers fetch the real list of enrolled students (with their profiles) to feed into the AI Matching Engine, instead of using mock data.

## User Experience
- **Student View**: 
  - Submits the `ProfileForm` which saves data to the DB.
  - Sees a section to "Join a Cohort" by ID.
- **Lecturer View**:
  - In `FormationConsole`, the "Students (demo roster)" count input is removed.
  - Running the formation automatically fetches and uses the actual enrolled student profiles from the database.
