import { createClient } from "@/lib/supabase/client";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { TweetId } from "@/types/brands";

/**
 * ツイート削除用の Repository 関数
 *
 * 指定されたツイート ID のレコードを削除します。
 * RLS により、本人の投稿以外は削除できないよう DB レベルで保護されています。
 */
export async function deleteTweet(tweetId: TweetId): Promise<{
    success: boolean;
    error: AppError | null;
}> {
    const supabase = createClient();

    try {
        const { error, count } = await supabase
            .from("tweets")
            .delete({ count: "exact" })
            .eq("id", tweetId);

        if (error) {
            return { success: false, error: mapSupabaseError(error) };
        }

        // 💡 削除件数が 0 の場合は、権限不足（RLS）または存在しないと判断
        if (count === 0) {
            return {
                success: false,
                error: {
                    type: "PERMISSION_DENIED",
                    message: "この操作を行う権限がありません。",
                },
            };
        }

        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: mapSupabaseError(error) };
    }
}
