import { createClient } from "@/lib/supabase/client";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { TweetId } from "@/types/brands";

/**
 * 「いいね」のトグル (追加・削除) を行う Repository 関数
 *
 * ログインユーザーが対象のツイートを既にいいねしていれば削除、
 * していなければ追加します。
 */
export async function toggleLike(tweetId: TweetId): Promise<{
    success: boolean;
    isLiked: boolean; // 処理後の状態
    error: AppError | null;
}> {
    const supabase = createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            // 未ログイン時はエラー
            return {
                success: false,
                isLiked: false,
                error: mapSupabaseError(new Error("Unauthorized")),
            };
        }

        // 1. 既存の「いいね」があるか確認
        const { data: existing } = await supabase
            .from("likes")
            .select("id")
            .eq("tweet_id", tweetId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (existing) {
            // 2. 存在する場合は削除 (Unlike)
            const { error } = await supabase
                .from("likes")
                .delete()
                .eq("id", existing.id);

            if (error) {
                return {
                    success: false,
                    isLiked: true,
                    error: mapSupabaseError(error),
                };
            }
            return { success: true, isLiked: false, error: null };
        } else {
            // 3. 存在しない場合は追加 (Like)
            const { error } = await supabase
                .from("likes")
                .insert({
                    tweet_id: tweetId,
                    user_id: user.id,
                });

            if (error) {
                return {
                    success: false,
                    isLiked: false,
                    error: mapSupabaseError(error),
                };
            }
            return { success: true, isLiked: true, error: null };
        }
    } catch (error) {
        return {
            success: false,
            isLiked: false,
            error: mapSupabaseError(error),
        };
    }
}
