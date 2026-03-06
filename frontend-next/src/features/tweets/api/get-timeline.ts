import { createClient } from "@/lib/supabase/client";
import { tweetSchema, type TweetDomain } from "@/lib/schemas";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { APP_CONFIG } from "@/constants/config";

/**
 * タイムライン取得用の Repository 関数
 *
 * 最新のツイートを取得し、投稿者情報も結合します。
 * cursor が指定されている場合、その日時より古い投稿を取得します (ページネーション)。
 */
export async function getTimeline(cursor?: string): Promise<{
    data: TweetDomain[] | null;
    nextCursor: string | null;
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
        user_likes:likes(user_id),
        replies_count:tweets!parent_id(count)
      `,
        );

        // メインタイムラインには親がない投稿 (トップレベルツイート) のみを表示
        query = query.is("parent_id", null);

        // cursor があればそれ以前のデータを取得 (created_at で比較)
        if (cursor) {
            query = query.lt("created_at", cursor);
        }

        // ログインユーザーがいる場合のみ、自分のいいねを絞り込む
        if (userId) {
            query = query.eq("user_likes.user_id", userId);
        } else {
            // 未ログインの場合は空を返すようにする (UUIDとして有効な形式のダミー)
            query = query.eq("user_likes.user_id", "00000000-0000-0000-0000-000000000000");
        }

        const { data, error } = await query
            .order("created_at", { ascending: false })
            .limit(APP_CONFIG.TWEETS_PER_PAGE);

        if (error) {
            return { data: null, nextCursor: null, error: mapSupabaseError(error) };
        }

        // 3. データの「検品 (パース)」と変換
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedData = (data as any[]).map((tweet) => {
            return tweetSchema.parse({
                ...tweet,
                likes_count: tweet.likes_count?.[0]?.count ?? 0,
                is_liked: (tweet.user_likes?.length ?? 0) > 0,
                replies_count: tweet.replies_count?.[0]?.count ?? 0,
            });
        });

        // 次の読み込みのためのカーソルを決定 (最後の要素の作成日時)
        const nextCursor =
            parsedData.length > 0
                ? parsedData[parsedData.length - 1].created_at
                : null;

        return { data: parsedData, nextCursor, error: null };
    } catch (error) {
        // 予期せぬエラー (Zod パース失敗など) もドメインエラーへ変換
        return { data: null, nextCursor: null, error: mapSupabaseError(error) };
    }
}
