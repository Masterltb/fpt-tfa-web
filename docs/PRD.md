# Team Formation Assistant (TFA) — Product Requirements Document (PRD)

**Version:** MVP 1.0  
**Date:** 02/08/2026  
**Status:** Approved Specification  
**Product Type:** Web platform for university team formation and team-health management  
**Initial Market:** FPT University; designed to scale to multi-campus, multi-major universities  
**Deployment Approach:** Standalone MVP using CSV/Excel import; integration-ready for FAP/LMS later.

---

## 1. Product Vision

Team Formation Assistant helps universities form project teams more fairly and effectively.

Instead of relying on friendships, group chats, or manual Excel assignment, TFA uses student profiles, course rules, and group requirements to:

- Help students find suitable teammates.
- Help lecturers form balanced teams quickly.
- Support groups that need additional or replacement members.
- Detect team risks early.
- Help lecturers intervene before a group fails.

> TFA does not replace lecturer or student decisions. It provides transparent recommendations and workflow control.

---

## 2. Problem Statement

### Student Problems
- Difficulty finding a group before deadlines.
- Students with fewer social connections are often left behind.
- Groups may lack essential roles such as technical, design, research, or presentation.
- Workload and commitment are often uneven.
- Students do not know whether a group is truly suitable before joining.

### Lecturer Problems
- Manual grouping takes time.
- It is hard to balance skill, major, role, schedule, and team size at the same time.
- It is difficult to track groups that are inactive, conflicted, or lacking members.
- It is difficult to explain why one student was placed in a particular group.

### University Problems
- Project-based learning quality depends heavily on teamwork.
- There is little structured data on why teams succeed or fail.
- Existing academic systems manage enrollment, but not team matching and team health.

---

## 3. Product Goals & Success Metrics

### Primary Goals
- Reduce time spent by lecturers on group formation.
- Ensure every eligible student has a path to join a group.
- Support both same-major and interdisciplinary teams.
- Make group formation transparent and explainable.
- Detect team imbalance early and support fair adjustment.

### Success Metrics (Pilot KPIs)
- Reduce lecturer group-formation time by at least 50%.
- At least 80% student satisfaction with group formation.
- At least 90% groups satisfy minimum size and required roles before publication.
- Less than 20% of suggested groups require lecturer manual changes.
- Reduce ungrouped students near deadline.
- Track how many red-risk groups receive intervention before the project ends.

---

## 4. Scope

### In Scope
- Multi-campus, multi-major academic structure.
- Admin, Lecturer, and Student roles.
- Class/project roster import through CSV or Excel.
- Lecturer-controlled group requirements.
- Lecturer-led, student-led, and hybrid grouping modes.
- Matching and explainable recommendations.
- Group invitation and join-request workflow.
- Group vacancy and replacement workflow (Smart Rebalance).
- Team health check-ins and risk alerts.
- Audit history and basic reporting.

### Out of Scope for MVP
- Direct FAP integration.
- Automatic grading.
- Full project management features such as task boards.
- Internal chat/video calls.
- Automatic removal of a student from a group.
- Predicting academic performance or grading students based on team-health data.
- Using sensitive personal data for matching.

---

## 5. Multi-Major Support Requirement

TFA must support team formation for students across multiple majors, classes, programs, and campuses.

The system must allow:
- Admin to configure campuses, programs, majors, academic years, and terms.
- Lecturers to select one or more majors eligible for each Grouping Space.
- Lecturers to decide whether a space is same-major or interdisciplinary.
- Lecturers to set minimum/maximum representation of a major in each group.
- The matching engine to validate major rules before recommending or publishing a group.
- Students to view and join only groups for which their major, class, and course eligibility are valid.

> **Business rule:** TFA never assumes that interdisciplinary teams are always better. Same-major versus interdisciplinary composition is configured by the lecturer for each course, project, or thesis.

---

## 6. User Roles and Permissions

| Role | Main Responsibilities |
|---|---|
| System / University Admin | Configures academic data, manages users, roles, imports, policies, and reports |
| Lecturer | Creates and manages grouping spaces, sets requirements, reviews, and publishes groups |
| Student | Maintains profile, searches for teams, joins/invites members, and submits team check-ins |

---

## 7. Academic and Organizational Model

```text
Campus
  └── Academic Year
        └── Term
              └── Program / Major
                    └── Course Offering / Project Space (Grouping Space)
                          └── Eligible Students
                                └── Groups
```

---

## 8. Grouping Space Configuration & Constraints

### 8.1 Hard and Soft Constraints

| Constraint | Type | Meaning |
|---|---|---|
| Group Size | Hard | Must contain between min and max members |
| Required Majors | Hard / Soft | Minimum/maximum representation per major |
| Required Roles | Hard | Specific roles that must be filled (e.g. Backend, UI/UX, Presenter) |
| Required Skills | Soft | Skills needed in the team |
| Role Limits | Soft | Max count for specific roles |
| Diversity Rule | Soft | Max count from the same major |
| Schedule Rule | Soft | At least one common meeting slot per week |
| Commitment Rule | Soft | Prefer compatible commitment levels |

---

## 9. Team DNA Profile & Privacy

### Information Included
- Identity: Full Name, Student ID, Campus, Major.
- Competencies: Skills & Proficiency (1-5), Preferred Roles, Project Experiences.
- Availability: Weekly availability grid (15-min slots).
- Preferences: Commitment level (Low, Medium, High), Work style, Portfolio link, Interests.

### Privacy Rules
- GPA, gender, religion, health, financial status, and private contact info are **excluded by default**.
- Roster-level details visible only to assigned lecturers.
- Public profile shown to peers is anonymized/trimmed (no private email or phone).

---

## 10. Group Formation Modes

1. **Lecturer-Led Grouping**: Lecturer sets rules -> AI matches -> Lecturer reviews & publishes.
2. **Student-Led Grouping**: Students form teams, send invites/applications -> Lecturer reviews & approves.
3. **Hybrid Grouping (Flagship)**: Students self-form until deadline -> AI fills remaining gaps & unassigned students -> Lecturer reviews & publishes.

---

## 11. Matching and Recommendation Engine

- **Explainable Matching**: Every recommendation contains human-readable rationale.
- **Scoring Components**: Skill coverage, Role coverage, Major composition, Schedule compatibility, Commitment balance, Experience balance, Student preferences.

---

## 12. Team Health Score & Smart Rebalance

### 12.1 Weekly Check-ins
Students submit a weekly check-in covering:
- Role/task currently handled.
- Workload status (Low, Balanced, Overloaded).
- Team collaboration quality rating.
- Blocked status / support needed.
- Optional lecturer support request.

### 12.2 Risk Indicators & Status
- **Green**: Healthy team.
- **Yellow**: Group needs attention (e.g. slight workload imbalance).
- **Red**: Group requires lecturer review (e.g. missing check-ins, member left, severe conflict).

### 12.3 Smart Rebalance
When a group loses a member, lacks a required role, or hits red-risk:
1. Rebalance request opened.
2. Missing role/skill selected.
3. System ranks eligible ungrouped/looking-for-group candidates.
4. Invitations/applications handled.
5. Lecturer approves and updates composition.

---

## 13. Status Models

### Grouping Space Status
`Draft` -> `Open` -> `Frozen` -> `Matching` -> `Review` -> `Published` -> `Closed` / `Archived` (or `Cancelled`)

### Group Status
`Draft` / `Forming` -> `Incomplete` -> `Valid` -> `Pending Approval` / `Submitted` -> `Approved` -> `Published` -> `At Risk` -> `Closed` / `Dissolved`

### Membership Status
`Invited`, `Applied`, `Active`, `Leave Requested`, `Removal Requested`, `Withdrawn`, `Removed`, `Rejected`

---

## 14. Delivery Roadmap

| Phase | Scope |
|---|---|
| P0 — MVP Foundation | Authentication, roles, academic structure, CSV import, grouping spaces, Team DNA |
| P1 — Team Formation | Lecturer grouping, self-grouping, hybrid mode, invitations, join requests, matching explanation |
| P2 — Team Health | Weekly check-ins, group-health status, risk alerts, lecturer intervention |
| P3 — Smart Rebalance | Vacancies, replacement recommendations, membership-change workflow |
| P4 — Integration & Scale | FAP/LMS integration, SSO, advanced analytics, multi-campus rollout |
