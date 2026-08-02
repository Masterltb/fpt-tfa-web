---
name: harness-governance
description: Forge Harness Engineering Governance & Constitution Enforcement Rules for FPT TFA.
---

# Harness Governance Skill — FPT University Team Formation Assistant (TFA)

## Overview
Skill này bắt buộc tất cả AI Agent và Developer tuân thủ quy trình **Forge Harness Engineering Process** (`AGENTS.md`) và **Quy tắc Bất biến Constitution** (`docs/constitution.md`).

## Non-Negotiable Constitution Guardrails (`docs/constitution.md`)
1. **Hard Constraints (R1, R2, R7)**:
   - `R1`: Sĩ số nhóm nằm trong khoảng `[min_size, max_size]` (Mặc định 4-6). Không bao giờ cho phép xuất bản nhóm vi phạm sĩ số.
   - `R2`: Must-pair (bắt buộc chung nhóm) & Cannot-pair (cấm chung nhóm) không bao giờ được vi phạm.
   - `R7`: Mỗi sinh viên được gán đúng 1 nhóm duy nhất.
2. **Student Privacy (BR-08/BR-09, A-05)**:
   - Nghiêm cấm thu thập hoặc sử dụng các thuộc tính nhạy cảm (Giới tính, Dân tộc, Tôn giáo, Sức khỏe, Tuổi tác) làm tín hiệu đầu vào cho AI Matching.
3. **Human-in-the-Loop Supreme Rule**:
   - AI chỉ đưa ra đề xuất (AI recommends). Giảng viên là người duyệt và xuất bản (Lecturers decide).
   - KHÔNG BAO GIỜ tự động xuất bản (No auto-publish) nếu chưa có xác nhận từ Giảng viên.
4. **Explainable AI (XAI)**:
   - Mọi đề xuất nhóm đều phải kèm theo lý do giải thích minh bạch (`Explainability Rationale`).

## SDD & Task Execution Lifecycle
Mọi thay đổi code phi tiểu tiết phải tuân theo 7 bước:
`Understand → Specify (via SDD in specs/) → Plan → Implement → Verify → Review → Human Gate`

## Continuous Automated Verification Commands
Trước khi đánh giá hoàn thành công việc:
1. Backend Unit & Contract Tests: `uv run pytest -q`
2. Backend Linting: `uv run ruff check .`
3. Frontend Typecheck: `cd web && npm run typecheck`
4. Frontend Unit Tests: `cd web && npm test -- --run`

## Quy trình Git Commit & Push (Conventional Commits Standard)
1. **Human Gate Gatekeeper**: Agent chỉ đề xuất lệnh commit/push sau khi toàn bộ verification tests PASS. Agent **không tự động push** nếu chưa có sự đồng ý của người dùng.
2. **Cú pháp Conventional Commits**:
   - `feat(scope): <mô tả ngắn>` — Thêm tính năng mới (e.g. `feat(web): setup vite react-ts with tailwind v4 and api client`)
   - `fix(scope): <mô tả ngắn>` — Sửa lỗi (e.g. `fix(api): rfc7807 error detail unwrapping`)
   - `docs(scope): <mô tả ngắn>` — Tài liệu (e.g. `docs(ux): update master spec to 47 audited screens`)
   - `test(scope): <mô tả ngắn>` — Kiểm thử (e.g. `test(backend): 48 tests pass verification`)
   - `refactor(scope): <mô tả ngắn>` — Tái cấu trúc code.
3. **Các lệnh thực thi**:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push origin main  # Hoặc tên branch hiện tại sau khi người dùng phê duyệt
   ```
