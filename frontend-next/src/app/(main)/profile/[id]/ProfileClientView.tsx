"use client";

import { UserProfileResponse, getUserProfile } from "@/features/users/api/get-profile";
import { getLikedTweets } from "@/features/users/api/get-liked-tweets";
import { getUserTweets } from "@/features/users/api/getUserTweets";
import { TweetCard } from "@/features/tweets/components/TweetCard";
import { TweetCardSkeleton } from "@/features/tweets/components/TweetCardSkeleton";
import { getAvatarUrl } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditProfileModal } from "@/features/users/components/EditProfileModal";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToggleFollow } from "@/features/follows/hooks/useToggleFollow";
import { useInView } from "react-intersection-observer";

interface ProfileClientViewProps {
    initialData: UserProfileResponse;
    userId: string;
}

type TabType = "posts" | "likes";

/**
 * プロフィール画面のクライアント・ビュー (無限スクロール対応版)
 */
export function ProfileClientView({ initialData, userId }: ProfileClientViewProps) {
    const router = useRouter();
    const { user: loggedInUser } = useAuthUser();
    const [activeTab, setActiveTab] = useState<TabType>("posts");
    const { mutate: toggleFollow, isPending: isFollowPending } = useToggleFollow();
    const { ref, inView } = useInView();

    // 1. プロフィール基本データの取得
    const { data: profileData } = useQuery({
        queryKey: ["profile", userId],
        queryFn: () => getUserProfile(userId),
        initialData: initialData,
        staleTime: 1000 * 30, // 30秒
    });

    // 2. 自分の投稿一覧 (無限スクロール)
    const {
        data: postPages,
        fetchNextPage: fetchNextPosts,
        hasNextPage: hasNextPosts,
        isFetchingNextPage: isFetchingNextPosts,
        isLoading: isLoadingPosts,
    } = useInfiniteQuery({
        queryKey: ["profile-posts", userId],
        queryFn: ({ pageParam }) => getUserTweets(userId, pageParam),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 1000 * 30,
    });

    // 3. 「いいね」した投稿一覧 (無限スクロール)
    const {
        data: likedPages,
        fetchNextPage: fetchNextLikes,
        hasNextPage: hasNextLikes,
        isFetchingNextPage: isFetchingNextLikes,
        isLoading: isLoadingLikes,
    } = useInfiniteQuery({
        queryKey: ["profile-likes", userId],
        queryFn: ({ pageParam }) => getLikedTweets(userId, pageParam),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: activeTab === "likes",
        staleTime: 1000 * 30,
    });

    // 無限スクロールのトリガー監視
    useEffect(() => {
        if (inView) {
            if (activeTab === "posts" && hasNextPosts && !isFetchingNextPosts) {
                fetchNextPosts();
            } else if (activeTab === "likes" && hasNextLikes && !isFetchingNextLikes) {
                fetchNextLikes();
            }
        }
    }, [inView, activeTab, hasNextPosts, isFetchingNextPosts, fetchNextPosts, hasNextLikes, isFetchingNextLikes, fetchNextLikes]);

    const { user } = profileData;

    // 自分のプロフィールかどうかを判定
    const isOwnProfile =
        loggedInUser && String(loggedInUser.id) === String(userId);

    // 【説明変数】プライバシー仕様: 「いいね」タブを表示できるかどうかの判定
    const canShowLikes = (isOwnProfile === true);

    // 表示データの平坦化
    const displayTweets = (activeTab === "posts")
        ? postPages?.pages.flatMap((page) => page.data) || []
        : (canShowLikes ? (likedPages?.pages.flatMap((page) => page.data) || []) : []);

    const isLoadingInitial = (activeTab === "posts") ? isLoadingPosts : isLoadingLikes;
    const isFetchingNext = (activeTab === "posts") ? isFetchingNextPosts : isFetchingNextLikes;
    const hasNextPage = (activeTab === "posts") ? hasNextPosts : hasNextLikes;

    const emptyMessage = (activeTab === "posts")
        ? "まだポストがありません"
        : "まだいいねしたポストがありません";

    return (
        <div className="flex min-h-screen flex-col border-r border-slate-800 bg-[#16181c]">
            {/* 1. 固定ヘッダー (戻るボタン + 名前) */}
            <div className="sticky top-0 z-20 flex items-center gap-8 bg-[#16181c]/80 px-4 py-2 backdrop-blur-md">
                <button
                    onClick={() => router.back()}
                    className="rounded-full p-2 transition-colors hover:bg-white/10"
                >
                    <ArrowLeft className="h-5 w-5 text-white" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">{user.name}</h1>
                    <p className="text-xs text-slate-500">
                        {activeTab === "posts" ? "ポスト" : "いいねしたポスト"}
                    </p>
                </div>
            </div>

            {/* 2. プロフィールエリア */}
            <div className="relative">
                {/* バナー背景 (現在は単色) */}
                <div className="h-48 w-full bg-slate-800" />

                <div className="px-4">
                    {/* アバター画像と編集ボタンのエリア */}
                    <div className="relative -mt-16 mb-4 flex items-end justify-between">
                        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-[#16181c] bg-slate-800">
                            <Image
                                src={getAvatarUrl(user.avatar_url, user.updated_at)}
                                alt={user.name}
                                width={128}
                                height={128}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* 自分のプロフィールの時のみ編集ボタンを表示 */}
                        {isOwnProfile ? (
                            <EditProfileModal
                                user={user}
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="rounded-full border-slate-700 bg-transparent px-4 font-bold text-white hover:bg-white/10"
                                    >
                                        プロフィールを編集
                                    </Button>
                                }
                            />
                        ) : (
                            /* 他人のプロフィールの時のみフォローボタンを表示 */
                            loggedInUser && (
                                <Button
                                    variant={user.is_following ? "outline" : "secondary"}
                                    size="default"
                                    aria-label={user.is_following ? "フォロー解除" : "フォロー"}
                                    disabled={isFollowPending}
                                    onClick={() => toggleFollow(user.id)}
                                    className={`h-10 rounded-full px-6 text-sm font-bold transition-all ${
                                        user.is_following
                                            ? "border-slate-700 bg-transparent text-white hover:border-red-900 hover:bg-red-900/10 hover:text-red-500"
                                            : "bg-white text-black hover:bg-white/90"
                                    }`}
                                >
                                    {user.is_following ? (
                                        <span className="after:content-['フォロー中'] hover:after:content-['解除']" />
                                    ) : (
                                        "フォロー"
                                    )}
                                </Button>
                            )
                        )}
                    </div>

                    {/* ユーザー情報 */}
                    <div className="mb-6 space-y-1">
                        <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                        <p className="text-slate-500">@...{user.id.slice(-8)}</p>
                    </div>

                    {/* 自己紹介文 */}
                    {user.profile_text && (
                        <p className="mb-4 whitespace-pre-wrap text-[15px] leading-normal text-gray-100">
                            {user.profile_text}
                        </p>
                    )}

                    {/* 統計情報 (フォロー/フォロワー) */}
                    <div className="mb-6 flex gap-5 text-sm">
                        <div className="flex gap-1 transition-opacity hover:opacity-80 cursor-pointer">
                            <span className="font-bold text-white">{user.following_count}</span>
                            <span className="text-slate-500">フォロー中</span>
                        </div>
                        <div className="flex gap-1 transition-opacity hover:opacity-80 cursor-pointer">
                            <span className="font-bold text-white">{user.follower_count}</span>
                            <span className="text-slate-500">フォロワー</span>
                        </div>
                    </div>
                </div>

                {/* タブナビゲーション */}
                <div className="flex border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`relative flex-1 py-4 text-sm font-bold transition-colors hover:bg-white/5 ${
                            activeTab === "posts" ? "text-white" : "text-slate-500"
                        }`}
                    >
                        ポスト
                        {activeTab === "posts" && (
                            <div className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-indigo-500" />
                        )}
                    </button>
                    {isOwnProfile && (
                        <button
                            onClick={() => setActiveTab("likes")}
                            className={`relative flex-1 py-4 text-sm font-bold transition-colors hover:bg-white/5 ${
                                activeTab === "likes" ? "text-white" : "text-slate-500"
                            }`}
                        >
                            いいね
                            {activeTab === "likes" && (
                                <div className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-indigo-500" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* 3. 投稿一覧エリア */}
            <div className="flex flex-col">
                {isLoadingInitial ? (
                    <div className="flex flex-col">
                        <TweetCardSkeleton />
                        <TweetCardSkeleton />
                    </div>
                ) : (displayTweets.length === 0) ? (
                    <div className="p-10 text-center text-gray-500">
                        {emptyMessage}
                    </div>
                ) : (
                    <>
                        {displayTweets.map((tweet) => (
                            <TweetCard
                                key={`${activeTab}-${tweet.id}`}
                                tweet={tweet}
                            />
                        ))}

                        {/* 無限スクロールの監視ターゲット */}
                        <div ref={ref} className="w-full">
                            {isFetchingNext && (
                                <div className="flex flex-col">
                                    <TweetCardSkeleton />
                                    <TweetCardSkeleton />
                                </div>
                            )}
                            {!hasNextPage && displayTweets.length > 0 && (
                                <p className="py-12 text-center text-sm text-gray-500">
                                    すべての投稿を表示しました
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
