import { render, screen } from "@/test/utils";
import { TweetCard } from "../TweetCard";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "sonner";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { asTweetId, asUserId } from "@/types/brands";
import userEvent from "@testing-library/user-event";
import { TweetDomain } from "@/lib/schemas";

// フックとライブラリのモック
vi.mock("@/hooks/useAuthUser");
vi.mock("sonner");
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

describe("TweetCard (未ログイン時のアクションガード)", () => {
    const mockTweet: TweetDomain = {
        id: asTweetId(1),
        user_id: asUserId("user-1"),
        parent_id: null,
        content: "テストツイートです",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        replies_count: 0,
        likes_count: 0,
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

    beforeEach(() => {
        vi.clearAllMocks();
        // 💡 共通の前提条件: 未ログイン状態にする
        // any を排除し、実際の ReturnType に準拠したモックを構成
        vi.mocked(useAuthUser).mockReturnValue({
            user: null,
            isAuthenticated: false,
            isInitialLoading: false,
            setUser: vi.fn(),
            clearAuth: vi.fn(),
        });
    });

    it("ID 4-8: 未ログイン時に「いいね」をクリックすると、ログインが必要です。トーストが表示されること", async () => {
        const user = userEvent.setup();
        render(<TweetCard tweet={mockTweet} />);

        // 💡 堅牢な取得: aria-label を使用
        const likeButton = screen.getByRole("button", { name: "いいね" });

        // 💡 振る舞い検証: user-event を使用
        await user.click(likeButton);

        // トーストの呼び出しを検証
        expect(toast.error).toHaveBeenCalledWith("ログインが必要です。");
    });

    it("ID 4-8: 未ログイン時に「返信」をクリックすると、返信フォームが開かずにトーストが表示されること", async () => {
        const user = userEvent.setup();
        render(<TweetCard tweet={mockTweet} />);

        // 堅牢な取得: aria-label を使用
        const replyButton = screen.getByRole("button", { name: "返信" });

        // 振る舞い検証
        await user.click(replyButton);

        // トーストの呼び出しを検証
        expect(toast.error).toHaveBeenCalledWith("ログインが必要です。");

        // 返信フォーム（送信ボタンなど）が表示されていないことを確認
        expect(
            screen.queryByRole("button", { name: /返信する/i }),
        ).not.toBeInTheDocument();
    });
});
