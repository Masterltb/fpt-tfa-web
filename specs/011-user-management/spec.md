# Feature Spec: User Management (Admin)

## Summary
Admin manages user accounts across the three roles (student, lecturer, admin).
Includes user CRUD, role assignment, status management, and dashboard stats.

## Requirements

### User CRUD
- [ ] FR-UM-01: Admin can create a user (email, name, role, campus)
- [ ] FR-UM-02: Admin can list users (filter by role, campus, status)
- [ ] FR-UM-03: Admin can update user details
- [ ] FR-UM-04: Admin can activate/deactivate a user (soft disable)
- [ ] FR-UM-05: Admin can change a user's role

### Student-specific
- [ ] FR-UM-06: Admin can set a student's major and student code
- [ ] FR-UM-07: Admin can view a student's enrollment history

### Lecturer-specific
- [ ] FR-UM-08: Admin can view a lecturer's assigned class sections

### Dashboard
- [ ] FR-UM-09: Admin dashboard shows total users by role
- [ ] FR-UM-10: Admin dashboard shows active vs inactive users
- [ ] FR-UM-11: Admin dashboard shows recent user registrations

## Security
- [ ] SC-UM-01: All endpoints require admin role
- [ ] SC-UM-02: Email uniqueness enforced
- [ ] SC-UM-03: Admin cannot delete themselves

## UI / Components
- User list with DataTable (search, filter by role/status)
- User detail/edit form
- Role badge component
- Status toggle switch

## Verification Plan
- API tests for CRUD operations
- Role enforcement tests (non-admin → 403)
- Email uniqueness validation test
- Dashboard stats accuracy test
