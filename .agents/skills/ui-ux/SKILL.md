---
name: ui-ux
description: Frontend UI/UX design system and component implementation standards for FPT TFA 2026.
---

# UI/UX Skill — FPT University Team Formation Assistant (TFA)

## Overview
Skill này quy định chuẩn mực thiết kế và triển khai giao diện Frontend (React 18 + TypeScript + Vite 5 + Tailwind CSS v4 + Shadcn/ui) cho dự án FPT University TFA, tuân thủ Apple HIG, Material Design 3 và Nielsen Norman UX.

## Core Design System & Tokens
- **Brand Primary**: FPT Orange `#F36F21` (Hover: `#D95D12`, Active: `#B84A0A`)
- **AI / Accent**: Cyan `#06B6D4` / Blue `#3B82F6` (Dành riêng cho gợi ý AI, Explainability)
- **Status Colors**:
  - Success: Green `#10B981`
  - Warning: Amber `#F59E0B`
  - Error: Red `#EF4444`
  - Info: Blue `#3B82F6`
- **Typography**: Inter / Outfit. Scale: H1 (28-32px), H2 (22-24px), H3 (18-20px), Body (14-16px, line-height 1.6).
- **Spacing Grid**: Hệ thống 8pt/4pt (`4px, 8px, 12px, 16px, 24px, 32px, 48px`).
- **Border Radius**: Small (`6px`), Medium (`8px`), Large Card (`12px-16px`), Pill (`9999px`).

## Mandatory Component States
Mọi component và trang màn hình PHẢI triển khai đủ 11 trạng thái:
1. **Default**: Giao diện hiển thị chuẩn.
2. **Hover**: Hiệu ứng nâng nhẹ card (shadow-md), nút sáng/tối 10%.
3. **Active / Selected**: Viền highlight brand primary, checkmark icon.
4. **Focus**: Focus ring 2px visible (`outline-none ring-2 ring-primary`).
5. **Disabled**: Opacity 50%, `cursor-not-allowed`, vô hiệu hóa sự kiện.
6. **Loading**: Sử dụng **Skeleton Loading** (khung xám nhấp nháy), KHÔNG dùng Spinner xoay vô tận cho danh sách.
7. **Empty**: Hình minh họa thân thiện + Mô tả ngắn + Nút CTA hướng dẫn hành động tiếp theo.
8. **Success**: Toast/Alert xác nhận phản hồi tức thì (Visibility of System Status).
9. **Error**: Thông báo lỗi lịch sự kèm NGUYÊN NHÂN + NÚT THỬ LẠI (Error Recovery).
10. **No Permission (403)**: Màn hình rào cản phân quyền RBAC kèm giải thích.
11. **Offline**: Cảnh báo ngoại tuyến, bảo vệ dữ liệu LocalStorage.

## Accessibility (WCAG 2.1 AA)
- Tỷ lệ tương phản chữ/nền >= 4.5:1.
- Hỗ trợ bàn phím: Phím `Tab` di chuyển tuần tự, `Enter`/`Space` kích hoạt, `Esc` đóng modal.
- `aria-label`, `aria-expanded`, `aria-modal`, `role` chuẩn xác cho screen reader.

## Responsive Breakpoints
- **Mobile**: `< 768px` (1 cột, Drawer menu, Bottom Sheet, Touch target >= 48px).
- **Tablet**: `768px - 1024px` (2 cột, Collapsed Sidebar).
- **Desktop**: `>= 1280px` (Multi-column full workspace).
