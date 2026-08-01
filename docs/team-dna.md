# Team DNA — Team Formation Assistant

## What is Team DNA?

**Team DNA** is the branded concept for a student's team formation profile. It captures
everything the matching engine needs to place a student into a balanced, compatible team.

Unlike a generic "profile", Team DNA is **per class section** — a student can have different
Team DNA entries for different classes, reflecting that they might want different roles
or prioritize different skills depending on the course.

## Why "Team DNA"?

The name gives the product a distinct identity:
- It communicates that this is about **who you are as a teammate**, not just a resume.
- It implies that each person brings unique characteristics that make teams work.
- It's memorable and differentiates TFA from generic group-making tools.

## Team DNA Fields

### 1. Skills & Proficiency (20% of completion)
Each skill has a name and a proficiency level (1-5):

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Beginner | Basic understanding, limited practice |
| 2 | Elementary | Can work with guidance |
| 3 | Intermediate | Can work independently |
| 4 | Advanced | Can lead and teach others |
| 5 | Expert | Deep expertise, can architect solutions |

Example:
```
Backend Development: 3 (Intermediate)
Database Design: 4 (Advanced)
UI/UX Design: 1 (Beginner)
Presentation: 2 (Elementary)
```

### 2. Preferred Roles (15% of completion)
Ordered list of roles the student wants to play. Free-form strings, with default suggestions:
- Leader
- Coordinator
- Researcher
- Presenter
- Developer (Backend/Frontend/Fullstack)
- Designer
- Tester
- Other

Lecturers can configure custom role vocabularies per grouping session.

### 3. Project Experience (15% of completion)
List of past project experiences:
- Project name
- Role played
- Brief description
- Duration (months)

Plus a summary `experience_years` value used for balance scoring.

### 4. Available Schedule (15% of completion)
Weekly time slots when the student is free for team meetings:
- Monday morning / afternoon / evening
- Tuesday morning / afternoon / evening
- ... (7 days × 3 slots = 21 possible slots)

Used by the matching engine to maximize schedule overlap within teams.

### 5. Interests (10% of completion)
Topics or project types the student is interested in:
- Web Development
- Mobile App
- AI/ML
- IoT
- Game Development
- Data Analysis
- etc.

Used as a soft constraint to group students with similar interests.

### 6. Commitment Level (10% of completion)
How much time/effort the student is willing to invest:
- **Low**: Minimal participation, has other commitments
- **Medium**: Standard involvement
- **High**: Fully committed, willing to take on extra work

Used to avoid grouping high-commitment students with low-commitment ones.

### 7. Working Preferences (15% of completion)
Key-value pairs describing how the student likes to work:

| Key | Options |
|-----|---------|
| `communication` | online, offline, hybrid |
| `meeting_frequency` | daily, twice_weekly, weekly, biweekly |
| `work_style` | structured, flexible, mixed |
| `conflict_resolution` | discuss, vote, leader_decides |
| `documentation` | detailed, minimal, moderate |

## Completion Percentage

Team DNA completion is calculated as a weighted sum:

| Section | Weight | Complete when |
|---------|--------|---------------|
| Skills | 20% | At least 1 skill added |
| Preferred Roles | 15% | At least 1 role selected |
| Experience | 15% | At least 1 experience OR experience_years > 0 |
| Availability | 15% | At least 1 time slot selected |
| Interests | 10% | At least 1 interest selected |
| Commitment | 10% | Explicitly set (not left as default) |
| Working Preferences | 15% | At least 1 preference set |

A student's dashboard shows their completion percentage. Lecturers can see
how many students in their class have completed their Team DNA (student readiness).

## Team DNA in the Matching Engine

The matching engine converts Team DNA into signals for soft constraint scoring:

1. **Skill coverage** → Does the team cover all required skills?
2. **Experience balance** → Is experience spread evenly across teams?
3. **Role match** → Does each member get a role close to their preference?
4. **Schedule overlap** → How many common free slots does the team share?
5. **Commitment compatibility** → Are commitment levels compatible?
6. **Interest similarity** → Do members share project interests?
7. **Major diversity** → Does the team have members from different majors?
8. **Working preference compatibility** → Do communication/work styles align?
