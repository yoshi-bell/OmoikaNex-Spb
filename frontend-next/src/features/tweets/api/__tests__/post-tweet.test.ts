import { describe, it, expect, beforeEach, vi } from "vitest";
import { postTweet } from "../post-tweet";
import { createClient } from "@/lib/supabase/client";

// 💡 最終結論: Repository単体テストでは SDK 自体をモックする
vi.mock("@/lib/supabase/client", () => ({
    createClient: vi.fn(),
}));

describe("PostTweet Repository (エラーマッピングの統合検証)", () => {
    const mockUserId = "00000000-0000-0000-0000-000000000001";
    const mockInsert = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // 💡 デフォルトの振る舞い（Auth成功、DBインサート成功）を定義
        vi.mocked(createClient).mockReturnValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: { id: mockUserId, email: "test@example.com" } },
                    error: null,
                }),
            },
            from: vi.fn().mockReturnValue({
                insert: mockInsert.mockResolvedValue({ error: null }),
            }),
        } as unknown as ReturnType<typeof createClient>);
    });

    it("ID 6-5: RLS 違反 (42501) の時、Repository が PERMISSION_DENIED を返すこと", async () => {
        mockInsert.mockResolvedValue({
            error: {
                code: "42501",
                message: "new row violates row-level security policy",
                details: "",
                hint: "",
            },
        });

        const result = await postTweet({ content: "illegal tweet" });

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("PERMISSION_DENIED");
    });

    it("ID 6-5: DB 制約違反 (23514) の時、Repository が VALIDATION_ERROR を返すこと", async () => {
        mockInsert.mockResolvedValue({
            error: {
                code: "23514",
                message: "new row violates check constraint",
                details: "",
                hint: "",
            },
        });

        const result = await postTweet({ content: "too long content" });

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("VALIDATION_ERROR");
    });

    it("ID 6-3: 正常レスポンスの場合、成功を返すこと (Happy Path)", async () => {
        const result = await postTweet({ content: "test" });

        expect(result.success).toBe(true);
        expect(mockInsert).toHaveBeenCalledWith(
            expect.objectContaining({ content: "test", user_id: mockUserId }),
        );
    });

    // 😈 攻撃者（QA）からの贈り物
    it("ID 6-6: [エッジケース] 処理開始時に Auth 取得に失敗した場合（裏側でセッションが切れた状態）、DB操作を中断しエラーを返すこと", async () => {
        // 💡 getUser がエラーを返すようにモックを上書き
        vi.mocked(createClient).mockReturnValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: { user: null },
                    error: {
                        __isAuthError: true,
                        status: 401,
                        message: "Auth session missing",
                    },
                }),
            },
            from: vi.fn().mockReturnValue({
                insert: mockInsert,
            }),
        } as unknown as ReturnType<typeof createClient>);

        const result = await postTweet({ content: "ghost tweet" });

        // 💡 判定: DBの insert が絶対に呼ばれていないこと
        expect(mockInsert).not.toHaveBeenCalled();
        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("AUTH_EXPIRED");
    });

    it("ID 6-7: [エッジケース] SDK層で Promise 自体が Reject された場合（例外スロー）、クラッシュせず NETWORK_ERROR へマッピングされること", async () => {
        // 💡 insert が礼儀正しい {error} ではなく、例外を throw した場合
        mockInsert.mockRejectedValue(new Error("fetch failed"));

        const result = await postTweet({ content: "unstable network" });

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("NETWORK_ERROR");
    });
});
