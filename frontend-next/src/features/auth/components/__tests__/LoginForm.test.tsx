import { render, screen, waitFor } from "@/test/utils";
import { LoginForm } from "../LoginForm";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/auth";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

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

// useAuthStore のモック
vi.mock("@/store/auth-store", () => ({
    useAuthStore: vi.fn(),
}));

// 💡 依存関係の完全なモック
vi.mock("@/features/auth/api/auth");
vi.mock("@/lib/supabase/client");

describe("LoginForm (ID 1-5 ~ 1-12: ログイン機能の堅牢性テスト)", () => {
    const mockPush = vi.fn();
    const mockNow = new Date().toISOString();
    const mockUserId = "00000000-0000-0000-0000-000000000001";
    const mockSetUser = vi.fn();

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

        // 💡 useAuthStore のデフォルト挙動
        vi.mocked(useAuthStore).mockReturnValue({
            setUser: mockSetUser,
        });

        // 💡 authApi のデフォルト挙動 (成功)
        vi.mocked(authApi.signIn).mockResolvedValue({ success: true });
        vi.mocked(authApi.resendVerificationEmail).mockResolvedValue({
            success: true,
        });

        // 💡 supabase client のデフォルト挙動
        vi.mocked(createClient).mockReturnValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: {
                        user: {
                            id: mockUserId,
                            email: "t@e.com",
                            created_at: mockNow,
                            user_metadata: { name: "Auth Name" },
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
                        name: "Profile Name",
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

    it("ID 1-5: [Integration] 正しい認証情報でログインすると、setUser が呼ばれ、成功トーストが表示されホームへリダイレクトされること", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: "ログイン" }));

        await waitFor(() => {
            expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
                id: mockUserId,
                name: "Profile Name", // DB側の名前が優先される
            }));
            expect(toast.success).toHaveBeenCalledWith("ログインしました。");
            expect(mockPush).toHaveBeenCalledWith("/");
        });
    });

    it("ID 1-6: [Integration] 誤ったパスワードでログインを試みると、認証失敗メッセージが表示されること", async () => {
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

    it("ID 1-4: [Integration] [エッジケース] メール未認証のアカウントでログインを試みた場合、再送信が行われ検証ページへ誘導されること", async () => {
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

    it("ID 1-13: [Integration] [部分的障害] 認証は成功したが、DB通信に失敗した場合でも、Auth層の情報で setUser が呼ばれ、ホームへリダイレクトされること", async () => {
        const user = userEvent.setup();

        // 💡 DB通信のみエラーを返すようにモックを上書き
        vi.mocked(createClient).mockReturnValue({
            auth: {
                getUser: vi.fn().mockResolvedValue({
                    data: {
                        user: {
                            id: mockUserId,
                            email: "t@e.com",
                            created_at: mockNow,
                            user_metadata: { name: "Auth Name" },
                        },
                    },
                    error: null,
                }),
            },
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockRejectedValue(new Error("DB connection failed")),
            }),
        } as unknown as ReturnType<typeof createClient>);

        render(<LoginForm />);
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: "ログイン" }));

        await waitFor(() => {
            // 💡 現在の実装では setUser が呼ばれないため、ここで fail するはず
            expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
                id: mockUserId,
                name: "Auth Name", // DB失敗時は Auth メタデータの名前でフォールバック
            }));
            expect(mockPush).toHaveBeenCalledWith("/");
            expect(toast.success).toHaveBeenCalledWith("ログインしました。");
        });
    });

    it("ID 1-15: [Unit] [バリデーション] 空入力時は API 通信が発生しないこと", async () => {
        const user = userEvent.setup();
        render(<LoginForm />);
        await user.click(screen.getByRole("button", { name: "ログイン" }));

        expect(
            await screen.findByText(/メールアドレスを入力してください/i),
        ).toBeInTheDocument();
        expect(authApi.signIn).not.toHaveBeenCalled();
    });

    it("ID 1-11: [Unit] [エッジケース] ログインボタンの連打防止が機能すること", async () => {
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

    it("ID 1-12: [Unit] [サーバーダウン] 500エラー時に適切なメッセージが表示されること", async () => {
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

    it("ID 1-7: [Unit] [ネットワーク切断] 通信エラー時に安全にエラーが表示されること", async () => {
        const user = userEvent.setup();
        vi.mocked(authApi.signIn).mockResolvedValue({
            success: false,
            error: {
                type: "NETWORK_ERROR",
                message: "ネットワークに接続できません。通信環境を確認してください。",
            },
        });

        render(<LoginForm />);
        await fillForm(user);
        await user.click(screen.getByRole("button", { name: "ログイン" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                expect.stringContaining("ネットワークに接続できません"),
            );
        });
    });
});
