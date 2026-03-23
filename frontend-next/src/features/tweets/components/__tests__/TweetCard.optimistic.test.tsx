import { render, screen, waitFor } from "@/test/utils";
import { TweetCard } from "../TweetCard";
import { useTweetDetail } from "@/features/tweets/hooks/useTweetDetail";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getTweetDetail } from "@/features/tweets/api/get-tweet-detail";
import { toggleLike } from "@/features/tweets/api/toggle-like"; // 💡 修正：直接モック対象にする
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { asTweetId, asUserId, type TweetId } from "@/types/brands";
import { TweetDomain } from "@/lib/schemas";
import { QueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

// 💡 重要：指示に従い MSW は使わず、API リポジトリ層を直接モックする
vi.mock("@/features/tweets/api/toggle-like");
vi.mock("@/features/tweets/api/get-tweet-detail");

// useAuthUser と next/navigation はモック
vi.mock("@/hooks/useAuthUser");
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
    usePathname: () => "/",
}));

// sonner toast のモック
vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

/**
 * 💡 楽観的更新を検証するためのテスト用ラッパー
 */
function OptimisticTweetWrapper({ tweetId }: { tweetId: TweetId }) {
    const { data: result } = useTweetDetail(tweetId);
    if (!result?.data) return <div>Loading...</div>;
    return <TweetCard tweet={result.data} />;
}

describe("TweetCard Optimistic Updates (ID 4-1, 4-3: 楽観的更新の結合テスト)", () => {
    let queryClient: QueryClient;

    const mockTweetId = asTweetId(1);
    const mockUserId = asUserId("user-1");
    const mockTweet: TweetDomain = {
        id: mockTweetId,
        user_id: mockUserId,
        parent_id: null,
        content: "Optimistic Test Tweet",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes_count: 10,
        is_liked: false,
        replies_count: 0,
        is_following: false,
        user: {
            id: mockUserId,
            name: "Test User",
            email: "test@example.com",
            avatar_url: null,
            created_at: "now",
            is_following: false,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false, staleTime: Infinity },
                mutations: { retry: false },
            },
        });

        // 💡 ログイン状態の設定
        vi.mocked(useAuthUser).mockReturnValue({
            user: { id: mockUserId, name: "Me", email: "m@e.com", created_at: "now", is_following: false },
            isAuthenticated: true,
            isInitialLoading: false,
            setUser: vi.fn(),
            clearAuth: vi.fn(),
        } as unknown as ReturnType<typeof useAuthUser>);

        // 💡 取得 API のモック
        vi.mocked(getTweetDetail).mockResolvedValue({
            data: mockTweet,
            error: null,
        });

        // 💡 初期キャッシュのセットアップ
        queryClient.setQueryData(["tweets", mockTweetId], {
            data: mockTweet,
            error: null,
        });
    });

    it("ID 4-1: いいねボタンをクリックすると、APIの完了を待たずにUIのカウントが即座に +1 されること", async () => {
        const user = userEvent.setup();

        // 💡 解決策：手動で遅延させた Promise を返す（MSWの代わりにAPI関数を制御）
        vi.mocked(toggleLike).mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return { success: true, isLiked: true, error: null };
        });

        render(<OptimisticTweetWrapper tweetId={mockTweetId} />);

        // 初期表示を確認
        const likeButton = await screen.findByRole("button", { name: "いいね" });
        expect(likeButton).toHaveTextContent("10");

        // 実行
        await user.click(likeButton);

        // 💡 判定：API 完了前（setTimeout 中）に 11 になっていることを即座にアサート
        // これが成功すれば「楽観的更新」が真に機能している証明になる
        expect(likeButton).toHaveTextContent("11");

        // 最終的に API が完了した後も 11 であることを確認
        await waitFor(() => {
            expect(likeButton).toHaveTextContent("11");
        });
    });

    it("ID 4-3: [異常系] API が 500 エラーを返した場合、UI が一旦更新された後に元の状態へロールバックされること", async () => {
        const user = userEvent.setup();

        // 💡 失敗時も遅延させて、楽観的更新の瞬間を確保する
        vi.mocked(toggleLike).mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 200));
            return {
                success: false,
                isLiked: false,
                error: { type: "SYSTEM_ERROR", message: "Failed" },
            };
        });

        render(<OptimisticTweetWrapper tweetId={mockTweetId} />);

        const likeButton = await screen.findByRole("button", { name: "いいね" });
        expect(likeButton).toHaveTextContent("10");

        await user.click(likeButton);

        // 1. 瞬時に 11 になることを確認（楽観的更新）
        expect(likeButton).toHaveTextContent("11");

        // 2. 失敗後のロールバック (10 に戻る) を待機して確認
        await waitFor(() => {
            expect(likeButton).toHaveTextContent("10");
        });

        // 3. エラートーストの確認
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("反映に失敗しました"));
    });
});
