import { Skeleton } from "@/components/ui/skeleton";

/**
 * ツイートカードのスケルトン表示 (読み込み中用)
 * TweetCard.tsx のレイアウト構造を忠実に再現
 */
export function TweetCardSkeleton() {
    return (
        <div className="flex gap-4 border-b border-slate-800 p-6">
            {/* アバター (左側) */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-800">
                <Skeleton className="h-full w-full bg-slate-700/50" />
            </div>

            {/* ツイート内容 (右側) */}
            <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {/* ユーザー名 */}
                        <Skeleton className="h-4 w-20 bg-slate-700/50" />
                        {/* ユーザーID */}
                        <Skeleton className="h-3 w-16 bg-slate-700/50" />
                    </div>
                </div>

                {/* 本文の模倣 (2行) */}
                <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-full bg-slate-700/50" />
                    <Skeleton className="h-4 w-2/3 bg-slate-700/50" />
                </div>

                {/* アクションエリア (いいね・返信ボタンの模倣) */}
                <div className="mt-5 flex items-center gap-12">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full bg-slate-700/50" />
                        <Skeleton className="h-3 w-4 bg-slate-700/50" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full bg-slate-700/50" />
                        <Skeleton className="h-3 w-4 bg-slate-700/50" />
                    </div>
                </div>
            </div>
        </div>
    );
}
