# SDD 001: Student Portal Core (Dashboard & Team DNA Wizard)

## 1. Overview & Architecture Decision
- **Module**: Student Portal (Screens 11, 12, 13, 14)
- **Goal**: Triển khai trọn bộ không gian làm việc cho Sinh viên (Student Portal) trên nền tảng React 18 + Vite 5 + Tailwind v4 + Shadcn + TanStack Query v5, kết nối với các endpoint Backend FastAPI (`/api/v1/students/me/...` và `/api/v1/sections/...`).
- **Tech Lead Decision**:
  - Triển khai kiến trúc Component theo dạng Feature-based trong `web/src/pages/student/` và `web/src/components/student/`.
  - Tuân thủ tuyệt đối 11 trạng thái của **ui-ux Skill** (Loading skeleton, Error recovery, Empty state, Disabled...).
  - Áp dụng **api-integration Skill** với TanStack Query v5 hooks, xử lý RFC 7807 error detail.

## 2. API Contract Mapping
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/students/me/dashboard` | `GET` | Lấy danh sách môn học đã đăng ký, trạng thái phiên ghép nhóm, điểm số hoàn thành DNA |
| `/api/v1/students/me/team-profile` | `GET` / `PUT` | Xem và cập nhật hồ sơ Team DNA (skills, roles, commitment, availability) |
| `/api/v1/sections/{sectionId}` | `GET` | Xem thông tin chi tiết lớp học và hạn chót ghép nhóm |
| `/api/v1/grouping-sessions/{sessionId}/recommendations` | `GET` | Lấy danh sách gợi ý đồng đội từ AI kèm lý do XAI |

## 3. UI Implementation Scope (11 Mandatory States Included)
1. `StudentDashboard.tsx`:
   - Thẻ hiển thị tiến độ hồ sơ DNA (Completeness Score Gauge).
   - Lưới danh sách lớp môn học (Course Cards) có Huy hiệu trạng thái phiên (`OPEN`, `FROZEN`, `MATCHING`, `PUBLISHED`).
2. `TeamDnaWizard.tsx`:
   - Form 4 bước: 1. Skills -> 2. Preferred Roles -> 3. Weekly Availability Matrix -> 4. Target Grade & Commitment.
   - Biểu đồ Radar Chart thời gian thực cập nhật ngay khi sửa skill.
3. `AiRecommendations.tsx`:
   - Danh sách bạn học/nhóm gợi ý với Điểm tương thích (`Match Score %`) và hộp thoại giải thích AI (XAI Rationale Box).

## 4. Continuous Verification Plan
- `npx tsc --noEmit` (0 TypeScript errors)
- `uv run pytest -q` (48 backend tests PASS)
