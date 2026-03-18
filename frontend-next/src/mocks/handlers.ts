import { http, HttpResponse } from "msw";

/**
 * MSW ハンドラー定義
 * Supabase API へのリクエストを横取りしてダミーデータを返却する
 */
export const handlers = [
    // 例: セッション取得のモック
    http.get("*/auth/v1/user", () => {
        return HttpResponse.json({
            id: "00000000-0000-0000-0000-000000000001",
            email: "alice@example.test",
            user_metadata: { name: "Alice" },
        });
    }),

    // 今後、各テストケースに応じてハンドラーを追加していく
];
