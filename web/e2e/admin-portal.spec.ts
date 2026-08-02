import { test, expect } from '@playwright/test';

test.describe('Admin Portal E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('tfa_role', 'ADMIN');
      window.localStorage.setItem('tfa_user_id', 'adm_01');
    });
  });

  test('should view Admin Dashboard and system KPIs', async ({ page }) => {
    await page.goto('/admin/dashboard');

    await expect(page.locator('text=/Bảng Điều Khiển Quản Trị Toàn Trường/')).toBeVisible();
    await expect(page.locator('text=Fall 2026')).toBeVisible();
    await expect(page.locator('text=5 Cơ sở')).toBeVisible();
    await expect(page.locator('text=/4,850|4\\.850/')).toBeVisible();

    // Check System Health badge
    await expect(page.locator('text=HEALTHY (OK)')).toBeVisible();
  });

  test('should navigate to Roster Import Wizard and inspect PII preview table', async ({ page }) => {
    await page.goto('/admin/import');

    await expect(page.locator('text=Nhập Danh Sách Lớp & Bảo Mật PII')).toBeVisible();
    await expect(page.locator('text=/Học Kỳ Đăng Ký/')).toBeVisible();

    // Click next to Step 2 upload
    await page.click('button:has-text("Bước tiếp theo")');
    await expect(page.locator('text=Tải Lên Bảng Dữ Liệu Lớp (Excel / CSV)')).toBeVisible();

    // Select file and proceed to Step 3 Preview table
    await page.click('text=/Tải file mẫu chuẩn FPT TFA/');
    await page.click('button:has-text("Bước tiếp theo")');
    await expect(page.locator('text=Kiểm Tra Dữ Liệu Nhập (Preview & Validate)')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'SE180001', exact: true })).toBeVisible();
    await expect(page.locator('text=annvse180001@fpt.edu.vn')).toBeVisible();
  });

  test('should view Constitution Guardrail Editor and verify immutable constraints', async ({ page }) => {
    await page.goto('/admin/constitution');

    await expect(page.locator('text=Cấu Hình Luật Hiến Pháp Bất Biến')).toBeVisible();
    await expect(page.locator('text=STRICT GOVERNANCE LOCKED')).toBeVisible();
    await expect(page.locator('text=1. Quy Mô Nhóm Chuẩn')).toBeVisible();
    await expect(page.locator('text=2. Ràng Buộc "No Student Left Behind"')).toBeVisible();
    await expect(page.locator('text=3. Cấm Tín Hiệu Nhạy Cảm')).toBeVisible();
  });

  test('should view Audit Log Viewer and test RBAC filter', async ({ page }) => {
    await page.goto('/admin/audit-logs');

    await expect(page.locator('text=Nhật Ký Kiểm Toán & Truy Cập RBAC')).toBeVisible();
    await expect(page.locator('text=PUBLISH_TEAMS_OVERRIDE')).toBeVisible();
    await expect(page.locator('text=IMPORT_ROSTER_EXCEL')).toBeVisible();

    // Filter by ADMIN role
    await page.click('button:has-text("ADMIN")');
    await expect(page.locator('text=IMPORT_ROSTER_EXCEL')).toBeVisible();
  });
});
