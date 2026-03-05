import { TweetDomain } from '@/lib/schemas'
import Image from 'next/image'

interface TweetCardProps {
  tweet: TweetDomain
}

/**
 * ツイートカード・コンポーネント (ダークモード仕様)
 * 
 * 仕様に基づき、白文字、境界線 border-slate-800、
 * および左揃えのアクションボタンを配置。
 */
export function TweetCard({ tweet }: TweetCardProps) {
  return (
    <div className="flex gap-4 border-b border-slate-800 p-6 transition-colors hover:bg-white/5">
      {/* ユーザーアイコン */}
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-800">
        <Image
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${tweet.user_id}`}
          alt={tweet.user?.name || 'User'}
          width={48}
          height={48}
        />
      </div>

      {/* ツイート内容 */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{tweet.user?.name || 'Unknown'}</span>
          <span className="text-sm text-slate-500">@{tweet.user_id.slice(0, 8)}</span>
          <span className="text-sm text-slate-600">·</span>
          {/* TODO: Relative time format */}
          <span className="text-sm text-slate-500">1時間</span>
        </div>
        
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-normal text-gray-100">
          {tweet.content}
        </p>

        {/* アクションエリア (仕様: 左揃え配置) */}
        <div className="mt-4 flex items-center gap-12 text-slate-500">
          {/* いいね */}
          <button className="group flex items-center gap-2 transition-colors hover:text-rose-500">
            <div className="rounded-full p-2 group-hover:bg-rose-500/10">
              <Image src="/images/heart.png" alt="Like" width={18} height={18} className="invert opacity-60 group-hover:opacity-100" />
            </div>
            <span className="text-xs font-medium">0</span>
          </button>

          {/* 削除 (バツマークのイメージ) */}
          <button className="group flex items-center gap-2 transition-colors hover:text-red-500">
            <div className="rounded-full p-2 group-hover:bg-red-500/10">
              <Image src="/images/cross.png" alt="Delete" width={18} height={18} className="invert opacity-60 group-hover:opacity-100" />
            </div>
            <span className="text-xs font-medium italic">削除</span>
          </button>
        </div>
      </div>
    </div>
  )
}
