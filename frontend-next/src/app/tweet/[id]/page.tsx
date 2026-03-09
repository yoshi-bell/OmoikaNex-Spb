"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useTweetDetail,
    useTweetReplies,
} from "@/features/tweets/hooks/useTweetDetail";
import { TweetCard } from "@/features/tweets/components/TweetCard";
import { TweetId } from "@/types/brands";
import { ArrowLeft } from "lucide-react";
import { useInView } from "react-intersection-observer";

/**
 * ツイート詳細ページ
 */
export default function TweetDetailPage() {
    const params = useParams();
    const router = useRouter();
    const tweetId = params.id as unknown as TweetId;

    const {
        data: tweetResult,
        isLoading: isTweetLoading,
        isError: isTweetError,
    } = useTweetDetail(tweetId);

    const {
        data: repliesData,
        isLoading: isRepliesLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useTweetReplies(tweetId);

    // 最下部の監視 (無限スクロール用)
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ローディング状態
    if (isTweetLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4f46e5] border-t-transparent" />
                <p className="text-gray-500 text-sm font-medium">読み込み中...</p>
            </div>
        );
    }

    // エラー状態
    if (isTweetError || !tweetResult?.data) {
        return (
            <div className="p-8 text-center text-red-500">
                ツイートの取得に失敗しました。
            </div>
        );
    }

    const tweet = tweetResult.data;
    const allReplies =
        repliesData?.pages.flatMap((page) => page.data || []) || [];

    return (
        <div className="flex min-h-screen flex-col bg-[#16181c]">
            {/* ヘッダー: 戻るボタン (Sticky) */}
            <header className="sticky top-0 z-20 flex items-center gap-8 border-b border-slate-800 bg-[#16181c]/80 px-4 py-3 backdrop-blur-md">
                <button
                    onClick={() => router.back()}
                    className="rounded-full p-2 transition-colors hover:bg-white/10"
                >
                    <ArrowLeft className="h-5 w-5 text-white" />
                </button>
                <h1 className="text-xl font-bold text-white">スレッド</h1>
            </header>

            {/* メインツイート (Sticky) */}
            {/* スクロール時にヘッダーのすぐ下に張り付くように設定 */}
            <div className="sticky top-[53px] z-10 border-b-8 border-slate-900 bg-[#16181c]">
                <TweetCard tweet={tweet} isLinkable={false} />
            </div>

            {/* 返信一覧 */}
            <div className="flex flex-col">
                {allReplies.length > 0 ? (
                    allReplies.map((reply) => (
                        <TweetCard
                            key={String(reply.id)}
                            tweet={reply}
                            isReply={true}
                        />
                    ))
                ) : !isRepliesLoading ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        まだ返信はありません
                    </div>
                ) : null}

                {/* 最下部の読み込み監視・ローダー */}
                <div ref={ref} className="flex justify-center p-10">
                    {isFetchingNextPage ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#4f46e5] border-t-transparent" />
                    ) : hasNextPage ? (
                        <span className="text-xs text-gray-500">
                            さらに読み込む
                        </span>
                    ) : allReplies.length > 0 ? (
                        <p className="text-xs font-medium text-gray-600">
                            すべての返信を表示しました
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
