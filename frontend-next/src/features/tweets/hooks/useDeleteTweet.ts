import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTweet } from "@/features/tweets/api/delete-tweet";
import { TweetId } from "@/types/brands";
import { toast } from "sonner";

/**
 * ツイート削除用のカスタムフック
 *
 * 削除成功時に 'timeline' キャッシュを無効化し、最新のリストを再取得します。
 */
export function useDeleteTweet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tweetId: TweetId) => deleteTweet(tweetId),

        onSuccess: (result) => {
            if (result.success) {
                toast.success("投稿を削除しました");
                queryClient.invalidateQueries({ queryKey: ["timeline"] });
            } else {
                toast.error(result.error?.message || "削除に失敗しました");
            }
        },

        onError: (error) => {
            console.error("Delete Mutation Error:", error);
            toast.error("通信エラーが発生しました");
        },
    });
}
