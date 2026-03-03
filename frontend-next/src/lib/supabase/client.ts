import { createBrowserClient } from '@supabase/ssr'

/**
 * クライアントコンポーネント用の Supabase クライアントを作成します。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
