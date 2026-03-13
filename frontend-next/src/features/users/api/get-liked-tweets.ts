"use server";

import { createClient } from "@/lib/supabase/server";
import { tweetSchema, type TweetDomain } from "@/lib/schemas";

/**
 * Supabase の結合クエリが返す生のデータ構造を定義
 * (TypeScript の推論が困難な複雑なリレーションを型安全に扱うため)
 */
interface RawLikedItem {
    tweet: {
        id: number;
        user_id: string;
        content: string;
        created_at: string;
        updated_at: string;
        user: Record<string, unknown> | null;
        likes_count: { count: number }[];
        replies_count: { count: number }[];
    } | null;
}

/**
 * 特定のユーザーが「いいね」したツイート一覧を取得する (Server Action)
 * 
 * @param userId 対象のユーザーID
 * @returns いいねしたツイートの配列
 */
export async function getLikedTweets(userId: string): Promise<TweetDomain[]> {
    const supabase = await createClient();

    // 1. ログインユーザー自身の情報を取得
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // 2. 「いいね」テーブルを起点にツイート情報を取得
    const { data, error } = await supabase
        .from("likes")
        .select(`
            tweet:tweets (
                *,
                user:users(*),
                likes_count:likes(count),
                replies_count:tweets!parent_id(count)
            )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    if (!data) return [];

    // 不透明なレスポンスデータを、定義したインターフェースへ安全にキャスト
    const likedRaw = data as unknown as RawLikedItem[];

    // 3. ログインユーザー自身の「いいね」リストを取得
    let myLikes: number[] = [];
    if (authUser) {
        const { data: likes } = await supabase
            .from("likes")
            .select("tweet_id")
            .eq("user_id", authUser.id);
        myLikes = likes?.map(l => l.tweet_id) || [];
    }

    // 4. マッピングと検品 (Zod)
    return likedRaw
        .map((item) => {
            const rawTweet = item.tweet;
            if (!rawTweet) return null;

            // 定義された型に基づき、安全にオブジェクトを構築して Zod に渡す
            return tweetSchema.parse({
                ...rawTweet,
                likes_count: rawTweet.likes_count?.[0]?.count || 0,
                replies_count: rawTweet.replies_count?.[0]?.count || 0,
                is_liked: myLikes.includes(rawTweet.id),
                is_following: false,
            });
        })
        .filter((t): t is TweetDomain => t !== null);
}
