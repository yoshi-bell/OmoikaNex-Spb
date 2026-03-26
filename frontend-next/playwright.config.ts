import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./src/e2e",
    /* テスト実行のタイムアウト (ms) */
    timeout: 90 * 1000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    /* ターミナルに詳細な進捗とログを出す設定 */
    reporter: [
        ["list"],
        ["html", { open: "never" }]
    ],
    use: {
        // 💡 修正: 認証のリダイレクト整合性（localhost固定）を保つため、名称を戻す
        baseURL: "http://localhost:3001",
        trace: "on-first-retry",
        /* 失敗時の視覚的エビデンス */
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    /* テスト実行時にサーバーを自動起動 */
    webServer: {
      command: process.env.E2E_MODE === 'prod' 
        ? 'npm run start -- -p 3001' 
        : 'npm run dev -- -p 3001',
      // 💡 修正: localhost での待受を確認
      url: "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    });
