# SDD 003: Admin Portal & System Analytics (Governance & Guardrails)

## 1. Overview & Architecture Decision
- **Module**: Admin Portal (Screens 29, 30, 31, 36)
- **Goal**: Cung cấp bộ công cụ quản trị toàn trường cho Admin trên nền tảng React 18 + Vite 5 + Tailwind v4 + TanStack Query v5, bảo đảm thi hành nghiêm ngặt hiến pháp FPT University (`docs/constitution.md`) và kiểm soát quyền riêng tư dữ liệu (`docs/rbac.md`).
- **Tech Lead Decision**:
  - Tách bạch cấu trúc trong `web/src/pages/admin/`.
  - Tuân thủ đủ 11 trạng thái của **ui-ux Skill** (Skeleton Loading, Error Recovery theo chuẩn RFC 7807, Empty States, Disabled buttons...).
  - Thiết kế bảng xem trước nhập dữ liệu (Roster Import Preview Table) và nhật ký kiểm toán (Audit Log Viewer) chuẩn hiển thị thông tin rõ ràng, hỗ trợ bộ lọc và tra cứu.

## 2. API Contract Mapping
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/admin/system/overview` | `GET` | Lấy các chỉ số KPI toàn hệ thống (campuses, terms, courses, users count) |
| `/api/v1/admin/rosters/import` | `POST` | Xử lý nhập file CSV/Excel danh sách sinh viên/giảng viên và xác thực PII |
| `/api/v1/admin/constitution` | `GET` / `PUT` | Xem và cập nhật các ràng buộc toàn cục theo `docs/constitution.md` |
| `/api/v1/admin/audit-logs` | `GET` | Truy xuất nhật ký hoạt động, bảo mật và truy cập theo vai trò RBAC |

## 3. UI Implementation Scope
1. `AdminDashboard.tsx` (Screen 29):
   - Tổng quan KPIs hệ thống, trạng thái dịch vụ (CP-SAT Solver status, Database health).
   - Lối tắt đến Import Roster, Constitution Editor và Audit Log.
2. `RosterImportWizard.tsx` (Screen 30):
   - Wizard 4 bước: 1. Chọn học kỳ & Lớp -> 2. Upload CSV/Excel -> 3. Bảng Preview lỗi & cảnh báo -> 4. Phê duyệt Import.
3. `ConstitutionGuardrailEditor.tsx` (Screen 31):
   - Bảng điều khiển thi hành Hiến pháp (Hard Constraints: Team Size 4-6, No Student Left Behind, cấm sử dụng dữ liệu nhạy cảm làm tín hiệu ghép nhóm).
4. `AuditLogViewer.tsx` (Screen 36):
   - Bảng tra cứu nhật ký hệ thống kèm bộ lọc theo vai trò, hành động và từ khóa.

## 4. Continuous Verification Plan
- `npx tsc --noEmit` (0 TypeScript errors)
- `npm run build` (0 bundle errors)
- `uv run pytest -q` (48 backend tests PASS)
