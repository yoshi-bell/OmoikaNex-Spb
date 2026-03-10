import { createClient } from "@/lib/supabase/client";
import { tweetSchema, type TweetDomain } from "@/lib/schemas";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { TweetId } from "@/types/brands";
import { APP_CONFIG } from "@/constants/config";

/**
 * API から返却される生のツイート構造の型定義
 * (PostgREST のリレーション結合結果を安全に扱うため)
 */
type RawTweetData = {
    id: number;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    user: {
        id: string;
        name: string;
        user_follows: { follower_id: string }[];
    } | null;
    likes_count: { count: number }[];
    user_likes: { user_id: string }[];
    replies_count: { count: number }[];
};

/**
 * 特定のツイート詳細を取得する Repository 関数
 */
export async function getTweetDetail(tweetId: TweetId): Promise<{
    data: TweetDomain | null;
    error: AppError | null;
}> {
    const supabase = createClient();

    try {
        // 1. ログインユーザー情報の取得
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;

        // 2. クエリの構築 (user_follows を結合)
        let query = supabase
            .from("tweets")
            .select(`
                *,
                user:users(
                    *,
                    user_follows:follows!followee_id(follower_id)
                ),
                likes_count:likes(count),
                user_likes:likes(user_id),
                replies_count:tweets!parent_id(count)
            `)
            .eq("id", tweetId);

        // 自分自身のフォロー関係のみを絞り込む
        if (userId) {
            query = query.eq("user.user_follows.follower_id", userId);
        } else {
            query = query.eq("user.user_follows.follower_id", "00000000-0000-0000-0000-000000000000");
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
            return { data: null, error: mapSupabaseError(error) };
        }

        if (!data) {
            return { data: null, error: null };
        }

        const raw = data as unknown as RawTweetData;

        // 3. ドメイン型への変換
        const parsedTweet = tweetSchema.parse({
            ...raw,
            likes_count: raw.likes_count?.[0]?.count ?? 0,
            is_liked: (raw.user_likes?.length ?? 0) > 0,
            replies_count: raw.replies_count?.[0]?.count ?? 0,
            is_following: (raw.user?.user_follows?.length ?? 0) > 0,
        });

        return { data: parsedTweet, error: null };
    } catch (error) {
        return { data: null, error: mapSupabaseError(error) };
    }
}

/**
 * 特定のツイートに対する返信一覧を取得する Repository 関数 (無限スクロール対応)
 */
export async function getTweetReplies(
    tweetId: TweetId,
    cursor?: string
): Promise<{
    data: TweetDomain[] | null;
    nextCursor: string | null;
    error: AppError | null;
}> {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        let query = supabase
            .from("tweets")
            .select(`
                *,
                user:users(
                    *,
                    user_follows:follows!followee_id(follower_id)
                ),
                likes_count:likes(count),
                user_likes:likes(user_id),
                replies_count:tweets!parent_id(count)
            `)
            .eq("parent_id", tweetId);

        if (userId) {
            query = query.eq("user.user_follows.follower_id", userId);
        } else {
            query = query.eq("user.user_follows.follower_id", "00000000-0000-0000-0000-000000000000");
        }

        if (cursor) {
            query = query.lt("created_at", cursor);
        }

        const { data, error } = await query
            .order("created_at", { ascending: false })
            .limit(APP_CONFIG.TWEETS_PER_PAGE);

        if (error) {
            return { data: null, nextCursor: null, error: mapSupabaseError(error) };
        }

        const rawData = data as unknown as RawTweetData[];

        // 各ツイートをパースして変換
        const parsedData = rawData.map((raw) => {
            return tweetSchema.parse({
                ...raw,
                likes_count: raw.likes_count?.[0]?.count ?? 0,
                is_liked: (raw.user_likes?.length ?? 0) > 0,
                replies_count: raw.replies_count?.[0]?.count ?? 0,
                is_following: (raw.user?.user_follows?.length ?? 0) > 0,
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
