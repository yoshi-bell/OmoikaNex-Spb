"use server";

import { 
    userSchema, 
    tweetSchema, 
    type UserDomain, 
    type TweetDomain 
} from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

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
 * 特定のユーザーのプロフィール情報と投稿一覧を取得する (Repository - Server Side)
 * 将来の Laravel 移行 (Phase B) を見据え、内部でデータソース（現在は Supabase）を完全に隠蔽します。
 * 
 * @param userId 取得対象のユーザーID
 * @returns ユーザー詳細とツイート一覧
 */
export const getUserProfile = cache(async (
    userId: string
): Promise<UserProfileResponse> => {
    // 内部でひっそりとサーバー用クライアントを生成 (UI側には意識させない)
    const supabase = await createClient();

    // 1. ユーザー基本情報の取得
    const { data: userRaw, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (userError || !userRaw) {
        throw new Error(userError?.message || "User not found");
    }

    // 2. フォロー・フォロワー数のカウント (並列実行)
    const [followingRes, followerRes] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("followee_id", userId),
    ]);

    // 3. ユーザー投稿一覧の取得
    // タイムラインと同様のロジックで、リレーションデータを含めて取得
    const { data: tweetsRaw, error: tweetsError } = await supabase
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

    // ログインユーザー自身の情報を取得 (いいね状態の判定用)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    // いいね状態を取得 (今表示するツイートのみに絞り込んで N+1 問題を予防)
    let myLikes: number[] = [];
    if (authUser && tweetsRaw && tweetsRaw.length > 0) {
        const currentTweetIds = tweetsRaw.map(t => t.id);
        const { data: likes } = await supabase
            .from("likes")
            .select("tweet_id")
            .eq("user_id", authUser.id)
            .in("tweet_id", currentTweetIds);
        myLikes = likes?.map(l => l.tweet_id) || [];
    }

    // 4. ドメインモデルへのマッピング
    const userDomain = userSchema.parse(userRaw);
    const tweetsDomain = (tweetsRaw || []).map(tweet => {
        return tweetSchema.parse({
            ...tweet,
            likes_count: tweet.likes_count?.[0]?.count || 0,
            replies_count: tweet.replies_count?.[0]?.count || 0,
            is_liked: myLikes.includes(tweet.id),
            // プロフィール画面では常にそのユーザーの投稿なので、フォロー状態は外部から制御するか
            // 必要に応じてここで解決する
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
});
