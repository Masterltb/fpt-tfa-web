# SDD 002: Lecturer Portal Core (Human-in-the-Loop & CP-SAT Engine Interface)

## 1. Overview & Architecture Decision
- **Module**: Lecturer Portal (Screens 20, 21, 23, 24)
- **Goal**: Cung cấp giao diện quản trị phiên ghép nhóm, cấu hình trọng số thuật toán CP-SAT và không gian kéo-thả (Drag-Drop Override Studio) cho Giảng viên trên nền tảng React 18 + Vite 5 + Tailwind v4 + TanStack Query v5.
- **Tech Lead Decision**:
  - Tuân thủ nguyên tắc **Human-in-the-Loop** theo `docs/constitution.md`: Giảng viên giữ quyền lực cao nhất trong việc điều chỉnh và quyết định công bố danh sách nhóm chính thức.
  - Áp dụng đủ 11 trạng thái UI/UX của **ui-ux Skill** (Skeleton Loading, Error Recovery với RFC 7807, Empty States...).
  - Thiết kế màn hình theo dạng Feature-based trong `web/src/pages/lecturer/`.

## 2. API Contract Mapping
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/lecturers/me/sections` | `GET` | Lấy danh sách lớp môn học do giảng viên phụ trách |
| `/api/v1/grouping-sessions` | `POST` | Khởi tạo phiên ghép nhóm mới với cấu hình Hiến pháp (Team Size, Mode, Skill Weights) |
| `/api/v1/grouping-sessions/{sessionId}/run-matching` | `POST` | Kích hoạt tác vụ chạy thuật toán CP-SAT trên hàng đợi |
| `/api/v1/grouping-sessions/{sessionId}/teams` | `GET` / `PUT` | Lấy danh sách nhóm đề xuất bởi AI và lưu điều chỉnh (Override) từ giảng viên |
| `/api/v1/grouping-sessions/{sessionId}/publish` | `POST` | Phê duyệt chính thức và công bố kết quả cho toàn bộ sinh viên |

## 3. UI Implementation Scope
1. `LecturerDashboard.tsx` (Screen 20):
   - Tổng quan các phiên ghép nhóm đang diễn ra, trạng thái phiên (`OPEN`, `FROZEN`, `MATCHING`, `REVIEW`, `PUBLISHED`).
   - Nút hành động nhanh tới Session Builder Wizard và Override Studio.
2. `SessionBuilderWizard.tsx` (Screen 21):
   - Wizard 4 bước cấu hình: 1. Lớp & Chế độ ghép -> 2. Quy mô nhóm (Min 4 - Max 6) -> 3. Trọng số kỹ năng CP-SAT -> 4. Kiểm tra & Khởi tạo.
3. `AiMatchingRunProgress.tsx` (Screen 23):
   - Màn hình theo dõi tiến trình chạy bộ giải OR-Tools CP-SAT thời gian thực (Terminal Log Simulation, thanh tiến trình hội tụ).
4. `DragDropOverrideStudio.tsx` (Screen 24):
   - Bảng phân nhóm tương tác (Board View) với thẻ sinh viên, cho phép di chuyển giữa các nhóm.
   - Thẻ theo dõi Chỉ số cân bằng nhóm (`Balance Score %`) và hộp thoại **XAI Rationale** cho từng nhóm.
   - Nút công bố chính thức ("Publish Approved Teams").

## 4. Continuous Verification Plan
- `npx tsc --noEmit` (0 TypeScript errors)
- `npm run build` (0 bundle errors)
- `uv run pytest -q` (48 backend tests PASS)
