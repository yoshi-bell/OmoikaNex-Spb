import { createClient } from "@/lib/supabase/client";
import { tweetSchema, type TweetDomain } from "@/lib/schemas";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { APP_CONFIG } from "@/constants/config";

/**
 * タイムライン取得用の Repository 関数
 *
 * all: 全ユーザーの最新投稿
 * following: フォローしているユーザーの投稿のみ
 */
export async function getTimeline(
    cursor?: string,
    mode: "all" | "following" = "all",
): Promise<{
    data: TweetDomain[] | null;
    nextCursor: string | null;
    error: AppError | null;
}> {
    const supabase = createClient();

    try {
        // 1. ログインユーザー情報を取得
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;

        // 2. 基本クエリの構築
        // user_follows: ログインユーザー本人がその投稿者をフォローしているかを確認するためのサブクエリ
        let query = supabase.from("tweets").select(
            `
        *,
        user:users(
          *,
          user_follows:follows!followee_id(follower_id)
        ),
        likes_count:likes(count),
        user_likes:likes(user_id),
        replies_count:tweets!parent_id(count)
      `,
        );

        // 基本フィルタ: 親がない投稿 (トップレベルツイート) のみ
        query = query.is("parent_id", null);

        // 3. モードに応じた絞り込み (テックリード推奨の2段階クエリ方式)
        if (mode === "following") {
            if (!userId) {
                return { data: [], nextCursor: null, error: null };
            }

            // (1) フォローしているユーザーのID一覧を取得
            const { data: followData } = await supabase
                .from("follows")
                .select("followee_id")
                .eq("follower_id", userId);

            const followedIds = followData?.map((f) => f.followee_id) || [];

            if (followedIds.length === 0) {
                // フォロー中が0人なら即座に空結果を返す
                return { data: [], nextCursor: null, error: null };
            }

            // (2) 取得した ID 一覧に含まれるユーザーの投稿のみに絞り込む
            query = query.in("user_id", followedIds);
        }

        // 4. 共通のページネーションとフィルタ
        if (cursor) {
            query = query.lt("created_at", cursor);
        }

        // 自分の「いいね」判定用のフィルタ (サブクエリ内)
        if (userId) {
            query = query.eq("user_likes.user_id", userId);
            query = query.eq("user.user_follows.follower_id", userId);
        } else {
            const dummyId = "00000000-0000-0000-0000-000000000000";
            query = query.eq("user_likes.user_id", dummyId);
            query = query.eq("user.user_follows.follower_id", dummyId);
        }

        const { data, error } = await query
            .order("created_at", { ascending: false })
            .limit(APP_CONFIG.TWEETS_PER_PAGE);

        if (error) {
            return {
                data: null,
                nextCursor: null,
                error: mapSupabaseError(error),
            };
        }

        // 5. データの「検品 (パース)」と変換
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedData = (data as any[]).map((tweet) => {
            return tweetSchema.parse({
                ...tweet,
                likes_count: tweet.likes_count?.[0]?.count ?? 0,
                is_liked: (tweet.user_likes?.length ?? 0) > 0,
                replies_count: tweet.replies_count?.[0]?.count ?? 0,
                is_following: (tweet.user?.user_follows?.length ?? 0) > 0,
            });
        });

        const nextCursor =
            parsedData.length > 0
                ? parsedData[parsedData.length - 1].created_at
                : null;

        return { data: parsedData, nextCursor, error: null };
    } catch (error) {
        return { data: null, nextCursor: null, error: mapSupabaseError(error) };
    }
}
