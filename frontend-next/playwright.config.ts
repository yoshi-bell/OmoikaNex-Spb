import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./src/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: "http://localhost:3001",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    // テスト実行時のみ 3001番ポートでサーバーを自動起動する
    // E2E_MODE=prod の場合は本番ビルドを起動し、それ以外は dev モードを使用する
    webServer: {
      command: process.env.E2E_MODE === 'prod' 
        ? 'npm run start -- -p 3001' 
        : 'npm run dev -- -p 3001',
      port: 3001,
      reuseExistingServer: !process.env.CI,
    },
    });

