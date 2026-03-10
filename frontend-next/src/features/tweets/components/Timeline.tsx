"use client";

import { useEffect, useState } from "react";
import { useTimeline } from "@/features/tweets/hooks/useTimeline";
import { TweetCard } from "./TweetCard";
import { useInView } from "react-intersection-observer";

/**
 * タイムライン・コンポーネント (無限スクロール対応)
 */
export function Timeline() {
    const [mode, setMode] = useState<"all" | "following">("all");

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useTimeline(mode);

    // 最下部の監視
    const { ref, inView } = useInView();

    // 最下部に到達したら次を読み込む
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ページごとのデータをフラットな配列に変換
    const allTweets = data?.pages.flatMap((page) => page.data || []) || [];

    return (
        <div className="flex flex-col pb-20">
            {/* 1. タブナビゲーション (常に表示) */}
            <div className="sticky top-0 z-10 flex border-b border-slate-800 bg-[#16181c]/80 backdrop-blur-md">
                <button
                    onClick={() => setMode("all")}
                    className="relative flex-1 px-4 py-4 text-sm font-bold transition-colors hover:bg-white/5"
                >
                    <span
                        className={
                            mode === "all" ? "text-white" : "text-slate-500"
                        }
                    >
                        おすすめ
                    </span>
                    {mode === "all" && (
                        <div className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-indigo-500" />
                    )}
                </button>
                <button
                    onClick={() => setMode("following")}
                    className="relative flex-1 px-4 py-4 text-sm font-bold transition-colors hover:bg-white/5"
                >
                    <span
                        className={
                            mode === "following"
                                ? "text-white"
                                : "text-slate-500"
                        }
                    >
                        フォロー中
                    </span>
                    {mode === "following" && (
                        <div className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-indigo-500" />
                    )}
                </button>
            </div>

            {/* 2. コンテンツエリア (状態に応じて切り替え) */}
            
            {/* ローディング状態 */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-10 space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent" />
                    <p className="text-gray-500 text-sm font-medium">
                        タイムラインを読み込み中...
                    </p>
                </div>
            ) : isError ? (
                /* エラー状態 */
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
            ) : allTweets.length === 0 ? (
                /* データが空の場合 */
                <div className="p-10 text-center text-gray-500">
                    <p className="text-lg font-medium">
                        {mode === "following" ? "まだ誰もフォローしていません" : "まだ投稿がありません"}
                    </p>
                    <p className="text-sm mt-1">
                        {mode === "following" ? "おすすめから気になるユーザーを探してみましょう！" : "最初のツイートを投稿してみましょう！"}
                    </p>
                </div>
            ) : (
                /* 通常のリスト表示 */
                <>
                    {allTweets.map((tweet) => (
                        <TweetCard key={String(tweet.id)} tweet={tweet} />
                    ))}

                    {/* 最下部の読み込み監視・ローダー */}
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
                </>
            )}
        </div>
    );
}
