"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/features/auth/api/auth'
import { PostTweetForm } from '@/features/tweets/components/PostTweetForm'
import { toast } from 'sonner'

/**
 * サイドバー・コンポーネント (ダークモード仕様)
 * 
 * 見本画像に基づき、ロゴ「SHARE」、ナビゲーション、
 * および「シェア」フォームを垂直に配置。
 */
export function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    const { success, error } = await authApi.signOut()
    if (success) {
      toast.success('ログアウトしました')
      router.push('/login')
      router.refresh()
    } else {
      toast.error(error?.message || 'ログアウトに失敗しました')
    }
  }

  return (
    <aside className="flex h-full flex-col px-6 py-6">
      {/* ロゴ: 左上に太字で SHARE */}
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tighter text-white">SHARE</h1>
      </div>

      {/* ナビゲーション */}
      <nav className="space-y-4">
        <Link
          href="/"
          className="flex items-center gap-4 text-xl font-bold text-white transition-opacity hover:opacity-70"
        >
          <Image src="/images/home.png" alt="ホーム" width={28} height={28} className="invert" />
          ホーム
        </Link>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 text-xl font-bold text-white transition-opacity hover:opacity-70"
        >
          <Image src="/images/logout.png" alt="ログアウト" width={28} height={28} className="invert" />
          ログアウト
        </button>
      </nav>

      {/* シェアフォーム (ナビゲーションの直下) */}
      <div className="mt-10">
        <PostTweetForm />
      </div>
    </aside>
  )
}
