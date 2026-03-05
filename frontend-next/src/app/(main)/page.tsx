import { Timeline } from '@/features/tweets/components/Timeline'

/**
 * ホーム画面 (トップページ) - ダークモード仕様
 * 
 * ログイン後のメインコンテンツとしてタイムラインを表示。
 * ヘッダーは背景と同じ単色（bg-[#16181c]）で固定。
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ヘッダーエリア: 単色塗りつぶし固定 */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-[#16181c] px-6 py-4">
        <h1 className="text-xl font-bold text-white">ホーム</h1>
      </div>

      {/* タイムライン (右メインエリア) */}
      <Timeline />
    </div>
  )
}
