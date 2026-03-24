import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { toggleLike } from "@/features/tweets/api/toggle-like";
import { TweetId } from "@/types/brands";
import { type TweetDomain } from "@/lib/schemas";
import { toast } from "sonner";

/**
 * 「いいね」トグルのためのカスタムフック
 *
 * 楽観的UI更新 (Optimistic Update) を採用しており、
 * ホーム画面 (無限スクロール) と詳細画面の両方のキャッシュを即座に更新します。
 */
export function useToggleLike() {
    const queryClient = useQueryClient();

    // 共通の更新ロジック: 単一のツイートオブジェクトを書き換える
    const updateTweet = (tweet: TweetDomain, targetId: TweetId) => {
        if (tweet.id === targetId) {
            const newIsLiked = !tweet.is_liked;
            return {
                ...tweet,
                is_liked: newIsLiked,
                likes_count: newIsLiked
                    ? tweet.likes_count + 1
                    : Math.max(0, tweet.likes_count - 1),
            };
        }
        return tweet;
    };

    return useMutation({
        networkMode: "always",
        mutationFn: async (tweetId: TweetId) => {
            const result = await toggleLike(tweetId);
            if (!result.success) {
                throw result.error;
            }
            return result;
        },

        onMutate: async (tweetId: TweetId) => {
            await queryClient.cancelQueries({ queryKey: ["timeline"] });
            await queryClient.cancelQueries({ queryKey: ["tweets"] });
            await queryClient.cancelQueries({ queryKey: ["profile-posts"] });
            await queryClient.cancelQueries({ queryKey: ["profile-likes"] });

            // --- 1. バックアップ (スナップショットの取得) ---
            // 💡 ポイント: 前方一致ですべての関連キャッシュを取得し、一括でバックアップ
            const previousTimelineData = queryClient.getQueriesData<
                InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }>
            >({ queryKey: ["timeline"] });

            const previousTweetsData = queryClient.getQueriesData<unknown>({
                queryKey: ["tweets"],
            });

            const previousProfilePostsData = queryClient.getQueriesData<
                InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }>
            >({ queryKey: ["profile-posts"] });

            const previousProfileLikesData = queryClient.getQueriesData<
                InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }>
            >({ queryKey: ["profile-likes"] });

            // --- 2. 楽観的更新の実行 ---

            // A. タイムラインの一括更新
            previousTimelineData.forEach(([queryKey, old]) => {
                if (!old) return;
                queryClient.setQueryData(queryKey, {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        data: page.data.map((t) => updateTweet(t, tweetId)),
                    })),
                });
            });

            // B. tweets プレフィックス（詳細、返信一覧）の一括更新
            previousTweetsData.forEach(([queryKey, old]) => {
                if (!old) return;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = old as any; // 結合結果の複雑な型解決のため一時的に許容

                if ("data" in data && !data.pages) {
                    queryClient.setQueryData(queryKey, {
                        ...data,
                        data: updateTweet(data.data, tweetId),
                    });
                } else if (data.pages) {
                    queryClient.setQueryData(queryKey, {
                        ...data,
                        pages: data.pages.map(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (page: any) => ({
                                ...page,
                                data: page.data?.map((t: TweetDomain) => updateTweet(t, tweetId)) || [],
                            })
                        ),
                    });
                }
            });

            // C. プロフィール投稿一覧の一括更新
            previousProfilePostsData.forEach(([queryKey, old]) => {
                if (!old) return;
                queryClient.setQueryData(queryKey, {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        data: page.data.map((t) => updateTweet(t, tweetId)),
                    })),
                });
            });

            // D. プロフィールいいね一覧の一括更新
            previousProfileLikesData.forEach(([queryKey, old]) => {
                if (!old) return;
                queryClient.setQueryData(queryKey, {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        data: page.data.map((t) => updateTweet(t, tweetId)),
                    })),
                });
            });

            return { 
                previousTimelineData, 
                previousTweetsData, 
                previousProfilePostsData, 
                previousProfileLikesData 
            };
        },

        onError: (_err, _tweetId, context) => {
            // ロールバック処理
            context?.previousTimelineData?.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });
            context?.previousTweetsData?.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });
            context?.previousProfilePostsData?.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });
            context?.previousProfileLikesData?.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });

            toast.error("「いいね」の反映に失敗しました");
        },

        onSettled: (_data, _error, tweetId) => {
            queryClient.invalidateQueries({ queryKey: ["timeline"] });
            queryClient.invalidateQueries({ queryKey: ["tweets", tweetId] });
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
            queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
            queryClient.invalidateQueries({ queryKey: ["profile-likes"] });
        },
    });
}
