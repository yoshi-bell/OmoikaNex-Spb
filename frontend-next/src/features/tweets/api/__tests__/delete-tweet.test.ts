import { describe, it, expect, beforeEach, vi } from "vitest";
import { deleteTweet } from "../delete-tweet";
import { createClient } from "@/lib/supabase/client";
import { asTweetId } from "@/types/brands";

// 💡 最終結論: Repository単体テストでは SDK 自体をモックする
vi.mock("@/lib/supabase/client", () => ({
    createClient: vi.fn(),
}));

describe("deleteTweet Repository (ID 2-10: 不正削除ハンドリング)", () => {
    const mockDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(createClient).mockReturnValue({
            from: vi.fn().mockReturnValue({
                delete: vi.fn().mockReturnThis(),
                eq: mockDelete,
            }),
        } as unknown as ReturnType<typeof createClient>);
    });

    it("ID 2-6: 正常に 1 行削除された場合、success: true を返すこと", async () => {
        // 💡 PostgREST の挙動: 削除成功時は count: 1 (設定時) を返す
        mockDelete.mockResolvedValue({ error: null, count: 1 });

        const result = await deleteTweet(asTweetId(1));

        expect(result.success).toBe(true);
        expect(result.error).toBeNull();
    });

    it("ID 2-10 [異常系]: RLS 違反等により 0 行しか削除されなかった場合、サイレントに成功せずエラーを返すこと", async () => {
        // 💡 重要: Supabase は他人の行を削除しようとしてもエラー(error)は投げず、ただ count: 0 を返す
        mockDelete.mockResolvedValue({ error: null, count: 0 });

        const result = await deleteTweet(asTweetId(999));

        // 💡 期待挙動: 0行なら「失敗」とみなすべき
        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("PERMISSION_DENIED");
    });

    it("ID 2-10 [異常系]: DBから明示的なエラーが返された場合、マップされたエラーを返すこと", async () => {
        // 💡 礼儀正しいDBエラー
        mockDelete.mockResolvedValue({ 
            error: { code: "PGRST999", message: "Database failure", details: "", hint: "" }, 
            count: null 
        });

        const result = await deleteTweet(asTweetId(2));

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("SYSTEM_ERROR");
    });

    it("ID 2-10 [異常系]: ネットワーク切断等により例外がスローされた場合、クラッシュせずに catch されエラーを返すこと", async () => {
        // 💡 Promise自体が拒否される（スローされる）最悪のケース
        mockDelete.mockRejectedValue(new Error("fetch failed"));

        // もし catch ブロックが機能していなければ、ここでテストごとクラッシュする
        const result = await deleteTweet(asTweetId(3));

        expect(result.success).toBe(false);
        // mapSupabaseError によって正しく NETWORK_ERROR に変換されることを証明
        expect(result.error?.type).toBe("NETWORK_ERROR");
    });
});
