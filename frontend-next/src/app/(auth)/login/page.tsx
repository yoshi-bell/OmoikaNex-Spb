import { LoginForm } from '@/features/auth/components/LoginForm'

/**
 * ログインページ
 * AuthLayout (共通紺背景・ヘッダー) の中で LoginForm をレンダリングする。
 */
export default function LoginPage() {
  return (
    <>
      {/* ページタイトル (ブラウザタブ用) */}
      <title>ログイン | OmoikaNex</title>
      
      {/* フォーム本体 */}
      <LoginForm />
    </>
  )
}
