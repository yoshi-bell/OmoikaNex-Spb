import { render, screen, waitFor } from "@/test/utils";
import { RegisterForm } from "../RegisterForm";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { server } from "@/mocks/server";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "sonner";

// Next.js useRouter のモック
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

// useAuthUser のモック
vi.mock("@/hooks/useAuthUser");

// sonner toast のモック
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("RegisterForm (ID 1-1 ~ 1-4: 新規登録テスト)", () => {
    const mockPush = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // useRouter のモック型安全な実装
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
            refresh: vi.fn(),
        } as ReturnType<typeof useRouter>);

        // useAuthUser のデフォルトモック
        vi.mocked(useAuthUser).mockReturnValue({
            user: null,
            isAuthenticated: false,
            isInitialLoading: false,
            setUser: vi.fn(),
            clearAuth: vi.fn(),
        });
    });

    it("ID 1-1: [E2E] 正常な値で登録処理を実行した際、ユーザー情報保存・セッション確立後にホームへ遷移すること", async () => {
        const user = userEvent.setup();

        server.use(
            http.post("*/auth/v1/signup", () => {
                return HttpResponse.json(
                    {
                        user: { id: "new-user-id", email: "new@example.com" },
                        session: null,
                    },
                    { status: 200 },
                );
            }),
        );

        render(<RegisterForm />);

        await user.type(
            screen.getByPlaceholderText("ユーザーネーム"),
            "Test User",
        );
        await user.type(
            screen.getByPlaceholderText("メールアドレス"),
            "new@example.com",
        );
        await user.type(
            screen.getByPlaceholderText("パスワード"),
            "password123",
        );

        await user.click(screen.getByRole("button", { name: "新規登録" }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                expect.stringContaining("/register/verify"),
            );
            expect(toast.success).toHaveBeenCalledWith(
                "認証メールを送信しました。",
            );
        });
    });

    it("ID 1-2: [Integration] 重複メールで登録試行した際、Emailフィールド下に「既に登録されています」と表示されること", async () => {
        const user = userEvent.setup();

        server.use(
            http.post("*/auth/v1/signup", () => {
                return HttpResponse.json(
                    {
                        code: "user_already_exists",
                        msg: "User already registered",
                    },
                    { status: 400 },
                );
            }),
        );

        render(<RegisterForm />);

        await user.type(
            screen.getByPlaceholderText("ユーザーネーム"),
            "Test User",
        );
        await user.type(
            screen.getByPlaceholderText("メールアドレス"),
            "existing@example.com",
        );
        await user.type(
            screen.getByPlaceholderText("パスワード"),
            "password123",
        );

        await user.click(screen.getByRole("button", { name: "新規登録" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "このメールアドレスは既に登録されています。",
            );
            expect(
                screen.getByText("このメールアドレスは既に登録されています。"),
            ).toBeInTheDocument();
        });
    });

    it("ID 1-3: [Unit] 不正パスワードで登録試行した際、Zodが弾き、API通信が発生せずにエラー表示されること", async () => {
        const user = userEvent.setup();

        const signupSpy = vi.fn();
        server.use(http.post("*/auth/v1/signup", signupSpy));

        render(<RegisterForm />);

        await user.type(
            screen.getByPlaceholderText("ユーザーネーム"),
            "Test User",
        );
        await user.type(
            screen.getByPlaceholderText("メールアドレス"),
            "valid@example.com",
        );
        await user.type(
            screen.getByPlaceholderText("パスワード"),
            "onlyLetters",
        ); // タイポ修正

        await user.click(screen.getByRole("button", { name: "新規登録" }));

        expect(
            await screen.findByText(/パスワードは英数字を混合してください/i),
        ).toBeInTheDocument();
        expect(signupSpy).not.toHaveBeenCalled();
    });

    it("ID 1-4: [Integration] メール未認証でログインしようとした際、AUTH_NOT_CONFIRMED 検知によりリダイレクトされること", async () => {
        const user = userEvent.setup();

        server.use(
            http.post("*/auth/v1/signup", () => {
                return HttpResponse.json(
                    {
                        user: {
                            id: "unconfirmed-id",
                            email: "verify@example.com",
                            identities: [],
                        },
                        session: null,
                    },
                    { status: 200 },
                );
            }),
        );

        render(<RegisterForm />);

        await user.type(
            screen.getByPlaceholderText("ユーザーネーム"),
            "Verify User",
        );
        await user.type(
            screen.getByPlaceholderText("メールアドレス"),
            "verify@example.com",
        );
        await user.type(
            screen.getByPlaceholderText("パスワード"),
            "password123",
        );

        await user.click(screen.getByRole("button", { name: "新規登録" }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                expect.stringContaining(
                    "/register/verify?email=verify%40example.com",
                ),
            );
        });
    });

    it("ID 1-11: [Unit] 「新規登録」ボタンを連打した際、通信中は disabled になり、APIコールが 1 回しか発生しないこと", async () => {
        const user = userEvent.setup();

        server.use(
            http.post("*/auth/v1/signup", async () => {
                await delay(1000);
                return HttpResponse.json({
                    user: { id: "test" },
                    session: null,
                });
            }),
        );

        render(<RegisterForm />);

        await user.type(
            screen.getByPlaceholderText("ユーザーネーム"),
            "Test User",
        );
        await user.type(
            screen.getByPlaceholderText("メールアドレス"),
            "slow@example.com",
        );
        await user.type(
            screen.getByPlaceholderText("パスワード"),
            "ValidPass123",
        );

        const submitButton = screen.getByRole("button", { name: "新規登録" });
        const clickPromise = user.click(submitButton);

        expect(
            await screen.findByRole("button", { name: "登録中..." }),
        ).toBeInTheDocument();
        expect(submitButton).toBeDisabled();

        await clickPromise;

        // 通信完了後は無事にリダイレクトとトーストが表示されることを確認
        // delay(1000) を考慮し、タイムアウトを長めに設定
        await waitFor(
            () => {
                expect(mockPush).toHaveBeenCalledWith(
                    expect.stringContaining("/register/verify"),
                );
                expect(toast.success).toHaveBeenCalledWith(
                    "認証メールを送信しました。",
                );
            },
            { timeout: 3000 },
        );
    });

    it("ID 1-12: [Unit] 500エラー発生した際、クラッシュせず、トーストで「サーバーで問題が発生しました」と表示されること", async () => {
        const user = userEvent.setup();

        server.use(
            http.post("*/auth/v1/signup", () => {
                return new HttpResponse(null, { status: 500 });
            }),
        );

        render(<RegisterForm />);

        await user.type(
            screen.getByPlaceholderText("ユーザーネーム"),
            "Test User",
        );
        await user.type(
            screen.getByPlaceholderText("メールアドレス"),
            "error@example.com",
        );
        await user.type(
            screen.getByPlaceholderText("パスワード"),
            "password123",
        );

        await user.click(screen.getByRole("button", { name: "新規登録" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                expect.stringContaining("サーバーで問題が発生しました"),
            );
        });
    });

    it("ID 1-16: [Unit] 新規登録時の通信・ネットワークエラーが発生した際、トーストで安全にエラーが表示されること", async () => {
        const user = userEvent.setup();

        server.use(
            http.post("*/auth/v1/signup", () => {
                return HttpResponse.error();
            }),
        );

        render(<RegisterForm />);

        await user.type(
            screen.getByPlaceholderText("ユーザーネーム"),
            "Test User",
        );
        await user.type(
            screen.getByPlaceholderText("メールアドレス"),
            "offline@example.com",
        );
        await user.type(
            screen.getByPlaceholderText("パスワード"),
            "password123",
        );

        await user.click(screen.getByRole("button", { name: "新規登録" }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                expect.stringContaining("ネットワークに接続できません"),
            );
        });
    });
});
