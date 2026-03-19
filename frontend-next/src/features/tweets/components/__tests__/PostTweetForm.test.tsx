import { render, screen, waitFor } from "@/test/utils";
import { PostTweetForm } from "../PostTweetForm";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { usePostTweet } from "@/features/tweets/hooks/usePostTweet";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { asUserId } from "@/types/brands";

// モックの設定
vi.mock("@/features/tweets/hooks/usePostTweet");
vi.mock("@/hooks/useAuthUser");
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
    usePathname: vi.fn(),
}));
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// window.scrollTo のモック
window.scrollTo = vi.fn();

describe("PostTweetForm (ID 2-3 ~ 2-5, 2-9: 投稿機能テスト)", () => {
    const mockPush = vi.fn();
    const mockMutate = vi.fn();

    const mockUser = {
        id: asUserId("user-1"),
        name: "Test User",
        email: "test@example.com",
        avatar_url: null,
        created_at: "now",
        updated_at: null,
        is_following: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
            refresh: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
            back: vi.fn(),
            forward: vi.fn(),
        } as unknown as ReturnType<typeof useRouter>);

        vi.mocked(usePathname).mockReturnValue("/");

        vi.mocked(useAuthUser).mockReturnValue({
            user: mockUser,
            isAuthenticated: true,
            isInitialLoading: false,
            setUser: vi.fn(),
            clearAuth: vi.fn(),
        });

        // usePostTweet のデフォルトモック
        vi.mocked(usePostTweet).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
            data: undefined,
            error: null,
            isError: false,
            isIdle: true,
            isPaused: false,
            isSuccess: false,
            failureCount: 0,
            failureReason: null,
            mutateAsync: vi.fn(),
            reset: vi.fn(),
            status: "idle",
            variables: undefined,
            context: undefined,
        } as unknown as ReturnType<typeof usePostTweet>);
    });

    it("ID 2-3: 正常な入力で投稿ボタンを押下すると、mutate が呼ばれ、成功時にフォームがリセットされること", async () => {
        const user = userEvent.setup();
        
        // 成功時のコールバックをシミュレート
        mockMutate.mockImplementation((values, { onSuccess }) => {
            if (onSuccess) {
                onSuccess({ success: true, error: null }, values, undefined);
            }
        });

        render(<PostTweetForm />);

        const textarea = screen.getByPlaceholderText("いまどうしてる？");
        const submitButton = screen.getByRole("button", { name: "シェアする" });

        await user.type(textarea, "Hello World!");
        await user.click(submitButton);

        // 💡 判定: 1回だけ呼ばれることを厳格に検証
        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({ content: "Hello World!" }),
            expect.any(Object)
        );

        // 成功時の処理（フォームリセットとスクロール）を検証
        await waitFor(() => {
            expect(textarea).toHaveValue("");
            expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
        });
    });

    it("ID 2-X: [異常系] 空白文字列（スペースや改行のみ）を入力して連打しても、バリデーションで弾かれ mutate が絶対に呼ばれないこと", async () => {
        const user = userEvent.setup();
        render(<PostTweetForm />);

        const textarea = screen.getByPlaceholderText("いまどうしてる？");
        const submitButton = screen.getByRole("button", { name: "シェアする" });

        // 💡 悪意のある入力：全角スペースと改行のみ
        await user.type(textarea, "　　　\n\n   ");
        
        // 💡 チャタリング（物理的連打）をシミュレート
        await user.click(submitButton);
        await user.click(submitButton);
        await user.click(submitButton);

        // APIは1回も呼ばれてはいけない
        expect(mockMutate).not.toHaveBeenCalled();

        // フォームはリセットされず、悪意のある入力が残ったままであること
        expect(textarea).toHaveValue("　　　\n\n   ");
    });

    it("ID 2-3: ホーム画面以外から投稿した場合、ホームへリダイレクトされること", async () => {
        const user = userEvent.setup();
        vi.mocked(usePathname).mockReturnValue("/profile/user-1");
        
        mockMutate.mockImplementation((values, { onSuccess }) => {
            if (onSuccess) {
                onSuccess({ success: true, error: null }, values, undefined);
            }
        });

        render(<PostTweetForm />);

        await user.type(screen.getByPlaceholderText("いまどうしてる？"), "Redirect Test");
        await user.click(screen.getByRole("button", { name: "シェアする" }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/");
        });
    });

    it("ID 2-4: 141文字以上のテキストを入力すると、バリデーションエラーが表示されること", async () => {
        const user = userEvent.setup();
        render(<PostTweetForm />);

        const longText = "a".repeat(141);
        const textarea = screen.getByPlaceholderText("いまどうしてる？");
        
        await user.type(textarea, longText);
        await user.click(screen.getByRole("button", { name: "シェアする" }));

        // Zod によるバリデーションエラーメッセージを待機
        expect(await screen.findByText(/140文字以内で入力してください/i)).toBeInTheDocument();
        expect(mockMutate).not.toHaveBeenCalled();
    });

    it("ID 2-5: 投稿中はボタンが disabled になり、テキストが「送信中...」に変わること", async () => {
        vi.mocked(usePostTweet).mockReturnValue({
            mutate: mockMutate,
            isPending: true,
        } as unknown as ReturnType<typeof usePostTweet>);

        render(<PostTweetForm />);

        const submitButton = screen.getByRole("button", { name: "送信中..." });
        expect(submitButton).toBeDisabled();
        expect(screen.getByPlaceholderText("いまどうしてる？")).toBeDisabled();
    });

    it("未ログイン時は入力欄とボタンが disabled になること", () => {
        vi.mocked(useAuthUser).mockReturnValue({
            user: null,
            isAuthenticated: false,
            isInitialLoading: false,
            setUser: vi.fn(),
            clearAuth: vi.fn(),
        });

        render(<PostTweetForm />);

        expect(screen.getByPlaceholderText("ログインしてシェアしよう")).toBeDisabled();
        expect(screen.getByRole("button", { name: "シェアする" })).toBeDisabled();
    });

    it("ID 2-9: [異常系] API が失敗（result.success: false）を返した場合、フォームがリセットされず、エラーが表示されること", async () => {
        const user = userEvent.setup();
        
        // 失敗時のコールバックをシミュレート
        mockMutate.mockImplementation((values, { onSuccess }) => {
            if (onSuccess) {
                onSuccess({ 
                    success: false, 
                    error: { type: "PERMISSION_DENIED", message: "投稿に失敗しました" } 
                }, values, undefined);
            }
        });

        render(<PostTweetForm />);

        const textarea = screen.getByPlaceholderText("いまどうしてる？");
        await user.type(textarea, "Illegal Post");
        await user.click(screen.getByRole("button", { name: "シェアする" }));

        // 失敗時はフォームがリセットされない（入力内容が残る）ことを確認
        await waitFor(() => {
            expect(textarea).toHaveValue("Illegal Post");
        });
        
        // 💡 追加の防壁：沈黙せず、ユーザーにエラー理由を伝えること！
        expect(toast.error).toHaveBeenCalledWith("投稿に失敗しました");

        // リダイレクトもスクロールも発生しないはず
        expect(mockPush).not.toHaveBeenCalled();
        expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("ID 2-X: [異常系] 攻撃2：mutate 自体が例外（onError）を投げた場合でも、フォームがリセットされず入力が保持されること", async () => {
        const user = userEvent.setup();
        
        // onError のコールバックをシミュレート
        mockMutate.mockImplementation((values, { onError }) => {
            if (onError) {
                onError(new Error("Crash"), values, undefined);
            }
        });

        render(<PostTweetForm />);

        const textarea = screen.getByPlaceholderText("いまどうしてる？");
        await user.type(textarea, "Keep this text");
        await user.click(screen.getByRole("button", { name: "シェアする" }));

        // onSuccess に入らないため、リセットされないことを検証
        await waitFor(() => {
            expect(textarea).toHaveValue("Keep this text");
        });
    });
});
