"use client";

import { UserProfileResponse, getUserProfile } from "@/features/users/api/get-profile";
import { TweetCard } from "@/features/tweets/components/TweetCard";
import { getAvatarUrl } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditProfileModal } from "@/features/users/components/EditProfileModal";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface ProfileClientViewProps {
    initialData: UserProfileResponse;
    userId: string;
}

/**
 * プロフィール画面のクライアント・ビュー
 */
export function ProfileClientView({ initialData, userId }: ProfileClientViewProps) {
    const router = useRouter();
    const { user: loggedInUser } = useAuthUser();

    // React Query でプロフィールデータを管理 (Server Action を利用)
    const { data: profileData } = useQuery({
        queryKey: ["profile", userId],
        queryFn: () => getUserProfile(userId),
        initialData: initialData, // サーバーサイドで取得したデータを初期値にする (爆速表示)
        staleTime: 1000 * 60 * 5, // 5分間はフレッシュとみなす
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
                    <p className="text-xs text-slate-500">{tweets.length} 件のポスト</p>
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

                {/* タブナビゲーション (現在はポストのみ) */}
                <div className="flex border-b border-slate-800">
                    <div className="relative px-8 py-4 text-sm font-bold text-white">
                        ポスト
                        <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-500" />
                    </div>
                </div>
            </div>

            {/* 3. 投稿一覧タイムライン */}
            <div className="flex flex-col">
                {tweets.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        まだポストがありません
                    </div>
                ) : (
                    tweets.map((tweet) => (
                        <TweetCard 
                            key={String(tweet.id)} 
                            tweet={tweet} 
                            isLinkable={true} 
                        />
                    ))
                )}
            </div>
        </div>
    );
}
