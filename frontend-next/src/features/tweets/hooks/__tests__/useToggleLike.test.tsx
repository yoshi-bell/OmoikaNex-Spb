import { renderHook, waitFor } from "@testing-library/react";
import { useToggleLike } from "../useToggleLike";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider, InfiniteData } from "@tanstack/react-query";
import { toggleLike } from "@/features/tweets/api/toggle-like";
import { asTweetId, asUserId } from "@/types/brands";
import { TweetDomain } from "@/lib/schemas";
import React from "react";

// モックの設定
vi.mock("@/features/tweets/api/toggle-like");
vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
    },
}));

describe("useToggleLike (ID 4-1, 4-2, 4-3: 楽観的更新とロールバック)", () => {
    let queryClient: QueryClient;

    const mockTweetId = asTweetId(1);
    const mockInitialTweet: TweetDomain = {
        id: mockTweetId,
        user_id: asUserId("user-1"),
        parent_id: null,
        content: "Initial Content",
        created_at: "now",
        updated_at: "now",
        likes_count: 10,
        is_liked: false,
        replies_count: 0,
        is_following: false,
        user: { id: asUserId("user-1"), name: "User 1", email: "u1@e.com", created_at: "now", is_following: false },
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        // 💡 事前に詳細キャッシュをセット
        queryClient.setQueryData(["tweets", mockTweetId], {
            data: mockInitialTweet,
            error: null,
        });
    });

    it("ID 4-1: [楽観的UI] 未いいねのボタン押下時、API完了を待たずにUIが更新されること（タイムラインの複雑なキー）", async () => {
        const targetTweetId = asTweetId(2);
        const complexKey = ["timeline", "all", "user-1"]; // 💡 現実に近い複雑なキー
        const infiniteData: InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }> = {
            pages: [
                { data: [{ ...mockInitialTweet, id: targetTweetId }], nextCursor: "c1" },
            ],
            pageParams: [undefined],
        };
        queryClient.setQueryData(complexKey, infiniteData);

        vi.mocked(toggleLike).mockImplementation(() => new Promise(() => {}));
        const { result } = renderHook(() => useToggleLike(), { wrapper });

        result.current.mutate(targetTweetId);

        await waitFor(() => {
            const cachedTimeline = queryClient.getQueryData<typeof infiniteData>(complexKey);
            expect(cachedTimeline?.pages[0].data[0].likes_count).toBe(11);
        });
    });

    it("ID 4-1: [楽観的UI] 未いいねのボタン押下時、API完了を待たずにUIが更新されること（プロフィールの複雑なキー）", async () => {
        const postsKey = ["profile-posts", "user-1"];
        const initialPosts: InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }> = {
            pages: [{ data: [mockInitialTweet], nextCursor: null }],
            pageParams: [undefined],
        };
        queryClient.setQueryData(postsKey, initialPosts);

        vi.mocked(toggleLike).mockImplementation(() => new Promise(() => {}));
        const { result } = renderHook(() => useToggleLike(), { wrapper });

        result.current.mutate(mockTweetId);

        await waitFor(() => {
            const posts = queryClient.getQueryData<typeof initialPosts>(postsKey);
            expect(posts?.pages[0].data[0].likes_count).toBe(11);
        });
    });

    it("ID 4-3: [異常系] プロフィール「いいね」キャッシュも正しくロールバックされること", async () => {
        // 💡 修正：InfiniteData 構造に変更
        const likesKey = ["profile-likes", "user-1"];
        const initialLikesData: InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }> = {
            pages: [{ data: [mockInitialTweet], nextCursor: null }],
            pageParams: [undefined],
        };
        queryClient.setQueryData(likesKey, initialLikesData);

        // 💡 解決策：APIの完了タイミングを手動制御する（Deferred Promise）
        let resolveApi!: (value: Awaited<ReturnType<typeof toggleLike>>) => void;
        vi.mocked(toggleLike).mockImplementation(() => {
            return new Promise((resolve) => {
                resolveApi = resolve;
            });
        });

        const { result } = renderHook(() => useToggleLike(), { wrapper });
        result.current.mutate(mockTweetId);

        // 1. API完了「前」に、楽観的更新で 11 になることを確認
        await waitFor(() => {
            const temp = queryClient.getQueryData<typeof initialLikesData>(likesKey);
            expect(temp?.pages[0].data[0].likes_count).toBe(11);
        });

        // 2. ここで初めて API を「失敗」として完了させる
        resolveApi({
            success: false,
            isLiked: false,
            error: { type: "SYSTEM_ERROR", message: "Failed" },
        });

        // 3. ロールバックされて 10 に戻ることを確認
        await waitFor(() => {
            const rolledBack = queryClient.getQueryData<typeof initialLikesData>(likesKey);
            expect(rolledBack?.pages[0].data[0].likes_count).toBe(10);
        });
    });

    it("ID 4-1: いいねボタン押下時、詳細キャッシュが楽観的に +1 更新されること", async () => {
        vi.mocked(toggleLike).mockImplementation(() => new Promise(() => {}));
        const { result } = renderHook(() => useToggleLike(), { wrapper });
        result.current.mutate(mockTweetId);

        await waitFor(() => {
            const cachedData = queryClient.getQueryData<{ data: TweetDomain }>(["tweets", mockTweetId]);
            expect(cachedData?.data.likes_count).toBe(11);
            expect(cachedData?.data.is_liked).toBe(true);
        });
    });

    it("ID 4-2: 既にいいね済みのツイートを解除した際、楽観的に -1 更新されること", async () => {
        const likedTweet = { ...mockInitialTweet, is_liked: true, likes_count: 10 };
        queryClient.setQueryData(["tweets", mockTweetId], { data: likedTweet });

        vi.mocked(toggleLike).mockImplementation(() => new Promise(() => {}));
        const { result } = renderHook(() => useToggleLike(), { wrapper });
        result.current.mutate(mockTweetId);

        await waitFor(() => {
            const cachedData = queryClient.getQueryData<{ data: TweetDomain }>(["tweets", mockTweetId]);
            expect(cachedData?.data.likes_count).toBe(9);
            expect(cachedData?.data.is_liked).toBe(false);
        });
    });

    it("ID 4-3: [異常系] スレッド内の返信一覧キャッシュも正しくロールバックされること", async () => {
        // 💡 状況：スレッド画面の返信一覧（InfiniteData）にキャッシュがある
        const repliesKey = ["tweets", mockTweetId, "replies"];
        const initialRepliesData: InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }> = {
            pages: [{ data: [mockInitialTweet], nextCursor: null }],
            pageParams: [undefined],
        };
        queryClient.setQueryData(repliesKey, initialRepliesData);

        let resolveApi!: (value: Awaited<ReturnType<typeof toggleLike>>) => void;
        vi.mocked(toggleLike).mockImplementation(() => {
            return new Promise((resolve) => {
                resolveApi = resolve;
            });
        });

        const { result } = renderHook(() => useToggleLike(), { wrapper });
        result.current.mutate(mockTweetId);

        // 1. 楽観的更新の確認
        await waitFor(() => {
            const replies = queryClient.getQueryData<typeof initialRepliesData>(repliesKey);
            expect(replies?.pages[0].data[0].likes_count).toBe(11);
        });

        // 2. 失敗完了
        resolveApi({
            success: false,
            isLiked: false,
            error: { type: "SYSTEM_ERROR", message: "Failed" },
        });

        // 3. ロールバックの確認
        await waitFor(() => {
            const replies = queryClient.getQueryData<typeof initialRepliesData>(repliesKey);
            expect(replies?.pages[0].data[0].likes_count).toBe(10);
        });
    });
});
