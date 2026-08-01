# TEAM FORMATION ASSISTANT (TFA)
**Full REST API Specification for MVP**

- Document version: 1.0.0
- Date: 01/08/2026
- Base path: `/api/v1`
- Product scope: Standalone web platform for FPT students, lecturers and administrators
- Integration scope: No direct FAP integration in MVP; future-ready only

---

## 1. Document Purpose
Tài liệu này là hợp đồng API hoàn chỉnh cho MVP của Team Formation Assistant. Hệ thống mô phỏng cấu trúc học tập của Đại học FPT gồm Campus, Term, Course, Class Section, Lecturer và Student Roster nhưng hoạt động độc lập. Dữ liệu được tạo thủ công hoặc import CSV/XLSX. Mục tiêu chính là hỗ trợ tạo nhóm cân bằng dựa trên kỹ năng, ngành học, kinh nghiệm, lịch rảnh, sở thích, mức độ cam kết và vai trò mong muốn.

---

## 2. MVP Scope and Non-goals

### 2.1 In Scope
- JWT authentication, refresh token and role-based authorization.
- Quản lý Campus, Term, Major, Course, Class Section và roster.
- Import user và roster bằng CSV/XLSX.
- Team DNA profile: skills, preferred roles, experience, interests, work style and commitment.
- Weekly availability và lịch học mô phỏng của class section.
- Student-led, Lecturer-led và Hybrid team formation.
- Invitation, join request, draft team, submit, lecturer review, approval and publication.
- Matching runs, explainable recommendations, locked teams and manual override.
- Notifications, basic dashboards, exports and audit logs.

### 2.2 Explicit Non-goals
- Không đăng nhập bằng FAP hoặc crawl dữ liệu FAP trong MVP.
- Không quản lý điểm, điểm danh, lịch thi hoặc học phí.
- Không thay thế LMS/FAP và không quản lý toàn bộ vòng đời môn học.
- Không dùng dữ liệu nhạy cảm như giới tính, tôn giáo, sức khỏe hoặc tài chính để matching.
- Không để AI tự publish nhóm; giảng viên là người phê duyệt cuối cùng.
- Không xây chat, video call, task board hoặc peer grading trong MVP.

---

## 3. Academic Domain Model
```
Campus → Term → Course → Class Section → Enrollment
                                  ├→ Timetable
                                  └→ Grouping Session → Teams → Members
```
Mỗi Grouping Session thuộc đúng một Class Section. Một sinh viên chỉ được có tối đa một team active/published trong cùng session. Session có thể sử dụng `STUDENT_LED`, `LECTURER_LED` hoặc `HYBRID`.

---

## 4. Architecture and Implementation Assumptions
- REST over HTTPS, JSON UTF-8, base path `/api/v1`.
- IDs là opaque string/UUID; client không được suy luận ý nghĩa từ ID.
- Timestamps dùng ISO 8601 UTC; UI chuyển sang Asia/Bangkok khi hiển thị.
- Access token mặc định 15 phút; refresh token mặc định 7 ngày, đều cấu hình được.
- PostgreSQL là database chính; object storage dùng cho file import nếu cần.
- Matching có thể chạy qua worker nhưng contract trả `202 Accepted` và trạng thái `MatchRun`.
- Frontend không gọi Matching Engine trực tiếp; mọi thao tác đi qua Backend API.
- Mọi thay đổi nhạy cảm được ghi Audit Log.

---

## 5. API Conventions

### 5.1 Headers
| Header | Required | Description |
|---|---:|---|
| Authorization | Yes for protected endpoints | Bearer access token. |
| Content-Type | For body | `application/json`; file upload uses `multipart/form-data`. |
| Accept-Language | No | `vi-VN` or `en-US`; default `vi-VN`. |
| X-Correlation-Id | No | Client-provided trace ID; server creates one if absent. |
| Idempotency-Key | Recommended | Required for publish, import, match-run creation and selected actions. |
| If-Match | Recommended | Optimistic concurrency using resource version/ETag. |

### 5.2 Success Envelope
```json
{
  "data": {
    "id": "..."
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 125
  },
  "traceId": "trc_01J..."
}
```

### 5.3 Pagination, Filter and Sort
- `page` starts at 1; default 1.
- `pageSize` default 20, maximum 100.
- `q` performs normalized text search where supported.
- `sort` accepts comma-separated fields, prefix `-` for descending, e.g. `-createdAt,name`.
- Filters use explicit query names such as `status`, `termId`, `sectionId`, `role`.

### 5.4 Error Format (RFC 7807)
```json
{
  "type": "https://tfa.example/errors/team-size-violation",
  "title": "Business rule violation",
  "status": 422,
  "code": "TEAM_SIZE_VIOLATION",
  "detail": "Team must contain between 4 and 5 members.",
  "instance": "/api/v1/teams/team_01J.../submit",
  "traceId": "trc_01J...",
  "errors": [
    {
      "field": "members",
      "message": "Current size is 3.",
      "code": "MIN_SIZE"
    }
  ]
}
```

### 5.5 Status Code Policy
| Code | Meaning |
|---:|---|
| 200 | Successful read/update/action with response body. |
| 201 | Resource created. |
| 202 | Accepted for import or matching job. |
| 204 | Successful action without body. |
| 400 | Malformed request, invalid JSON or invalid parameter type. |
| 401 | Missing/expired/invalid authentication. |
| 403 | Authenticated but not permitted. |
| 404 | Resource does not exist or is hidden by authorization. |
| 409 | State conflict, duplicate, stale version or concurrent update. |
| 413 | Uploaded file exceeds limit. |
| 415 | Unsupported media type. |
| 422 | Business validation failed. |
| 429 | Rate limit exceeded. |
| 500 | Unexpected server error; never expose stack trace. |
| 503 | Service temporarily unavailable. |

---

## 6. Enumerations and Lifecycles

### 6.1 Enums
- **UserRole**: `STUDENT`, `LECTURER`, `ADMIN`
- **UserStatus**: `ACTIVE`, `INACTIVE`, `SUSPENDED`
- **TermStatus**: `PLANNED`, `ACTIVE`, `CLOSED`, `ARCHIVED`
- **SectionStatus**: `DRAFT`, `ACTIVE`, `ARCHIVED`
- **GroupingMode**: `STUDENT_LED`, `LECTURER_LED`, `HYBRID`
- **GroupingSessionStatus**: `DRAFT`, `OPEN`, `FROZEN`, `MATCHING`, `REVIEW`, `PUBLISHED`, `CLOSED`, `CANCELLED`
- **TeamStatus**: `FORMING`, `SUBMITTED`, `APPROVED`, `PUBLISHED`, `REJECTED`, `DISSOLVED`
- **InvitationStatus**: `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED`, `EXPIRED`
- **JoinRequestStatus**: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- **MatchRunStatus**: `QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`
- **CommitmentLevel**: `LOW`, `MEDIUM`, `HIGH`
- **SkillLevel**: `1` (Beginner), `2` (Basic), `3` (Intermediate), `4` (Advanced), `5` (Expert)

### 6.2 Grouping Session State Machine
```
DRAFT → OPEN → FROZEN → MATCHING → REVIEW → PUBLISHED → CLOSED
  └──────────────→ CANCELLED
REVIEW → OPEN is allowed only before publication and requires a reason.
```

### 6.3 Team State Machine
```
FORMING → SUBMITTED → APPROVED → PUBLISHED
   ↑          └→ REJECTED → FORMING
   └──── withdraw ────────┘
FORMING may become DISSOLVED before session publication.
```

---

## 7. Endpoint Summary (135 Total Endpoints)

### 7.1 Platform & Auth (9 endpoints)
- `GET /api/v1/health`
- `GET /api/v1/config/public`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me`
- `PATCH /api/v1/auth/me/password`

### 7.2 Users (7 endpoints)
- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/users/{userId}`
- `PATCH /api/v1/users/{userId}`
- `PATCH /api/v1/users/{userId}/status`
- `POST /api/v1/users/import`
- `GET /api/v1/users/imports/{importId}`

### 7.3 Academic Catalogs (29 endpoints)
- Campuses: `GET`, `POST`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`
- Terms: `GET`, `POST`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`, `POST /{termId}/activate`
- Majors: `GET`, `POST`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`
- Courses: `GET`, `POST`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`
- Skills: `GET`, `POST`, `GET /{id}`, `PATCH /{id}`
- Team Roles: `GET`, `POST`, `GET /{id}`, `PATCH /{id}`

### 7.4 Sections & Rosters (14 endpoints)
- `GET /api/v1/sections`
- `POST /api/v1/sections`
- `GET /api/v1/sections/{sectionId}`
- `PATCH /api/v1/sections/{sectionId}`
- `DELETE /api/v1/sections/{sectionId}`
- `GET /api/v1/sections/{sectionId}/lecturers`
- `POST /api/v1/sections/{sectionId}/lecturers`
- `DELETE /api/v1/sections/{sectionId}/lecturers/{lecturerId}`
- `GET /api/v1/sections/{sectionId}/students`
- `POST /api/v1/sections/{sectionId}/students`
- `DELETE /api/v1/sections/{sectionId}/students/{studentId}`
- `POST /api/v1/sections/{sectionId}/students/import`
- `GET /api/v1/sections/{sectionId}/timetable`
- `PUT /api/v1/sections/{sectionId}/timetable`

### 7.5 Student Profile & Team DNA (12 endpoints)
- `GET /api/v1/students/me/dashboard`
- `GET /api/v1/students/me/sections`
- `GET /api/v1/students/me/team-profile`
- `PUT /api/v1/students/me/team-profile`
- `GET /api/v1/students/me/availability`
- `PUT /api/v1/students/me/availability`
- `GET /api/v1/students/me/experiences`
- `POST /api/v1/students/me/experiences`
- `PATCH /api/v1/students/me/experiences/{experienceId}`
- `DELETE /api/v1/students/me/experiences/{experienceId}`
- `GET /api/v1/students/me/profile-readiness`
- `GET /api/v1/students/{studentId}/team-profile`

### 7.6 Grouping Sessions (14 endpoints)
- `GET /api/v1/grouping-sessions`
- `POST /api/v1/grouping-sessions`
- `GET /api/v1/grouping-sessions/{sessionId}`
- `PATCH /api/v1/grouping-sessions/{sessionId}`
- `DELETE /api/v1/grouping-sessions/{sessionId}`
- `GET /api/v1/grouping-sessions/{sessionId}/participants`
- `GET /api/v1/grouping-sessions/{sessionId}/readiness`
- `POST /api/v1/grouping-sessions/{sessionId}/open`
- `POST /api/v1/grouping-sessions/{sessionId}/freeze`
- `POST /api/v1/grouping-sessions/{sessionId}/reopen`
- `POST /api/v1/grouping-sessions/{sessionId}/cancel`
- `POST /api/v1/grouping-sessions/{sessionId}/publish`
- `GET /api/v1/students/me/grouping-sessions`
- `GET /api/v1/students/me/grouping-sessions/{sessionId}`

### 7.7 Teams (16 endpoints)
- `GET /api/v1/grouping-sessions/{sessionId}/teams`
- `POST /api/v1/grouping-sessions/{sessionId}/teams`
- `GET /api/v1/teams/{teamId}`
- `PATCH /api/v1/teams/{teamId}`
- `DELETE /api/v1/teams/{teamId}`
- `GET /api/v1/teams/{teamId}/members`
- `POST /api/v1/teams/{teamId}/members`
- `DELETE /api/v1/teams/{teamId}/members/{studentId}`
- `POST /api/v1/teams/{teamId}/leave`
- `POST /api/v1/teams/{teamId}/submit`
- `POST /api/v1/teams/{teamId}/withdraw`
- `POST /api/v1/teams/{teamId}/approve`
- `POST /api/v1/teams/{teamId}/reject`
- `POST /api/v1/teams/{teamId}/lock`
- `POST /api/v1/teams/{teamId}/unlock`
- `POST /api/v1/teams/{teamId}/move-member`

### 7.8 Invitations & Join Requests (12 endpoints)
- Invitations: `GET /teams/{teamId}/invitations`, `POST /teams/{teamId}/invitations`, `GET /students/me/invitations`, `POST /invitations/{id}/accept`, `POST /invitations/{id}/decline`, `DELETE /invitations/{id}`
- Join Requests: `GET /teams/{teamId}/join-requests`, `POST /teams/{teamId}/join-requests`, `GET /students/me/join-requests`, `POST /join-requests/{id}/approve`, `POST /join-requests/{id}/reject`, `DELETE /join-requests/{id}`

### 7.9 Matching & Review Board (12 endpoints)
- Matching: `POST /grouping-sessions/{sessionId}/match-runs`, `GET /grouping-sessions/{sessionId}/match-runs`, `GET /match-runs/{runId}`, `GET /match-runs/{runId}/recommendations`, `POST /match-runs/{runId}/apply`, `POST /match-runs/{runId}/cancel`
- Review Board: `GET /grouping-sessions/{sessionId}/review-board`, `PATCH /grouping-sessions/{sessionId}/review-board`, `POST /grouping-sessions/{sessionId}/validate`, `GET /grouping-sessions/{sessionId}/conflicts`, `GET /grouping-sessions/{sessionId}/balance-report`, `POST /grouping-sessions/{sessionId}/auto-fill`

### 7.10 Notifications, Reports & Audit (10 endpoints)
- Notifications: `GET /notifications`, `PATCH /notifications/{id}/read`, `POST /notifications/read-all`, `GET /notifications/unread-count`
- Reports: `GET /reports/dashboard/admin`, `GET /reports/dashboard/lecturer`, `GET /grouping-sessions/{sessionId}/reports/summary`, `GET /grouping-sessions/{sessionId}/exports/teams.csv`, `GET /sections/{sectionId}/exports/roster.csv`
- Audit: `GET /audit-logs`
