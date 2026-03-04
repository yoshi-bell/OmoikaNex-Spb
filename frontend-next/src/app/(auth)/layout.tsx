import { AuthHeader } from '@/components/layouts/AuthHeader'

/**
 * 認証系画面（ログイン・登録）の共通レイアウト
 * 見本画像に基づき、深い紺色（#1a202c 相当）の背景と、中央揃えのレイアウトを提供する。
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // min-h-screen で画面全体を覆い、背景色を指定
    <div className="flex min-h-screen flex-col bg-[#1a202c]">
      {/* 画面上部の共通ヘッダー */}
      <AuthHeader />
      
      {/* 中央のフォームエリア（上下左右中央揃え） */}
      <main className="flex flex-1 items-center justify-center p-4">
        {/* 子供要素（LoginForm や RegisterForm）がここに入る */}
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
}
