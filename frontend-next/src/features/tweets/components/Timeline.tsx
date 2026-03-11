"use client";

import { useEffect, useState } from "react";
import { useTimeline } from "@/features/tweets/hooks/useTimeline";
import { TweetCard } from "./TweetCard";
import { TweetCardSkeleton } from "./TweetCardSkeleton";
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
            
            {/* ローディング状態 (スケルトン表示) */}
            {isLoading ? (
                <div className="flex flex-col">
                    <TweetCardSkeleton />
                    <TweetCardSkeleton />
                    <TweetCardSkeleton />
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

                    {/* 最下部の読み込み監視・スケルトン表示 */}
                    <div ref={ref} className="flex flex-col">
                        {isFetchingNextPage ? (
                            <TweetCardSkeleton />
                        ) : hasNextPage ? (
                            <div className="p-10 text-center">
                                <span className="text-sm text-slate-500">さらに読み込む</span>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-sm text-slate-500 font-bold">
                                    すべての投稿を表示しました
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
