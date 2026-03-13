"use client";

import { UserProfileResponse, getUserProfile } from "@/features/users/api/get-profile";
import { getLikedTweets } from "@/features/users/api/get-liked-tweets";
import { TweetCard } from "@/features/tweets/components/TweetCard";
import { TweetCardSkeleton } from "@/features/tweets/components/TweetCardSkeleton";
import { getAvatarUrl } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditProfileModal } from "@/features/users/components/EditProfileModal";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface ProfileClientViewProps {
    initialData: UserProfileResponse;
    userId: string;
}

type TabType = "posts" | "likes";

/**
 * プロフィール画面のクライアント・ビュー
 */
export function ProfileClientView({ initialData, userId }: ProfileClientViewProps) {
    const router = useRouter();
    const { user: loggedInUser } = useAuthUser();
    const [activeTab, setActiveTab] = useState<TabType>("posts");

    // 1. プロフィール基本データと投稿一覧 (Server Action)
    const { data: profileData } = useQuery({
        queryKey: ["profile", userId],
        queryFn: () => getUserProfile(userId),
        initialData: initialData,
        staleTime: 1000 * 60 * 5,
    });

    // 2. 「いいね」した投稿一覧 (Server Action) - タブ選択時のみ有効化
    const { data: likedTweets, isLoading: isLoadingLikes } = useQuery({
        queryKey: ["profile-likes", userId],
        queryFn: () => getLikedTweets(userId),
        enabled: activeTab === "likes",
        staleTime: 1000 * 60 * 5,
    });

    const { user, tweets } = profileData;

    // 自分のプロフィールかどうかを判定
    const isOwnProfile = loggedInUser && String(loggedInUser.id) === String(userId);

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
                        {activeTab === "posts" ? `${tweets.length} 件のポスト` : "いいねしたポスト"}
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
                        {isOwnProfile && (
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
                        )}
                    </div>

                    {/* ユーザー情報 */}
                    <div className="mb-6 space-y-1">
                        <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                        <p className="text-slate-500">@{user.id.slice(0, 8)}</p>
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
                </div>
            </div>

            {/* 3. 投稿一覧エリア */}
            <div className="flex flex-col">
                {activeTab === "posts" ? (
                    tweets.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">まだポストがありません</div>
                    ) : (
                        tweets.map((tweet) => (
                            <TweetCard key={`post-${tweet.id}`} tweet={tweet} />
                        ))
                    )
                ) : (
                    /* いいねタブの表示 */
                    isLoadingLikes ? (
                        <div className="flex flex-col">
                            <TweetCardSkeleton />
                            <TweetCardSkeleton />
                        </div>
                    ) : (likedTweets?.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">まだいいねしたポストがありません</div>
                    ) : (
                        likedTweets?.map((tweet) => (
                            <TweetCard key={`like-${tweet.id}`} tweet={tweet} />
                        ))
                    ))
                )}
            </div>
        </div>
    );
}
