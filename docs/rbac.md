# RBAC — Team Formation Assistant

Authorization is enforced server-side, per request, in the API/application layer.
`l1-rbac-audit` maps every protected operation to a scope here.

## Roles

| Role | Description |
|------|-------------|
| student | Owns their own profile and Team DNA; belongs to class sections and teams. |
| lecturer | Owns class sections; creates/manages grouping sessions; runs matching; reviews, adjusts, and publishes teams. |
| admin | Manages campuses, terms, courses, majors, class sections, users; imports rosters; views reports and audit logs. |

## Operation to scope map

### Admin operations

| Operation | Required role | Object-level check | Enforced in |
|-----------|---------------|-------------------|-------------|
| Manage campuses (CRUD) | admin | none | admin service |
| Manage terms (CRUD) | admin | none | admin service |
| Manage courses (CRUD) | admin | none | admin service |
| Manage majors (CRUD) | admin | none | admin service |
| Manage class sections (CRUD) | admin | none | admin service |
| Manage users (CRUD) | admin | none | admin service |
| Import student roster (CSV/Excel) | admin | none | admin service |
| View system dashboard stats | admin | none | admin service |
| View audit logs | admin | none | admin service |
| Configure grouping policies | admin | none | admin service |

### Lecturer operations

| Operation | Required role | Object-level check | Enforced in |
|-----------|---------------|-------------------|-------------|
| View own class sections | lecturer | owns the class section | class section service |
| View class roster | lecturer | owns the class section | class section service |
| Create grouping session | lecturer | owns the class section | grouping session service |
| Configure grouping session | lecturer | owns the class section | grouping session service |
| View student Team DNA readiness | lecturer | owns the class section | team dna service |
| View student Team DNA detail | lecturer | owns the class section | team dna service |
| Run matching | lecturer | owns the class section | formation service |
| View formation results | lecturer | owns the class section | formation service |
| Override team assignments | lecturer | owns the class section | formation service |
| Approve/Publish teams | lecturer | owns the class section | formation service |
| View class reports | lecturer | owns the class section | report service |
| Approve/reject student constraints | lecturer | owns the class section | constraint service |

### Student operations

| Operation | Required role | Object-level check | Enforced in |
|-----------|---------------|-------------------|-------------|
| View own profile | student | acting on own id only | profile service |
| Edit own profile | student | acting on own id only | profile service |
| View own class sections | student | enrolled in class | enrollment service |
| View/edit own Team DNA | student | own Team DNA only | team dna service |
| Create draft team | student | enrolled in class section | team service |
| Invite student to team | student | member of the team | team service |
| Submit join request | student | enrolled in class section | team service |
| Accept/decline invitation | student | invitation is to self | team service |
| Accept/decline join request | student | creator of the team | team service |
| Submit team for approval | student | creator of the team | team service |
| View own team (published) | student | member of the team | formation service |
| View recommendations | student | enrolled in class section | formation service |
| Propose must/cannot-pair constraint | student | involves self; lecturer approves | constraint service |

## Rules

- A **student** may read and write only their own profile, their own Team DNA entries,
  and read only the teams they are a member of. They may never read another student's
  profile/Team DNA or any full formation.
- A **lecturer** may run, view, and override formations **only for class sections they own**
  (object-level ownership check on every formation operation).
- An **admin** may manage system-wide configuration (campuses, terms, courses, users) but
  does NOT participate in team formation decisions. That authority belongs to lecturers.
- Object access is validated against the caller's identity/ownership on every request
  (guards against IDOR/BOLA), never trusting a client-supplied role or id.
- Privileged operations (override/commit, admin) require the elevated scope; roles are
  resolved server-side from the authenticated principal.
- Sensitive/protected attributes are never exposed across students and are never returned by
  student-scoped endpoints.
