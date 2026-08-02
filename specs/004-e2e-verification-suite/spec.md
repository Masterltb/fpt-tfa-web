# SDD 004: End-to-End Playwright Verification Suite across 3 Roles & 3 Modes

## 1. Overview & Architecture Decision
- **Module**: End-to-End Verification (`web/e2e/`)
- **Goal**: Xác minh tự động toàn bộ luồng nghiệp vụ của hệ thống FPT TFA (Student, Lecturer, Admin) và 3 chế độ ghép nhóm (`HYBRID`, `LECTURER_LED`, `STUDENT_LED`) bằng framework **Playwright**, bảo đảm không có lỗi giao diện hay bất thường trong luồng thao tác.
- **Tech Lead Decision**:
  - Cài đặt `@playwright/test` trong `web/`.
  - Cấu hình `playwright.config.ts` chạy với dev server hoặc build preview (`localhost:5173` / `localhost:4173`).
  - Viết kịch bản E2E kiểm chứng 3 luồng chính:
    1. **Student Flow**: Kiểm tra Đăng nhập -> Vào Dashboard -> Hoàn thành 4 bước Team DNA Profile Wizard -> Kiểm tra màn hình AI Recommendations & XAI Explainable box.
    2. **Lecturer Flow**: Kiểm tra vào Dashboard Giảng viên -> Mở Session Builder Wizard thiết lập ràng buộc theo `docs/constitution.md` (Min 4 - Max 6) -> Kiểm tra màn hình AI Matching Run Progress -> Kiểm tra Drag-Drop Override Studio và công bố.
    3. **Admin Flow**: Kiểm tra vào Dashboard Admin KPI -> Chạy Roster Import Wizard -> Cấu hình Constitution Guardrail Editor -> Kiểm tra Audit Log Viewer.

## 2. Test Scenarios Scope
- `e2e/student-portal.spec.ts`: Test Screens 01 (Landing), 07 (Login), 11 (Dashboard), 12 (Team DNA Wizard), 13 (Section Workspace), 14 (AI Recommendations).
- `e2e/lecturer-portal.spec.ts`: Test Screens 20 (Dashboard), 21 (Session Builder Wizard), 23 (AI Matching Run Progress), 24 (Drag-Drop Override Studio).
- `e2e/admin-portal.spec.ts`: Test Screens 29 (Dashboard), 30 (Roster Import), 31 (Constitution Guardrail Editor), 36 (Audit Log Viewer).

## 3. Verification Execution Plan
- Run `npx playwright test --project=chromium` in `web/`.
- Ensure 100% test pass rate across all 3 suites.
