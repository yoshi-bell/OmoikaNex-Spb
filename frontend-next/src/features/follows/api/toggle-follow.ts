import { createClient } from "@/lib/supabase/client";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { UserId } from "@/types/brands";

/**
 * フォローのトグル (追加・解除) を行う Repository 関数
 *
 * ログインユーザーが対象のユーザーを既にフォローしていれば解除、
 * していなければフォローします。
 */
export async function toggleFollow(targetUserId: UserId): Promise<{
    success: boolean;
    isFollowing: boolean; // 処理後の状態
    error: AppError | null;
}> {
    const supabase = createClient();

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                isFollowing: false,
                error: mapSupabaseError(new Error("Unauthorized")),
            };
        }

        // 1. 既存のフォロー関係があるか確認
        const { data: existing } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("followee_id", targetUserId)
            .maybeSingle();

        if (existing) {
            // 2. 存在する場合は削除 (Unfollow)
            const { error } = await supabase
                .from("follows")
                .delete()
                .eq("id", existing.id);

            if (error) {
                return {
                    success: false,
                    isFollowing: true,
                    error: mapSupabaseError(error),
                };
            }
            return { success: true, isFollowing: false, error: null };
        } else {
            // 3. 存在しない場合は追加 (Follow)
            const { error } = await supabase.from("follows").insert({
                follower_id: user.id,
                followee_id: targetUserId,
            });

            if (error) {
                return {
                    success: false,
                    isFollowing: false,
                    error: mapSupabaseError(error),
                };
            }
            return { success: true, isFollowing: true, error: null };
        }
    } catch (error) {
        return {
            success: false,
            isFollowing: false,
            error: mapSupabaseError(error),
        };
    }
}
