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
        const { error } = await supabase
            .from("tweets")
            .delete()
            .eq("id", tweetId);

        if (error) {
            return { success: false, error: mapSupabaseError(error) };
        }

        return { success: true, error: null };
    } catch (error) {
        return { success: false, error: mapSupabaseError(error) };
    }
}
