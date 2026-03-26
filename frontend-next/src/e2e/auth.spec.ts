import { test, expect } from "@playwright/test";

test.describe("認証フロー (ID 1-1, 1-5: Auth E2E)", () => {
    
    test("ID 1-5: [E2E] 正しいメール・パスワードでログインし、ホーム画面へ遷移できること", async ({ page }) => {
        // 1. ログインページへ移動
        await page.goto("/login");

        // 2. ログインフォームの入力
        await page.fill('input[placeholder="メールアドレス"]', "alice@example.test");
        await page.fill('input[placeholder="パスワード"]', "password123");

        // 3. ログインボタンをクリック
        await page.click('button:has-text("ログイン")');

        // 4. ホーム画面への遷移を確認
        await expect(page).toHaveURL("/");

        // 💡 判定: ログイン後のみ表示される「シェアする」ボタンの存在を確認
        await expect(page.locator('button:has-text("シェアする")')).toBeVisible();
    });

    test("ID 1-17: [E2E] 未ログイン状態で /login にアクセスした際、リダイレクトされずログイン画面が表示されること", async ({ page }) => {
        await page.goto("/login");
        await expect(page).toHaveURL("/login");
        await expect(page.locator('h1:has-text("ログイン")')).toBeVisible();
    });
});
