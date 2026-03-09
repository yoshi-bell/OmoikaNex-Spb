import { createClient } from "@/lib/supabase/client";
import { tweetSchema, type TweetDomain } from "@/lib/schemas";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { TweetId } from "@/types/brands";

/**
 * 特定のツイート詳細を取得する Repository 関数
 */
export async function getTweetDetail(tweetId: TweetId): Promise<{
    data: TweetDomain | null;
    error: AppError | null;
}> {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from("tweets")
            .select(`
                *,
                user:users(*),
                likes_count:likes(count),
                user_likes:likes(user_id),
                replies_count:tweets!parent_id(count)
            `)
            .eq("id", tweetId)
            .single();

        if (error) {
            return { data: null, error: mapSupabaseError(error) };
        }

        // ログインユーザーの情報を取得 (いいね状態の判定用)
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // ドメイン型への変換
        const parsedTweet = tweetSchema.parse({
            ...data,
            likes_count: data.likes_count?.[0]?.count ?? 0,
            is_liked: data.user_likes?.some((l: any) => l.user_id === userId) ?? false,
            replies_count: data.replies_count?.[0]?.count ?? 0,
        });

        return { data: parsedTweet, error: null };
    } catch (error) {
        return { data: null, error: mapSupabaseError(error) };
    }
}

import { APP_CONFIG } from "@/constants/config";

/**
...
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
        let query = supabase
            .from("tweets")
            .select(`
                *,
                user:users(*),
                likes_count:likes(count),
                user_likes:likes(user_id),
                replies_count:tweets!parent_id(count)
            `)
            .eq("parent_id", tweetId);

        // cursor があればそれ以前のデータを取得
        if (cursor) {
            query = query.lt("created_at", cursor);
        }

        const { data, error } = await query
            .order("created_at", { ascending: false })
            .limit(APP_CONFIG.TWEETS_PER_PAGE);

        if (error) {
            return { data: null, nextCursor: null, error: mapSupabaseError(error) };
        }

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // 各ツイートをパースして変換
        const parsedData = (data as any[]).map((tweet) => {
            return tweetSchema.parse({
                ...tweet,
                likes_count: tweet.likes_count?.[0]?.count ?? 0,
                is_liked: tweet.user_likes?.some((l: any) => l.user_id === userId) ?? false,
                replies_count: tweet.replies_count?.[0]?.count ?? 0,
            });
        });

        // 次の読み込みのためのカーソルを決定
        const nextCursor =
            parsedData.length > 0
                ? parsedData[parsedData.length - 1].created_at
                : null;

        return { data: parsedData, nextCursor, error: null };
    } catch (error) {
        return { data: null, nextCursor: null, error: mapSupabaseError(error) };
    }
}
