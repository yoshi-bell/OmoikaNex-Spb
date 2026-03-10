import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { toggleFollow } from "@/features/follows/api/toggle-follow";
import { UserId } from "@/types/brands";
import { type TweetDomain } from "@/lib/schemas";
import { toast } from "sonner";
import { AppError } from "@/types/error";

/**
 * フォローのトグル (追加・解除) のためのカスタムフック
 *
 * 楽観的UI更新 (Optimistic Update) を採用しており、
 * タイムラインや詳細画面に表示されている該当ユーザーのフォロー状態を一括で更新します。
 */
export function useToggleFollow() {
    const queryClient = useQueryClient();

    // 共通の更新ロジック: ツイートオブジェクト内の投稿者のフォロー状態を書き換える
    const updateFollowState = (tweet: TweetDomain, targetUserId: UserId) => {
        if (tweet.user_id === targetUserId) {
            return {
                ...tweet,
                is_following: !tweet.is_following,
            };
        }
        return tweet;
    };

    return useMutation({
        networkMode: "always",
        mutationFn: async (targetUserId: UserId) => {
            const result = await toggleFollow(targetUserId);
            if (!result.success) {
                throw result.error;
            }
            return result;
        },

        onMutate: async (targetUserId: UserId) => {
            await queryClient.cancelQueries({ queryKey: ["timeline"] });
            await queryClient.cancelQueries({ queryKey: ["tweets"] });

            // 1. タイムライン (無限スクロール) の更新
            const previousTimelines = queryClient.getQueriesData<
                InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }>
            >({ queryKey: ["timeline"] });

            queryClient.setQueriesData<
                InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }>
            >(
                { queryKey: ["timeline"] },
                (old) => {
                    if (!old || !old.pages) return old;
                    return {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            data: page.data.map((t) => updateFollowState(t, targetUserId)),
                        })),
                    };
                }
            );

            // 2. 詳細画面 / 返信一覧の一括更新
            const previousTweets = queryClient.getQueriesData<
                InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }> |
                { data: TweetDomain | null; error: AppError | null }
            >({ queryKey: ["tweets"] });

            queryClient.setQueriesData<
                InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }> |
                { data: TweetDomain | null; error: AppError | null }
            >(
                { queryKey: ["tweets"] },
                (old) => {
                    if (!old) return old;

                    // (A) 無限スクロール形式 (返信一覧) の場合
                    if ("pages" in old) {
                        return {
                            ...old,
                            pages: old.pages.map((page) => ({
                                ...page,
                                data: page.data.map((t) => updateFollowState(t, targetUserId)),
                            })),
                        };
                    }

                    // (B) 単一オブジェクト形式 (ツイート詳細) の場合
                    if ("data" in old && old.data && !Array.isArray(old.data)) {
                        return {
                            ...old,
                            data: updateFollowState(old.data, targetUserId),
                        };
                    }

                    return old;
                }
            );

            return { previousTimelines, previousTweets };
        },

        onError: (_err, _userId, context) => {
            if (context?.previousTimelines) {
                context.previousTimelines.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            if (context?.previousTweets) {
                context.previousTweets.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error("フォローの反映に失敗しました");
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["timeline"] });
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
        },
    });
}
