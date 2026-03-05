import { createClient } from '@/lib/supabase/client'
import { tweetSchema, type TweetDomain } from '@/lib/schemas'
import { mapSupabaseError } from '@/lib/error-mapping'
import { AppError } from '@/types/error'

/**
 * タイムライン取得用の Repository 関数
 * 
 * 最新のツイートを 20 件取得し、投稿者情報も結合します。
 * 取得した生データは Zod スキーマ (tweetSchema) でパースし、ドメイン型へ変換します。
 */
export async function getTimeline(): Promise<{ 
  data: TweetDomain[] | null; 
  error: AppError | null 
}> {
  const supabase = createClient()

  try {
    // 1. Supabase からデータを取得
    // (* はツイートの全カラム、user:users(*) は投稿者の全カラムを結合して 'user' というキーに格納)
    const { data, error } = await supabase
      .from('tweets')
      .select(`
        *,
        user:users(*)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return { data: null, error: mapSupabaseError(error) }
    }

    // 2. データの「検品 (パース)」と変換
    // Zodで即座に安全なドメイン型へパースするため、ここは一時的にanyを許容する
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedData = (data as any[]).map((tweet) => tweetSchema.parse(tweet))

    return { data: parsedData, error: null }
  } catch (error) {
    // 予期せぬエラー (Zod パース失敗など) もドメインエラーへ変換
    return { data: null, error: mapSupabaseError(error) }
  }
}
