"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/auth";
import { PostTweetForm } from "@/features/tweets/components/PostTweetForm";
import { useAuthUser } from "@/hooks/useAuthUser";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/utils";

/**
 * サイドバー・コンポーネント (ダークモード仕様)
 *
 * 見本画像に基づき、ロゴ「SHARE」、ナビゲーション、
 * および「シェア」フォームを垂直に配置。
 */
export function Sidebar() {
    const router = useRouter();
    const { user, isInitialLoading, clearAuth } = useAuthUser();

    const handleLogout = async () => {
        const { success, error } = await authApi.signOut();
        if (success) {
            clearAuth();
            toast.success("ログアウトしました");
            router.push("/login");
            router.refresh();
        } else {
            toast.error(error?.message || "ログアウトに失敗しました");
        }
    };

    return (
        <aside className="flex h-full flex-col px-6 py-6">
            {/* ロゴ: 正式な画像ロゴを配置 */}
            <div className="mb-10 px-2">
                <Link href="/">
                    <Image
                        src="/images/logo.png"
                        alt="SHARE"
                        width={140}
                        height={40}
                        priority
                        style={{ height: "auto" }}
                    />
                </Link>
            </div>

            {/* ナビゲーション */}
            <nav className="space-y-4">
                <Link
                    href="/"
                    className="flex items-center gap-4 text-xl font-bold text-white transition-opacity hover:opacity-70"
                >
                    <Image
                        src="/images/home.png"
                        alt="ホーム"
                        width={24}
                        height={24}
                        className="brightness-0 invert"
                    />
                    ホーム
                </Link>

                {/* 認証状態に応じたボタン切り替え */}
                {!isInitialLoading && (
                    <>
                        {user ? (
                            <>
                                <Link
                                    href={`/profile/${user.id}`}
                                    className="flex items-center gap-3 rounded-full py-3 text-white transition-opacity hover:opacity-70"
                                >
                                    <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-700">
                                        <Image
                                            src={getAvatarUrl(user.avatar_url, user.updated_at)}
                                            alt={user.name}
                                            width={40}
                                            height={40}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="truncate text-[15px] font-bold">
                                            {user.name}
                                        </span>
                                        <span className="truncate text-xs text-slate-500">
                                            @...{user.id.slice(-8)}
                                        </span>
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-4 text-xl font-bold text-white transition-opacity hover:opacity-70"
                                >
                                    <Image
                                        src="/images/logout.png"
                                        alt="ログアウト"
                                        width={24}
                                        height={24}
                                        className="brightness-0 invert"
                                    />
                                    ログアウト
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="flex items-center gap-4 text-xl font-bold text-white transition-opacity hover:opacity-70"
                            >
                                <Image
                                    src="/images/profile.png"
                                    alt="ログイン"
                                    width={24}
                                    height={24}
                                    className="brightness-0 invert"
                                />
                                ログイン
                            </Link>
                        )}
                    </>
                )}
            </nav>

            {/* シェアフォーム (ナビゲーションの直下) */}
            <div className="mt-10">
                <PostTweetForm />
            </div>
        </aside>
    );
}
