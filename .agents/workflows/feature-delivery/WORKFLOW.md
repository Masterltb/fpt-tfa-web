# Feature Delivery Workflow — FPT University TFA

## Overview
Workflow chuẩn cho quá trình triển khai một tính năng Frontend/Backend mới mà không phát sinh lỗi regression.

## Workflow Execution Steps

### Step 1: Understand & Spec (SDD)
- Tạo folder spec tại `specs/<NNN>-<feature-name>/spec.md` nếu tính năng non-trivial.
- Kiểm tra `docs/api-contract.md` và `docs/constitution.md` để xác định Data Model & Rules.

### Step 2: Type Definition & Mock Setup
- Định nghĩa TypeScript interfaces trong `web/src/types/`.
- Đảm bảo mapping 1:1 với Pydantic DTOs của Backend FastAPI.

### Step 3: UI Component & State Implementation
- Xây dựng component tuân thủ **Skill `ui-ux`**:
  - Triển khai đủ 11 trạng thái component (Skeleton loading, Error recovery, Empty state, Disabled, No Permission...).
  - Đảm bảo FPT Orange `#F36F21` brand primary và accessibility WCAG 2.1 AA.

### Step 4: API Integration
- Áp dụng **Skill `api-integration`**:
  - Tích hợp TanStack Query v5.
  - Xử lý lỗi chuẩn RFC 7807 (`detail` error extraction, `401`, `403`, `422`).
  - Áp dụng Optimistic Update và Debounce 300ms cho ô tìm kiếm.

### Step 5: Verification & Human Gate
- Chạy kiểm tra tự động:
  ```bash
  uv run pytest -q
  uv run ruff check .
  cd web && npm run typecheck && npm test -- --run
  ```
- Trình bày kết quả và chờ Human Gate duyệt trước khi merge/commit.
