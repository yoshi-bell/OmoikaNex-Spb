import { createClient } from '@/lib/supabase/client'
import { tweetFormSchema, type TweetFormType } from '@/lib/schemas'
import { mapSupabaseError } from '@/lib/error-mapping'
import { AppError } from '@/types/error'

/**
 * ツイート投稿用の Repository 関数
 * 
 * 入力された内容を検証済みデータとして受け取り、
 * Supabase Auth のセッションからユーザーIDを取得して投稿を保存します。
 */
export async function postTweet(payload: TweetFormType): Promise<{ 
  success: boolean; 
  error: AppError | null 
}> {
  const supabase = createClient()

  try {
    // 1. 現在のログインユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: mapSupabaseError(authError || new Error('Unauthorized')) }
    }

    // 2. データを挿入 (INSERT)
    const { error } = await supabase
      .from('tweets')
      .insert({
        content: payload.content,
        user_id: user.id,
        parent_id: payload.parent_id || null,
      })

    if (error) {
      return { success: false, error: mapSupabaseError(error) }
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: mapSupabaseError(error) }
  }
}
