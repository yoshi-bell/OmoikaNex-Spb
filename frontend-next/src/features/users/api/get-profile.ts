"use server";

import { 
    userSchema, 
    type UserDomain 
} from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

/**
 * プロフィール画面用のユーザー基本データ型 (軽量化版)
 */
export interface UserProfileResponse {
    user: UserDomain & {
        following_count: number;
        follower_count: number;
    };
}

/**
 * プロフィール基本情報を取得する純粋なロジック (Repository 内部用)
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

    // 3. ドメインモデルへのマッピング
    const userDomain = userSchema.parse({
        ...userRaw,
        is_following: isFollowing,
    });

    return {
        user: {
            ...userDomain,
            following_count: followingRes.count || 0,
            follower_count: followerRes.count || 0,
        },
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
