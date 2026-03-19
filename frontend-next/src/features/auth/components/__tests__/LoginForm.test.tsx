import { render, screen, waitFor } from "@/test/utils";
import { LoginForm } from "../LoginForm";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth";
import { createClient } from "@/lib/supabase/client";

// Next.js useRouter のモック
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

// sonner toast のモック
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

// 💡 依存関係の完全なモック
vi.mock("@/features/auth/api/auth");
vi.mock("@/lib/supabase/client");

describe("LoginForm (ID 1-5 ~ 1-12: ログイン機能の堅牢性テスト)", () => {
    const mockPush = vi.fn();
    const mockNow = new Date().toISOString();
    const mockUserId = "00000000-0000-0000-0000-000000000001";

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
        } as ReturnType<typeof useRouter>);

        // 💡 authApi のデフォルト挙動 (成功)
        vi.mocked(authApi.signIn).mockResolvedValue({ success: true });
        vi.mocked(authApi.resendVerificationEmail).mockResolvedValue({
            success: true,
        });

        // 💡 supabase client のデフォルト挙動 (any を排除し、ReturnType で型を合わせる)
        vi.mocked(createClient).mockReturnValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: {
                        user: {
                            id: mockUserId,
                            email: "t@e.com",
                            created_at: mockNow,
                        },
                    },
                    error: null,
                }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                    data: {
                        id: mockUserId,
                        name: "Test User",
                        created_at: mockNow,
                    },
                    error: null,
                }),
            }),
        } as unknown as ReturnType<typeof createClient>);
    });

    const fillForm = async (
        user: ReturnType<typeof userEvent.setup>,
        email = "test@example.com",
        pass = "password123",
    ) => {
        await user.type(screen.getByPlaceholderText("メールアドレス"), email);
        await user.type(screen.getByPlaceholderText("パスワード"), pass);
    };

    it("ID 1-5: 正しい認証情報でログインすると、成功トーストが表示されホームへリダイレクトされること", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: "ログイン" }));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("ログインしました。");
            expect(mockPush).toHaveBeenCalledWith("/");
        });
    });

    it("ID 1-6: 誤ったパスワードでログインを試みると、認証失敗メッセージが表示されること", async () => {
        const user = userEvent.setup();
        vi.mocked(authApi.signIn).mockResolvedValue({
            success: false,
            error: { type: "AUTH_FAILED", message: "認証情報が一致しません。" },
        });

        render(<LoginForm />);
        await fillForm(user, "wrong@example.com", "wrongpassword");
        await user.click(screen.getByRole("button", { name: "ログイン" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "認証情報が一致しません。",
            );
        });
    });

    it("ID 1-4: [エッジケース] メール未認証時の再送信と遷移待ちガードの検証", async () => {
        const user = userEvent.setup();
        vi.mocked(authApi.signIn).mockResolvedValue({
            success: false,
            error: { type: "AUTH_NOT_CONFIRMED", message: "メール未認証" },
        });

        render(<LoginForm />);
        await fillForm(user);
        const submitButton = screen.getByRole("button", { name: "ログイン" });
        await user.click(submitButton);

        await waitFor(() => {
            expect(toast.info).toHaveBeenCalledWith(
                expect.stringContaining("再送信しました"),
            );
        });

        expect(submitButton).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "ログイン中..." }),
        ).toBeInTheDocument();

        await waitFor(
            () => {
                expect(mockPush).toHaveBeenCalledWith(
                    expect.stringContaining("/register/verify"),
                );
            },
            { timeout: 4000 },
        );
    });

    it("ID 1-Y: [部分的障害] 認証は成功したが、DB通信に失敗した場合でもクラッシュ（フリーズ）しないこと", async () => {
        const user = userEvent.setup();

        // 💡 DB通信のみエラーを返すようにモックを上書き
        vi.mocked(createClient).mockReturnValue({
            auth: {
                getUser: vi
                    .fn()
                    .mockResolvedValue({
                        data: { user: { id: "1" } },
                        error: null,
                    }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi
                    .fn()
                    .mockRejectedValue(new Error("DB connection failed")),
            }),
        } as unknown as ReturnType<typeof createClient>);

        render(<LoginForm />);
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: "ログイン" }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/");
            expect(toast.success).toHaveBeenCalledWith("ログインしました。");
        });
    });

    it("ID 1-Z: [バリデーション] 空入力時は API 通信が発生しないこと", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);
        await user.click(screen.getByRole("button", { name: "ログイン" }));

        expect(
            await screen.findByText(/メールアドレスを入力してください/i),
        ).toBeInTheDocument();
        expect(authApi.signIn).not.toHaveBeenCalled();
    });

    it("ID 1-11: [エッジケース] ログインボタンの連打防止が機能すること", async () => {
        const user = userEvent.setup();
        // 💡 通信を遅延させる
        vi.mocked(authApi.signIn).mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => resolve({ success: true }), 1000),
                ),
        );

        render(<LoginForm />);
        await fillForm(user);

        const submitButton = screen.getByRole("button", { name: "ログイン" });
        user.click(submitButton);

        expect(
            await screen.findByRole("button", { name: "ログイン中..." }),
        ).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
    });

    it("ID 1-12: [サーバーダウン] 500エラー時に適切なメッセージが表示されること", async () => {
        const user = userEvent.setup();
        vi.mocked(authApi.signIn).mockResolvedValue({
            success: false,
            error: {
                type: "SYSTEM_ERROR",
                message: "サーバーで問題が発生しました。",
            },
        });

        render(<LoginForm />);
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: "ログイン" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                expect.stringContaining("サーバーで問題が発生しました"),
            );
        });
    });
});
