import { createClient } from '@/lib/supabase/server'

/**
 * 疎通確認用トップページ
 * Supabase クライアントが正常に初期化できるか、
 * および環境変数が正しく読み込まれているかを検証します。
 */
export default async function Home() {
  const supabase = await createClient()
  
  // 現在のユーザー情報を取得（未ログインでもエラーにはならず null が返るはず）
  const { data: { user }, error } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 w-full max-w-2xl items-center justify-between font-mono text-sm border p-8 rounded-xl bg-white shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">OmoikaNex-Spb 接続テスト</h1>
        
        <div className="space-y-4">
          <section className="p-4 border rounded bg-gray-50">
            <h2 className="font-bold mb-2">📡 接続ステータス</h2>
            {error ? (
              <p className="text-red-500">❌ エラー発生: {error.message}</p>
            ) : (
              <p className="text-green-600">✅ Supabase クライアント初期化成功</p>
            )}
          </section>

          <section className="p-4 border rounded bg-gray-50">
            <h2 className="font-bold mb-2">🔐 認証状態</h2>
            {user ? (
              <p className="text-blue-600">👤 ログイン中: {user.email}</p>
            ) : (
              <p className="text-gray-500">ℹ️ 未ログイン（正常な初期状態です）</p>
            )}
          </section>

          <section className="p-4 border rounded bg-gray-50">
            <h2 className="font-bold mb-2">🌍 環境変数チェック</h2>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定'}</li>
              <li>KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定'}</li>
            </ul>
          </section>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          この画面が表示されていれば、Next.js 15 の起動と Supabase への通信基盤は正常です。
        </p>
      </div>
    </main>
  )
}
