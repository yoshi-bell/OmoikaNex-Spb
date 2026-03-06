"use client";

import { useEffect } from "react";
import { useTimeline } from "@/features/tweets/hooks/useTimeline";
import { TweetCard } from "./TweetCard";
import { useInView } from "react-intersection-observer";

/**
 * タイムライン・コンポーネント (無限スクロール対応)
 *
 * useTimeline (useInfiniteQuery) を使用して時系列のツイートを取得し、
 * スクロールが最下部に達した際に追加データを自動フェッチします。
 */
export function Timeline() {
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useTimeline();

    // 最下部の監視
    const { ref, inView } = useInView();

    // 最下部に到達したら次を読み込む
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // 1. 初回ローディング状態
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

    // 2. エラー発生時 (最初のページでエラーが起きた場合)
    // NOTE: 個別のページエラーへの対応は簡易化しています
    if (isError) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-lg m-4">
                <p className="text-red-600 font-bold">
                    データの取得に失敗しました
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

    // ページごとのデータをフラットな配列に変換
    const allTweets = data?.pages.flatMap((page) => page.data || []) || [];

    // 3. データが空の場合
    if (allTweets.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500">
                <p className="text-lg font-medium">まだ投稿がありません</p>
                <p className="text-sm mt-1">
                    最初のツイートを投稿してみましょう！
                </p>
            </div>
        );
    }

    // 4. 通常表示
    return (
        <div className="flex flex-col pb-20">
            {allTweets.map((tweet) => (
                <TweetCard key={String(tweet.id)} tweet={tweet} />
            ))}

            {/* 最下部の読み込み監視・ローダー表示エリア */}
            <div ref={ref} className="p-10 flex justify-center">
                {isFetchingNextPage ? (
                    <div className="flex flex-col items-center space-y-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#4f46e5] border-t-transparent" />
                        <p className="text-xs text-gray-500">読み込み中...</p>
                    </div>
                ) : hasNextPage ? (
                    <span className="text-xs text-gray-500">さらに読み込む</span>
                ) : (
                    <p className="text-sm text-gray-500 font-medium">
                        すべての投稿を表示しました
                    </p>
                )}
            </div>
        </div>
    );
}
