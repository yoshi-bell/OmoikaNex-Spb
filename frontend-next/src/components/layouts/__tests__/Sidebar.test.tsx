import { render, screen, waitFor } from "@/test/utils";
import { Sidebar } from "../Sidebar";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/auth";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { asUserId } from "@/types/brands";

// モックの設定
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

vi.mock("@/features/auth/api/auth");
vi.mock("@/hooks/useAuthUser");
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@tanstack/react-query")>();
    return {
        ...actual,
        useQueryClient: vi.fn(),
    };
});

vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// 子コンポーネントのモック (副作用を避ける)
vi.mock("@/features/tweets/components/PostTweetForm", () => ({
    PostTweetForm: () => <div data-testid="post-tweet-form" />,
}));

describe("Sidebar (ID 1-8, 1-10, 1-14: ログアウトとハイドレーション保護の検証)", () => {
    const mockPush = vi.fn();
    const mockRefresh = vi.fn();
    const mockQueryClient = {
        clear: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
            refresh: mockRefresh,
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
        } as unknown as ReturnType<typeof useRouter>);

        // 💡 リファクタリング: as any を排除し型安全にモック
        vi.mocked(useQueryClient).mockReturnValue(
            mockQueryClient as unknown as ReturnType<typeof useQueryClient>,
        );
    });

    const mockUser = {
        id: asUserId("user-1"),
        name: "Test User",
        avatar_url: null,
        email: "t@e.com",
        created_at: "now",
        is_following: false,
    };

    it("ID 1-8, 1-10: [正常系] ログアウト成功時に React Query キャッシュと Zustand ストアが強制クリアされ、ログイン画面へリダイレクトされること", async () => {
        const user = userEvent.setup();
        const mockClearAuth = vi.fn();

        vi.mocked(useAuthUser).mockReturnValue({
            user: mockUser,
            isInitialLoading: false,
            clearAuth: mockClearAuth,
            setUser: vi.fn(),
            isAuthenticated: true,
        } as unknown as ReturnType<typeof useAuthUser>);

        vi.mocked(authApi.signOut).mockResolvedValue({ success: true });

        render(<Sidebar />);

        const logoutButton = screen.getByRole("button", {
            name: /ログアウト/i,
        });
        await user.click(logoutButton);

        await waitFor(() => {
            expect(authApi.signOut).toHaveBeenCalledTimes(1);
            // 💡 重要: キャッシュクリアの強制 (ID 1-8) の証明
            expect(mockQueryClient.clear).toHaveBeenCalled();
            expect(mockClearAuth).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith("ログアウトしました");
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    it("ID 1-8: [異常系] ログアウト API が失敗した場合、キャッシュクリアを中断して現在のセッション状態を維持すること", async () => {
        const user = userEvent.setup();
        const mockClearAuth = vi.fn();

        vi.mocked(useAuthUser).mockReturnValue({
            user: mockUser,
            isInitialLoading: false,
            clearAuth: mockClearAuth,
            setUser: vi.fn(),
            isAuthenticated: true,
        } as unknown as ReturnType<typeof useAuthUser>);

        // 💡 ログアウト失敗をシミュレート
        vi.mocked(authApi.signOut).mockResolvedValue({
            success: false,
            error: {
                type: "SYSTEM_ERROR",
                message: "ログアウトに失敗しました。",
            },
        });

        render(<Sidebar />);

        const logoutButton = screen.getByRole("button", {
            name: /ログアウト/i,
        });
        const clickPromise = user.click(logoutButton);

        // 💡 連打防止の検証
        await waitFor(() => {
            expect(logoutButton).toBeDisabled();
        });

        await clickPromise;

        await waitFor(() => {
            expect(authApi.signOut).toHaveBeenCalledTimes(1);
            // 💡 判定: 失敗時はクリアを実行せず、状態を保護していることを証明
            expect(mockQueryClient.clear).not.toHaveBeenCalled();
            expect(mockClearAuth).not.toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith(
                "ログアウトに失敗しました。",
            );
            expect(logoutButton).not.toBeDisabled();
        });
    });

    it("ID 1-14: [UX] ハイドレーション保護：認証初期化中 (isInitialLoading) は UI を描画せず、ログイン/ログアウトボタンのチラつきを防止すること", () => {
        vi.mocked(useAuthUser).mockReturnValue({
            user: null,
            isInitialLoading: true,
            clearAuth: vi.fn(),
            setUser: vi.fn(),
            isAuthenticated: false,
        } as unknown as ReturnType<typeof useAuthUser>);

        render(<Sidebar />);

        // 💡 判定: ロード中の「沈黙」を検証することで、ハイドレーション時の状態不整合表示を防止できていることを証明
        expect(
            screen.queryByRole("button", { name: /ログアウト/i }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /ログイン/i }),
        ).not.toBeInTheDocument();
    });
});
