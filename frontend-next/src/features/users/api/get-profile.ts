"use server";

import { 
    userSchema, 
    tweetSchema, 
    type UserDomain, 
    type TweetDomain 
} from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

/**
 * プロフィール画面用のユーザー詳細データ型
 */
export interface UserProfileResponse {
    user: UserDomain & {
        following_count: number;
        follower_count: number;
    };
    tweets: TweetDomain[];
}

/**
 * 取得した生のツイートデータの構造を定義
 * (TypeScript の推論が困難な複雑なリレーションを型安全に扱うため)
 */
interface RawProfileTweet {
    id: number;
    user_id: string;
    parent_id: number | null;
    content: string;
    created_at: string;
    updated_at: string;
    user: Record<string, unknown> | null;
    likes_count: { count: number }[];
    replies_count: { count: number }[];
}

/**
 * プロフィール情報を取得する純粋なロジック (Repository 内部用)
 */
export async function fetchUserProfile(
    supabase: SupabaseClient<Database>,
    userId: string
): Promise<UserProfileResponse> {
    // 1. ユーザー基本情報の取得
    const { data: userRaw, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (userError || !userRaw) {
        throw new Error(userError?.message || "User not found");
    }

    // 2. 統計カウントと、ログインユーザー自身の情報を並列取得
    const [{ data: authData }, followingRes, followerRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("followee_id", userId),
    ]);

    const authUser = authData?.user;

    // ログインユーザーがこのユーザーをフォローしているか確認
    let isFollowing = false;
    if (authUser && authUser.id !== userId) {
        const { data: followRecord } = await supabase
            .from("follows")
            .select("*")
            .eq("follower_id", authUser.id)
            .eq("followee_id", userId)
            .maybeSingle();
        isFollowing = !!followRecord;
    }

    // 3. ユーザー投稿一覧の取得
    const { data, error: tweetsError } = await supabase
        .from("tweets")
        .select(`
            *,
            user:users(*),
            likes_count:likes(count),
            replies_count:tweets!parent_id(count)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (tweetsError) {
        throw new Error(tweetsError.message);
    }

    // 不透明なレスポンスデータをインターフェースへ安全にキャスト
    const tweetsRaw = (data as unknown as RawProfileTweet[]) || [];

    // いいね状態を取得 (今表示するツイートのみに絞り込んで N+1 問題を予防)
    let myLikes: number[] = [];
    if (authUser && tweetsRaw.length > 0) {
        const currentTweetIds = tweetsRaw.map(t => t.id);
        const { data: likes } = await supabase
            .from("likes")
            .select("tweet_id")
            .eq("user_id", authUser.id)
            .in("tweet_id", currentTweetIds);
        myLikes = likes?.map(l => l.tweet_id) || [];
    }

    // 4. ドメインモデルへのマッピング
    const userDomain = userSchema.parse({
        ...userRaw,
        is_following: isFollowing,
    });

    const tweetsDomain = tweetsRaw.map(tweet => {
        return tweetSchema.parse({
            ...tweet,
            likes_count: tweet.likes_count?.[0]?.count || 0,
            replies_count: tweet.replies_count?.[0]?.count || 0,
            is_liked: myLikes.includes(tweet.id),
            is_following: false 
        });
    });

    return {
        user: {
            ...userDomain,
            following_count: followingRes.count || 0,
            follower_count: followerRes.count || 0,
        },
        tweets: tweetsDomain,
    };
}

/**
 * プロフィール取得 (Server Side 専用 - cache対応)
 */
export const getUserProfile = cache(async (
    userId: string
): Promise<UserProfileResponse> => {
    const supabase = await createClient();
    return fetchUserProfile(supabase, userId);
});
