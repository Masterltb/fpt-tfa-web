import { test, expect } from '@playwright/test';

test.describe('Lecturer Portal E2E Flow', () => {
  test('should view Lecturer Dashboard and navigate to Session Builder Wizard', async ({ page }) => {
    await page.goto('/lecturer/dashboard');

    // Check banner & authority text
    await expect(page.locator('text=Human-in-the-Loop Authority')).toBeVisible();
    await expect(page.locator('text=Danh Sách Lớp Môn Học Phụ Trách')).toBeVisible();

    // Check course cards
    await expect(page.locator('text=SWE201c')).toBeVisible();
    await expect(page.locator('text=PRJ301')).toBeVisible();

    // Navigate to Session Builder Wizard
    await page.click('text=Tạo Phiên Ghép Nhóm Mới');
    await expect(page).toHaveURL(/.*lecturer\/sessions\/new/);
    await expect(page.locator('text=Cấu Hình Hiến Pháp & Thuật Toán CP-SAT')).toBeVisible();

    // Check step 1 mode selection
    await expect(page.locator('text=⭐ HYBRID')).toBeVisible();

    // Proceed to Step 2
    await page.click('text=Bước tiếp theo');
    await expect(page.locator('text=Quy Mô Nhóm theo Hiến Pháp')).toBeVisible();

    // Proceed to Step 3
    await page.click('text=Bước tiếp theo');
    await expect(page.locator('text=Điều Chỉnh Trọng Số Thuật Toán CP-SAT')).toBeVisible();
  });

  test('should view AI Matching Run Progress and OR-Tools CP-SAT log simulation', async ({ page }) => {
    await page.goto('/lecturer/sessions/sess_01_se1801/matching');

    await expect(page.locator('text=Tiến Trình Chạy Thuật Toán Tối Ưu Ghép Nhóm')).toBeVisible();
    await expect(page.locator('text=Google OR-Tools CP-SAT Solver v9.8').first()).toBeVisible();
    await expect(page.locator('text=Nhật Ký Bộ Giải')).toBeVisible();
  });

  test('should view Drag-Drop Override Studio and check AI teams & XAI Rationale', async ({ page }) => {
    await page.goto('/lecturer/sessions/sess_01_se1801/override');

    await expect(page.locator('text=Duyệt & Kéo-Thả Điều Chỉnh Nhóm')).toBeVisible();
    await expect(page.locator('text=Nhóm 01 — SWE201c')).toBeVisible();
    await expect(page.locator('text=95% Balance')).toBeVisible();

    // Check XAI Rationale box
    await expect(page.locator('text=Giải Thích Tối Ưu AI (XAI Rationale):').first()).toBeVisible();

    // Test Human-in-the-Loop publish button
    await expect(page.locator('text=Chính Thức Phê Duyệt & Công Bố')).toBeEnabled();
  });
});
