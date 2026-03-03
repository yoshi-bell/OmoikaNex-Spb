import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * サーバーコンポーネント用の Supabase クライアントを作成します。
 * ユーザーの Cookie を自動的に処理し、セッションを維持します。
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // サーバーコンポーネントから呼び出された場合の
            // Cookie セットエラーは無視して問題ありません（ライブラリの仕様通り）。
          }
        },
      },
    }
  )
}
