import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { toggleLike } from "@/features/tweets/api/toggle-like";
import { TweetId } from "@/types/brands";
import { type TweetDomain } from "@/lib/schemas";
import { toast } from "sonner";
import { UserProfileResponse } from "@/features/users/api/get-profile";

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
            await queryClient.cancelQueries({ queryKey: ["profile"] });
            await queryClient.cancelQueries({ queryKey: ["profile-likes"] });

            // --- 1. バックアップ (スナップショットの取得) ---

            // タイムライン (ホーム画面) 
            const previousTimeline = queryClient.getQueryData<
                InfiniteData<{ data: TweetDomain[]; nextCursor: string | null }>
            >(["timeline"]);

            // ツイート詳細および返信一覧 ["tweets"] 
            const previousTweets = queryClient.getQueriesData<unknown>({
                queryKey: ["tweets"],
            });

            // プロフィール画面 ["profile"] 
            const previousProfiles = queryClient.getQueriesData<UserProfileResponse>({
                queryKey: ["profile"],
            });

            // プロフィール「いいね」タブ ["profile-likes"] 
            const previousProfileLikes = queryClient.getQueriesData<TweetDomain[]>({
                queryKey: ["profile-likes"],
            });

            // --- 2. 楽観的更新の実行 ---

            // A. タイムラインの更新
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

            // B. tweets プレフィックス（詳細、返信一覧）の一括更新
            queryClient.setQueriesData<unknown>(
                { queryKey: ["tweets"] },
                // 💡 プロジェクト規約に基づき、複雑な多層構造の型定義を回避
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (old: any) => {
                    // 単一詳細データの場合
                    if (old && "data" in old && !old.pages) {
                        return { ...old, data: updateTweet(old.data, tweetId) };
                    }
                    // 無限スクロールデータ（返信一覧）の場合
                    if (old && old.pages) {
                        return {
                            ...old,
                            pages: old.pages.map(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (page: any) => ({
                                    ...page,
                                    data:
                                        page.data?.map((t: TweetDomain) =>
                                            updateTweet(t, tweetId)
                                        ) || [],
                                })
                            ),
                        };
                    }
                    return old;
                }
            );

            // C. プロフィール詳細の一括更新
            queryClient.setQueriesData<UserProfileResponse>(
                { queryKey: ["profile"] },
                (old) => {
                    if (!old || !old.tweets) return old;
                    return {
                        ...old,
                        tweets: old.tweets.map((t: TweetDomain) => updateTweet(t, tweetId)),
                    };
                }
            );

            // D. プロフィールいいね一覧の一括更新
            queryClient.setQueriesData<TweetDomain[]>(
                { queryKey: ["profile-likes"] },
                (old) => {
                    if (!old) return old;
                    return old.map((t) => updateTweet(t, tweetId));
                }
            );

            return { 
                previousTimeline, 
                previousTweets, 
                previousProfiles, 
                previousProfileLikes 
            };
        },

        onError: (_err, tweetId, context) => {
            // 💡 究極のロールバック：保存した全スナップショットを一括復元
            if (context?.previousTimeline) {
                queryClient.setQueryData(["timeline"], context.previousTimeline);
            }
            context?.previousTweets?.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });
            context?.previousProfiles?.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });
            context?.previousProfileLikes?.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data);
            });

            toast.error("「いいね」の反映に失敗しました");
        },

        onSettled: (_data, _error, tweetId) => {
            queryClient.invalidateQueries({ queryKey: ["timeline"] });
            queryClient.invalidateQueries({ queryKey: ["tweets", tweetId] });
            queryClient.invalidateQueries({ queryKey: ["tweets"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["profile-likes"] });
        },
    });
}
