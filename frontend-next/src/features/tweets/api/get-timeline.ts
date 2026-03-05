import { createClient } from "@/lib/supabase/client";
import { tweetSchema, type TweetDomain } from "@/lib/schemas";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";

/**
 * タイムライン取得用の Repository 関数
 *
 * 最新のツイートを 20 件取得し、投稿者情報も結合します。
 * 取得した生データは Zod スキーマ (tweetSchema) でパースし、ドメイン型へ変換します。
 */
export async function getTimeline(): Promise<{
    data: TweetDomain[] | null;
    error: AppError | null;
}> {
    const supabase = createClient();

    try {
        // 1. ログインユーザー情報を取得 (いいね状態の判定用)
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // 2. Supabase からデータを取得
        // (* はツイートの全カラム、user:users(*) は投稿者の全カラムを結合して 'user' というキーに格納)
        // likes: likesの総数
        // user_likes: ログインユーザー本人がいいねしているかを確認するためのサブクエリ
        let query = supabase.from("tweets").select(
            `
        *,
        user:users(*),
        likes_count:likes(count),
        user_likes:likes(user_id)
      `,
        );

        // ログインユーザーがいる場合のみ、自分のいいねを絞り込む
        if (userId) {
            query = query.eq("user_likes.user_id", userId);
        } else {
            // 未ログインの場合は空を返すようにする (UUIDとして有効な形式のダミー)
            query = query.eq("user_likes.user_id", "00000000-0000-0000-0000-000000000000");
        }

        const { data, error } = await query
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            return { data: null, error: mapSupabaseError(error) };
        }

        // 3. データの「検品 (パース)」と変換
        // Zodで即座に安全なドメイン型へパースするため、ここは一時的にanyを許容する
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedData = (data as any[]).map((tweet) => {
            return tweetSchema.parse({
                ...tweet,
                likes_count: tweet.likes_count?.[0]?.count ?? 0,
                is_liked: (tweet.user_likes?.length ?? 0) > 0,
            });
        });

        return { data: parsedData, error: null };
    } catch (error) {
        // 予期せぬエラー (Zod パース失敗など) もドメインエラーへ変換
        return { data: null, error: mapSupabaseError(error) };
    }
}
