import { test, expect } from "@playwright/test";

test.describe("UXとセキュリティの最終証明 (ID 4-1, 5-4: Advanced E2E)", () => {
    
    test.beforeEach(async ({ page }) => {
        // Alice としてログイン
        await page.goto("/login");
        await page.getByPlaceholder("メールアドレス").fill("alice@example.test");
        await page.getByPlaceholder("パスワード").fill("password123");

        // 💡 修正案の検証: ボタンが有効化されるのを待つ
        const loginButton = page.locator('button:has-text("ログイン")');
        await expect(loginButton).toBeEnabled();
        await loginButton.click();

        await expect(page).toHaveURL("/", { timeout: 15000 });
        await expect(page.locator('button:has-text("シェアする")')).toBeVisible();
    });

    test("ID 4-1: [E2E] 楽観的UIの物理的証明（通信遅延下でも一瞬で反映されること）", async ({ page }) => {
        // 1. Supabase の REST API 通信をわざと 5 秒遅らせる
        // 💡 修正: 実際の通信先である rest/v1 をインターセプト
        await page.route('**/rest/v1/**', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 5000));
            await route.continue();
        });

        const likeButton = page.locator('button[aria-label="いいね"]').first();
        // 初期状態のテキスト（数字部分）を取得
        const initialText = await likeButton.innerText();

        // 2. クリック実行
        await likeButton.click();

        // 💡 判定: 通信が終わる前（5秒以内）に、即座に数字が変わっているか
        // 0.5秒以内に判定を終えることで、楽観的UIであることを物理的に証明
        await expect(likeButton).not.toHaveText(initialText, { timeout: 500 });
    });

    test("ID 5-4: [E2E] 認可ガードの実機検証（他人のプロフィールでは編集機能が遮断されていること）", async ({ page }) => {
        // 1. Bob (自分以外) のプロフィールへ移動
        await page.goto("/profile/00000000-0000-0000-0000-000000000002");

        // 💡 肯定的証明: 画面が正常にロードされ、他人のプロフとして認識されている証拠
        // 「プロフィールを編集」はないが、「フォロー」ボタンは存在することを確認
        await expect(page.locator('button:has-text("フォロー")')).toBeVisible();

        // 💡 否定的証明: 「プロフィールを編集」ボタンが物理的に存在しないこと
        const editButton = page.locator('button:has-text("プロフィールを編集")');
        await expect(editButton).not.toBeVisible();
    });

});
