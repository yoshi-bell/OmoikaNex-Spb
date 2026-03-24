"use server";

import { 
    tweetSchema, 
    type TweetDomain 
} from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { APP_CONFIG } from "@/constants/config";

/**
 * プロフィール画面用の投稿一覧を取得する (Server Action)
 * ページネーション（無限スクロール）に対応。
 */
export async function getUserTweets(
    userId: string,
    cursor?: string
): Promise<{
    data: TweetDomain[];
    nextCursor: string | null;
}> {
    const supabase = await createClient();

    // 1. ログインユーザー情報を取得
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // 2. クエリの構築
    let query = supabase
        .from("tweets")
        .select(`
            *,
            user:users(*),
            likes_count:likes(count),
            replies_count:tweets!parent_id(count)
        `)
        .eq("user_id", userId)
        .is("parent_id", null) // 親がない投稿のみ
        .order("created_at", { ascending: false })
        .limit(APP_CONFIG.TWEETS_PER_PAGE);

    // カーソルがある場合は、それより古いものを取得
    if (cursor) {
        query = query.lt("created_at", cursor);
    }

    const { data: tweetsRaw, error } = await query;

    if (error) {
        throw new Error(error.message);
    }

    if (!tweetsRaw || tweetsRaw.length === 0) {
        return { data: [], nextCursor: null };
    }

    // 3. ログインユーザー自身の「いいね」リストを取得
    let myLikes: number[] = [];
    if (authUser) {
        const currentTweetIds = tweetsRaw.map(t => t.id);
        const { data: likes } = await supabase
            .from("likes")
            .select("tweet_id")
            .eq("user_id", authUser.id)
            .in("tweet_id", currentTweetIds);
        myLikes = likes?.map(l => l.tweet_id) || [];
    }

    // 4. マッピングと検品 (Zod)
    const tweetsDomain = tweetsRaw.map(tweet => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = tweet as any; // Supabase の結合結果は複雑なため一時的に許容
        return tweetSchema.parse({
            ...t,
            likes_count: t.likes_count?.[0]?.count || 0,
            replies_count: t.replies_count?.[0]?.count || 0,
            is_liked: myLikes.includes(t.id),
            is_following: false 
        });
    });

    const nextCursor = tweetsDomain.length > 0 
        ? tweetsDomain[tweetsDomain.length - 1].created_at 
        : null;

    return {
        data: tweetsDomain,
        nextCursor,
    };
}
