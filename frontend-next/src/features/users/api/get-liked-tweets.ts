"use server";

import { createClient } from "@/lib/supabase/server";
import { tweetSchema, type TweetDomain } from "@/lib/schemas";
import { APP_CONFIG } from "@/constants/config";

/**
 * 特定のユーザーが「いいね」したツイート一覧を取得する (Server Action)
 * ページネーション（無限スクロール）に対応。
 */
export async function getLikedTweets(
    userId: string,
    cursor?: string
): Promise<{
    data: TweetDomain[];
    nextCursor: string | null;
}> {
    const supabase = await createClient();

    // 1. ログインユーザー自身の情報を取得
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // 2. 「いいね」テーブルを起点にツイート情報を取得
    let query = supabase
        .from("likes")
        .select(`
            created_at,
            tweet:tweets (
                *,
                user:users(*),
                likes_count:likes(count),
                replies_count:tweets!parent_id(count)
            )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(APP_CONFIG.TWEETS_PER_PAGE);

    // カーソルがある場合は、それより古い（前回の最後のいいね日時より前）ものを取得
    if (cursor) {
        query = query.lt("created_at", cursor);
    }

    const { data: likedRaw, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    if (!likedRaw || likedRaw.length === 0) {
        return { data: [], nextCursor: null };
    }

    // 3. ログインユーザー自身の「いいね」リストを取得 (自身のいいね状態を判定するため)
    let myLikes: number[] = [];
    if (authUser) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentTweetIds = likedRaw.map(item => (item as any).tweet?.id).filter(Boolean);
        const { data: likes } = await supabase
            .from("likes")
            .select("tweet_id")
            .eq("user_id", authUser.id)
            .in("tweet_id", currentTweetIds);
        myLikes = likes?.map(l => l.tweet_id) || [];
    }

    // 4. マッピングと検品 (Zod)
    const tweetsDomain = tweetsRaw
        .map((item) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawTweet = (item as any).tweet; // 結合結果の複雑な型解決のため一時的に許容
            if (!rawTweet) return null;

            return tweetSchema.parse({
                ...rawTweet,
                likes_count: rawTweet.likes_count?.[0]?.count || 0,
                replies_count: rawTweet.replies_count?.[0]?.count || 0,
                is_liked: myLikes.includes(rawTweet.id),
                is_following: false,
            });
        })
        .filter((t): t is TweetDomain => t !== null);


    // 次ページのカーソル（今回の最後のレコードの created_at）
    const nextCursor = likedRaw.length > 0 
        ? likedRaw[likedRaw.length - 1].created_at 
        : null;

    return {
        data: tweetsDomain,
        nextCursor,
    };
}
