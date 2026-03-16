import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postTweet } from "@/features/tweets/api/post-tweet";
import { TweetFormType } from "@/lib/schemas";
import { toast } from "sonner";

/**
 * ツイート投稿用のカスタムフック
 *
 * 投稿成功時に 'timeline' キーのキャッシュを無効化することで、
 * タイムラインの自動再取得（画面への即時反映）を実現します。
 */
export function usePostTweet() {
    const queryClient = useQueryClient();

    return useMutation({
        // ミューテーション関数: Repository を呼び出す
        mutationFn: (values: TweetFormType) => postTweet(values),

        // 成功時の処理
        onSuccess: (result, variables) => {
            if (result.success) {
                // 返信かどうかに応じてメッセージを切り替える
                const message = variables.parent_id
                    ? "返信しました"
                    : "シェアしました";
                toast.success(message);

                // 関連する全てのクエリを無効化して最新化する
                queryClient.invalidateQueries({ queryKey: ["timeline"] });
                queryClient.invalidateQueries({ queryKey: ["tweets"] });
                queryClient.invalidateQueries({ queryKey: ["profile"] });
            } else {
                toast.error(result.error?.message || "投稿に失敗しました");
            }
        },

        // 通信エラー自体のハンドリング
        onError: (error) => {
            console.error("Mutation Error:", error);
            toast.error("予期せぬエラーが発生しました");
        },
    });
}
