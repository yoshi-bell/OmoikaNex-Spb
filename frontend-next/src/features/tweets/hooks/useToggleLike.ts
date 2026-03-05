import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike } from "@/features/tweets/api/toggle-like";
import { TweetId } from "@/types/brands";
import { type TweetDomain } from "@/lib/schemas";
import { toast } from "sonner";
import { AppError } from "@/types/error";

/**
 * 「いいね」トグルのためのカスタムフック
 *
 * 楽観的UI更新 (Optimistic Update) を採用しており、
 * API レスポンスを待たずに画面上の「いいね」状態を更新します。
 */
export function useToggleLike() {
    const queryClient = useQueryClient();

    return useMutation({
        // オフラインでも即座に実行（失敗）させるための設定
        networkMode: 'always',

        // ミューテーション関数
        mutationFn: async (tweetId: TweetId) => {
            const result = await toggleLike(tweetId);
            if (!result.success) {
                // 失敗時はエラーを投げることで onError を発動させる
                throw result.error;
            }
            return result;
        },

        // 1. 楽観的更新 (API 通信前)
        onMutate: async (tweetId: TweetId) => {
            // 送信中の再取得をキャンセル
            await queryClient.cancelQueries({ queryKey: ["timeline"] });

            // 現在のキャッシュのバックアップを取る
            const previousTimeline = queryClient.getQueryData<{
                data: TweetDomain[] | null;
                error: AppError | null;
            }>(["timeline"]);

            // キャッシュを直接書き換える (楽観的更新)
            if (previousTimeline?.data) {
                queryClient.setQueryData(["timeline"], {
                    ...previousTimeline,
                    data: previousTimeline.data.map((tweet) => {
                        if (tweet.id === tweetId) {
                            // 状態を反転させる
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
                    }),
                });
            }

            // バックアップをコンテキストとして返す (エラー時に使用)
            return { previousTimeline };
        },

        // 2. エラー時の処理 (ロールバック)
        onError: (_err, _tweetId, context) => {
            if (context?.previousTimeline) {
                queryClient.setQueryData(
                    ["timeline"],
                    context.previousTimeline,
                );
            }
            toast.error("「いいね」の反映に失敗しました");
        },

        // 3. 完了時の処理 (成功・失敗に関わらず再取得)
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["timeline"] });
        },
    });
}
