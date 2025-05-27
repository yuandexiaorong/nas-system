import { test, expect } from '@playwright/test';

test.describe('Storage Management', () => {
    test.beforeEach(async ({ page }) => {
        // 登录系统
        await page.goto('/login');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/dashboard');
    });

    test('should create storage pool', async ({ page }) => {
        // 导航到存储管理页面
        await page.click('text=存储管理');
        await page.waitForURL('/storage');

        // 点击创建存储池按钮
        await page.click('button:has-text("创建存储池")');

        // 填写表单
        await page.fill('input[name="name"]', 'test-pool');
        await page.selectOption('select[name="type"]', 'zfs');
        await page.fill('input[name="disks"]', '/dev/sda,/dev/sdb');

        // 提交表单
        await page.click('button[type="submit"]');

        // 验证结果
        await expect(page.locator('text=存储池创建成功')).toBeVisible();
        await expect(page.locator('text=test-pool')).toBeVisible();
    });

    test('should create dataset', async ({ page }) => {
        // 导航到存储管理页面
        await page.click('text=存储管理');
        await page.waitForURL('/storage');

        // 选择存储池
        await page.click('text=test-pool');

        // 点击创建数据集按钮
        await page.click('button:has-text("创建数据集")');

        // 填写表单
        await page.fill('input[name="name"]', 'test-dataset');
        await page.fill('input[name="quota"]', '1000000000');
        await page.selectOption('select[name="compression"]', 'lz4');

        // 提交表单
        await page.click('button[type="submit"]');

        // 验证结果
        await expect(page.locator('text=数据集创建成功')).toBeVisible();
        await expect(page.locator('text=test-dataset')).toBeVisible();
    });

    test('should create snapshot', async ({ page }) => {
        // 导航到存储管理页面
        await page.click('text=存储管理');
        await page.waitForURL('/storage');

        // 选择存储池
        await page.click('text=test-pool');

        // 选择数据集
        await page.click('text=test-dataset');

        // 点击创建快照按钮
        await page.click('button:has-text("创建快照")');

        // 填写表单
        await page.fill('input[name="name"]', 'test-snapshot');
        await page.check('input[name="recursive"]');

        // 提交表单
        await page.click('button[type="submit"]');

        // 验证结果
        await expect(page.locator('text=快照创建成功')).toBeVisible();
        await expect(page.locator('text=test-snapshot')).toBeVisible();
    });

    test('should delete storage pool', async ({ page }) => {
        // 导航到存储管理页面
        await page.click('text=存储管理');
        await page.waitForURL('/storage');

        // 选择存储池
        await page.click('text=test-pool');

        // 点击删除按钮
        await page.click('button:has-text("删除")');

        // 确认删除
        await page.click('button:has-text("确认")');

        // 验证结果
        await expect(page.locator('text=存储池删除成功')).toBeVisible();
        await expect(page.locator('text=test-pool')).not.toBeVisible();
    });
}); 