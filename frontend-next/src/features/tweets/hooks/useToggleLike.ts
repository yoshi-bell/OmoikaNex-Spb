import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { toggleLike } from "@/features/tweets/api/toggle-like";
import { TweetId } from "@/types/brands";
import { type TweetDomain } from "@/lib/schemas";
import { toast } from "sonner";
import { AppError } from "@/types/error";

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

            // 1. タイムライン (ホーム画面) の更新
            const previousTimeline = queryClient.getQueryData<
                InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }>
            >(["timeline"]);

            if (previousTimeline) {
                queryClient.setQueryData<
                    InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }>
                >(["timeline"], {
                    ...previousTimeline,
                    pages: previousTimeline.pages.map((page) => ({
                        ...page,
                        data: page.data.map((t) => updateTweet(t, tweetId)),
                    })),
                });
            }

            // 2. 単一ツイート詳細 ["tweets", tweetId] の更新
            const previousDetail = queryClient.getQueryData<{
                data: TweetDomain | null;
                error: AppError | null;
            }>(["tweets", tweetId]);

            if (previousDetail?.data) {
                queryClient.setQueryData(["tweets", tweetId], {
                    ...previousDetail,
                    data: updateTweet(previousDetail.data, tweetId),
                });
            }

            // 3. 返信一覧など、'tweets' プレフィックスを持つ無限スクロールキャッシュを一括更新
            queryClient.setQueriesData<
                InfiniteData<{ data: TweetDomain[]; nextCursor?: string | null }>
            >(
                { queryKey: ["tweets"] },
                (old) => {
                    // pages を持たない (単一詳細クエリなどの) キャッシュは無視する
                    if (!old || !old.pages) return old;

                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data?.map((t) => updateTweet(t, tweetId)) || [],
                        })),
                    };
                }
            );

            return { previousTimeline, previousDetail };
        },

        onError: (_err, tweetId, context) => {
            if (context?.previousTimeline) {
                queryClient.setQueryData(["timeline"], context.previousTimeline);
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(["tweets", tweetId], context.previousDetail);
            }
            toast.error("「いいね」の反映に失敗しました");
        },

        onSettled: (_data, _error, tweetId) => {
            queryClient.invalidateQueries({ queryKey: ["timeline"] });
            queryClient.invalidateQueries({ queryKey: ["tweets", tweetId] });
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
        },
    });
}
