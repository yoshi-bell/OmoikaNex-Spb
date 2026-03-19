import { describe, it, expect, beforeEach, vi } from "vitest";
import { authApi } from "../auth";
import { createClient } from "@/lib/supabase/client";

// 💡 最終結論: Repository単体テストでは SDK 自体をモックする
vi.mock("@/lib/supabase/client", () => ({
    createClient: vi.fn(),
}));

describe("Auth Repository (エラーマッピングの統合検証)", () => {
    const mockSignIn = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(createClient).mockReturnValue({
            auth: {
                signInWithPassword: mockSignIn,
            },
        } as unknown as ReturnType<typeof createClient>);
    });

    it("正常な認証情報でログインすると、成功を返すこと (Happy Path)", async () => {
        // 💡 正常系のシミュレート
        mockSignIn.mockResolvedValue({
            data: { user: { id: "user-1" }, session: {} },
            error: null,
        });

        const result = await authApi.signIn({ email: "test@example.com", password: "password123" });

        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it("ID 6-2: 認証期限切れ (401) の時、Repository が AUTH_EXPIRED を返すこと", async () => {
        mockSignIn.mockResolvedValue({
            data: { user: null, session: null },
            error: {
                __isAuthError: true,
                status: 401,
                message: "Session expired",
            },
        });

        const result = await authApi.signIn({ email: "t@e.com", password: "p" });

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("AUTH_EXPIRED");
    });

    it("ID 6-4: レートリミット (429) の時、Repository が RATE_LIMIT を返すこと", async () => {
        mockSignIn.mockResolvedValue({
            data: { user: null, session: null },
            error: {
                __isAuthError: true,
                status: 429,
                message: "Too many requests",
            },
        });

        const result = await authApi.signIn({ email: "t@e.com", password: "p" });

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("RATE_LIMIT");
    });

    it("ID 6-1: ネットワークエラーの時、Repository が NETWORK_ERROR を返すこと", async () => {
        // fetch 失敗などの実行時エラーをシミュレート
        mockSignIn.mockRejectedValue(new Error("fetch failed"));

        const result = await authApi.signIn({ email: "t@e.com", password: "p" });

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("NETWORK_ERROR");
    });
});
