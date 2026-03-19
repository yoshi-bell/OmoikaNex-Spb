import { render, screen, waitFor } from "@/test/utils";
import { TweetCard } from "../TweetCard";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "sonner";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { asTweetId, asUserId } from "@/types/brands";
import userEvent from "@testing-library/user-event";
import { TweetDomain } from "@/lib/schemas";
import { useDeleteTweet } from "@/features/tweets/hooks/useDeleteTweet";
import { useToggleLike } from "@/features/tweets/hooks/useToggleLike";
import { usePostTweet } from "@/features/tweets/hooks/usePostTweet";

// フックとライブラリのモック
vi.mock("@/hooks/useAuthUser");
vi.mock("@/features/tweets/hooks/useDeleteTweet");
vi.mock("@/features/tweets/hooks/useToggleLike");
vi.mock("@/features/tweets/hooks/usePostTweet");
vi.mock("sonner");
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

// window.confirm のモック
const mockConfirm = vi.spyOn(window, "confirm");

describe("TweetCard (アクションと権限の検証)", () => {
    const mockTweet: TweetDomain = {
        id: asTweetId(1),
        user_id: asUserId("user-1"),
        parent_id: null,
        content: "テストツイートです",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        replies_count: 5,
        likes_count: 10,
        is_liked: false,
        is_following: false,
        user: {
            id: asUserId("user-1"),
            name: "Test User",
            email: "test@example.com",
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: null,
            is_following: false,
        },
    };

    const mockDeleteMutate = vi.fn();
    const mockToggleLikeMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // useDeleteTweet のモック
        vi.mocked(useDeleteTweet).mockReturnValue({
            mutate: mockDeleteMutate,
            isPending: false,
        } as unknown as ReturnType<typeof useDeleteTweet>);

        // useToggleLike のモック
        vi.mocked(useToggleLike).mockReturnValue({
            mutate: mockToggleLikeMutate,
            isPending: false,
        } as unknown as ReturnType<typeof useToggleLike>);

        // usePostTweet のモック
        vi.mocked(usePostTweet).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        } as unknown as ReturnType<typeof usePostTweet>);
    });

    describe("未ログイン時のガード", () => {
        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: null,
                isAuthenticated: false,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
            } as unknown as ReturnType<typeof useAuthUser>);
        });

        it("ID 4-8: 「いいね」をクリックすると、トーストが表示されること", async () => {
            const user = userEvent.setup();
            render(<TweetCard tweet={mockTweet} />);
            await user.click(screen.getByRole("button", { name: "いいね" }));
            expect(toast.error).toHaveBeenCalledWith("ログインが必要です。");
            expect(mockToggleLikeMutate).not.toHaveBeenCalled();
        });

        it("ID 4-8: 「返信」をクリックすると、トーストが表示されること", async () => {
            const user = userEvent.setup();
            render(<TweetCard tweet={mockTweet} />);
            await user.click(screen.getByRole("button", { name: "返信" }));
            expect(toast.error).toHaveBeenCalledWith("ログインが必要です。");
        });
    });

    describe("ログイン済み（自分の投稿）", () => {
        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: { id: asUserId("user-1"), name: "Me", email: "m@e.com", created_at: "now", is_following: false },
                isAuthenticated: true,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
            } as unknown as ReturnType<typeof useAuthUser>);
        });

        it("ID 2-6: 自分の投稿には削除ボタンが表示され、実行時に確認ダイアログが出ること", async () => {
            const user = userEvent.setup();
            mockConfirm.mockReturnValue(true); // OK を選択

            render(<TweetCard tweet={mockTweet} />);

            const deleteButton = screen.getByRole("button", { name: /削除/i });
            expect(deleteButton).toBeInTheDocument();

            await user.click(deleteButton);

            expect(mockConfirm).toHaveBeenCalledWith("この投稿を削除してもよろしいですか？");
            expect(mockDeleteMutate).toHaveBeenCalledWith(mockTweet.id);
        });

        it("ID 2-6: 削除確認ダイアログでキャンセルした場合、削除が実行されないこと", async () => {
            const user = userEvent.setup();
            mockConfirm.mockReturnValue(false); // キャンセルを選択

            render(<TweetCard tweet={mockTweet} />);
            await user.click(screen.getByRole("button", { name: /削除/i }));

            expect(mockDeleteMutate).not.toHaveBeenCalled();
        });

        it("ID 4-1: いいねボタンをクリックすると toggleLike が呼ばれること", async () => {
            const user = userEvent.setup();
            render(<TweetCard tweet={mockTweet} />);

            await user.click(screen.getByRole("button", { name: "いいね" }));

            expect(mockToggleLikeMutate).toHaveBeenCalledWith(mockTweet.id);
        });

        it("ID 3-X: [異常系] 攻撃1：返信 API が失敗した場合、フォームは閉じられずエラー理由がトーストで表示されること", async () => {
            const user = userEvent.setup();
            const mockPostTweetMutate = vi.fn();
            
            // usePostTweetのモックを一時的に上書き
            vi.mocked(usePostTweet).mockReturnValue({
                mutate: mockPostTweetMutate,
                isPending: false,
            } as unknown as ReturnType<typeof usePostTweet>);

            // 返信(postTweet)が失敗するようモック
            mockPostTweetMutate.mockImplementation((values, { onSuccess }) => {
                if (onSuccess) {
                    onSuccess({ 
                        success: false, 
                        error: { type: "SYSTEM_ERROR", message: "返信に失敗しました" } 
                    }, values, undefined);
                }
            });

            render(<TweetCard tweet={mockTweet} />);

            // 返信フォームを開く
            await user.click(screen.getByRole("button", { name: "返信" }));

            // テキストを入力して送信
            const textarea = screen.getByPlaceholderText("返信をツイート");
            await user.type(textarea, "This will fail");
            await user.click(screen.getByRole("button", { name: "返信する" }));

            // 💡 判定: エラーメッセージが表示されていること
            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith("返信に失敗しました");
                // フォームが閉じられずに残っていること
                expect(textarea).toBeInTheDocument();
            });
        });
    });

    describe("ログイン済み（他人の投稿）", () => {
        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: { id: asUserId("other-user"), name: "Other", email: "o@e.com", created_at: "now", is_following: false },
                isAuthenticated: true,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
            } as unknown as ReturnType<typeof useAuthUser>);
        });

        it("ID 2-7: 他人の投稿には削除ボタンが表示されないこと", () => {
            render(<TweetCard tweet={mockTweet} />);
            expect(screen.queryByRole("button", { name: /削除/i })).not.toBeInTheDocument();
        });
    });
});
