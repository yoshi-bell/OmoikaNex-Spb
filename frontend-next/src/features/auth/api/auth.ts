import { createClient } from '@/lib/supabase/client'
import { mapSupabaseError } from '@/lib/error-mapping'
import { LoginFormType, RegisterFormType } from '@/lib/schemas'
import { AppError } from '@/types/error'

/**
 * 認証 API (Repository 層)
 * 
 * Supabase と直接通信し、生のエラーをドメインエラーへ変換します。
 * UIコンポーネントはこれらの関数のみを呼び出します。
 */
export const authApi = {
  /**
   * サインアップ (新規登録)
   * Auth への登録に加え、メタデータとして 'name' を送信します。
   * (これが DB トリガーにより public.users へ同期されます)
   */
  async signUp(credentials: RegisterFormType): Promise<{ success: boolean; error?: AppError }> {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      })

      if (error) {
        return { success: false, error: mapSupabaseError(error) }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: mapSupabaseError(error) }
    }
  },

  /**
   * サインイン (ログイン)
   */
  async signIn(credentials: LoginFormType): Promise<{ success: boolean; error?: AppError }> {
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { success: false, error: mapSupabaseError(error) }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: mapSupabaseError(error) }
    }
  },

  /**
   * サインアウト (ログアウト)
   */
  async signOut(): Promise<{ success: boolean; error?: AppError }> {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: mapSupabaseError(error) }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: mapSupabaseError(error) }
    }
  },
}
