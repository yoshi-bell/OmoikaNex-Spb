"use client";

import { useTimeline } from "@/features/tweets/hooks/useTimeline";
import { TweetCard } from "./TweetCard";

/**
 * タイムライン・コンポーネント
 *
 * useTimeline フックを介して Server State (ツイート一覧) を取得し、
 * ローディング状態やエラー状態に応じた表示を行う。
 */
export function Timeline() {
    const { data: result, isLoading, isError, refetch } = useTimeline();

    // 1. ローディング状態の表示
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent" />
                <p className="text-gray-500 text-sm font-medium">
                    タイムラインを読み込み中...
                </p>
            </div>
        );
    }

    // 2. エラー発生時の表示 (AppError が返ってきた場合を含む)
    if (isError || result?.error) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-lg m-4">
                <p className="text-red-600 font-bold">
                    データの取得に失敗しました
                </p>
                <p className="text-red-500 text-sm mt-1">
                    {result?.error?.message ||
                        "ネットワークエラーが発生しました。"}
                </p>
                <button
                    onClick={() => refetch()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors"
                >
                    再試行する
                </button>
            </div>
        );
    }

    const tweets = result?.data || [];

    // 3. データが空の場合の表示
    if (tweets.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                <p className="text-lg font-medium">まだ投稿がありません</p>
                <p className="text-sm mt-1">
                    最初のツイートを投稿してみましょう！
                </p>
            </div>
        );
    }

    // 4. 通常表示 (リスト表示)
    return (
        <div className="flex flex-col">
            {tweets.map((tweet) => (
                <TweetCard key={String(tweet.id)} tweet={tweet} />
            ))}
        </div>
    );
}
