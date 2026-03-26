import { test, expect } from "@playwright/test";

test.describe("投稿・更新連動フロー (ID 2-3, 5-1: Interaction E2E)", () => {
    
    test.beforeEach(async ({ page }) => {
        // 全てのテストで共通のログイン処理 (Alice)
        await page.goto("/login");

        // 💡 修正: モダンなロケーターと Enter 送信で、ボタンのクリック空振りを防止
        await page.getByPlaceholder("メールアドレス").fill("alice@example.test");
        await page.getByPlaceholder("パスワード").fill("password123");
        await page.press('input[placeholder="パスワード"]', 'Enter');

        // 遷移完了の物理的な証拠が出るまで待つ
        await expect(page).toHaveURL("/", { timeout: 15000 });
        await expect(page.locator('button:has-text("シェアする")')).toBeVisible();
    });


    test("ID 2-3: [E2E] 正常なテキストを投稿した際、投稿が保存され、画面再読み込みなしでリスト先頭に即座に追加されること", async ({ page }) => {
        const postContent = `E2E Test Post at ${new Date().toISOString()}`;

        // 1. 投稿の入力
        const textarea = page.getByPlaceholder("いまどうしてる？");
        await textarea.fill(postContent);

        // 2. 投稿実行
        await page.click('button:has-text("シェアする")');

        // 💡 判定1: タイムライン上に投稿内容が物理的に出現したことを直接確認 (data-testid を使わない)
        // 出現するまで自動的に待機されるため、安定性が高い
        await expect(page.getByText(postContent)).toBeVisible({ timeout: 15000 });

        // 💡 判定2: 投稿が成功して初めて入力欄が空に戻っていること
        await expect(textarea).toHaveValue("");
    });

    test("ID 5-1: [E2E] プロフィールを正常値で更新した際、Server Actionが発火し、UI全域（ヘッダー等の名前）へ即時反映されること", async ({ page }) => {
        const newName = `Alice Updated ${Date.now().toString().slice(-4)}`;

        // 1. プロフィール画面へ移動
        await page.goto("/profile/00000000-0000-0000-0000-000000000001");

        // 2. 編集モーダルを開く
        await page.click('button:has-text("プロフィールを編集")');

        // 3. 名前を変更して保存
        const nameInput = page.getByLabel("名前");
        await nameInput.fill(newName);
        await page.click('button:has-text("保存")');

        // 💡 判定1: ダイアログ自体が閉じていることを厳密に確認
        await expect(page.getByRole("dialog")).not.toBeVisible();

        // 💡 判定2: ヘッダーの名前が更新されていること
        const headerName = page.locator('h1');
        await expect(headerName).toHaveText(newName);

        // 💡 判定3: サイドバー（自身のアイデンティティ表示）の名前も連動して変わっているか
        await expect(page.locator('nav')).toContainText(newName);
    });
});
