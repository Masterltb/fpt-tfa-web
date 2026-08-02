import { test, expect } from '@playwright/test';

test.describe('Student Portal E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('tfa_role', 'STUDENT');
      window.localStorage.setItem('tfa_user_id', 'stu_01');
    });
  });

  test('should render Landing Page and navigate to Login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Team Formation Assistant' })).toBeVisible();
    await expect(page.locator('text=Lập nhóm cân bằng.')).toBeVisible();

    // Click CTA to login
    await page.click('text=/Đăng nhập với Google FPT Edu/');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('text=Đăng Nhập TFA')).toBeVisible();
  });

  test('should view Student Dashboard and open Team DNA Wizard', async ({ page }) => {
    await page.goto('/student/dashboard');

    // Check banner & section cards
    await expect(page.locator('text=/Tiến Độ Hoàn Thành Team DNA/')).toBeVisible();
    await expect(page.locator('text=SWE201c')).toBeVisible();
    await expect(page.locator('text=SE1801')).toBeVisible();

    // Navigate to Team DNA Wizard
    await page.click('text=Cập nhật Team DNA');
    await expect(page).toHaveURL(/.*student\/dna/);
    await expect(page.locator('text=/Khai Báo Hồ Sơ Team DNA/')).toBeVisible();

    // Verify step 1 skills
    await expect(page.locator('text=/1. Kỹ Năng/')).toBeVisible();

    // Proceed to step 2
    await page.click('text=/Bước tiếp theo/');
    await expect(page.locator('text=/2. Vai Trò/')).toBeVisible();
  });

  test('should view AI Recommendations and XAI Explainable Rationale Box', async ({ page }) => {
    await page.goto('/student/sections/sec_se1801_swe201c/recommendations');

    await expect(page.locator('text=/Gợi Ý Đồng Đội Cân Bằng Nhất/')).toBeVisible();
    await expect(page.locator('text=/Explainable XAI/')).toBeVisible();
    await expect(page.locator('text=/Lý Do AI Gợi Ý/').first()).toBeVisible();
  });
});
