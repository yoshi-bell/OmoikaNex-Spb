import { TweetDomain } from "@/lib/schemas";
import Image from "next/image";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDeleteTweet } from "@/features/tweets/hooks/useDeleteTweet";
import { useToggleLike } from "@/features/tweets/hooks/useToggleLike";

interface TweetCardProps {
    tweet: TweetDomain;
}

/**
 * ツイートカード・コンポーネント (ダークモード仕様)
 */
export function TweetCard({ tweet }: TweetCardProps) {
    const { user } = useAuthUser();
    const { mutate: deleteTweet, isPending: isDeleting } = useDeleteTweet();
    const { mutate: toggleLike } = useToggleLike();

    // 自分の投稿かどうかを判定 (文字列として比較することで確実に判定)
    const isOwnTweet = user && String(user.id) === String(tweet.user_id);

    const handleDelete = () => {
        if (window.confirm("この投稿を削除してもよろしいですか？")) {
            deleteTweet(tweet.id);
        }
    };

    return (
        <div className="flex gap-4 border-b border-slate-800 p-6 transition-colors hover:bg-white/5">
            {/* ユーザーアイコン */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-800">
                <Image
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(tweet.user_id)}`}
                    alt={tweet.user?.name || "User"}
                    width={48}
                    height={48}
                />
            </div>

            {/* ツイート内容 */}
            <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                        {tweet.user?.name || "Unknown"}
                    </span>
                    <span className="text-sm text-slate-500">
                        @{tweet.user_id.slice(0, 8)}
                    </span>
                    <span className="text-sm text-slate-600">·</span>
                    {/* TODO: Relative time format */}
                    <span className="text-sm text-slate-500">1時間</span>
                </div>

                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-normal text-gray-100">
                    {tweet.content}
                </p>

                {/* アクションエリア (仕様: 左揃え配置) */}
                <div className="mt-4 flex items-center gap-12 text-slate-500">
                    {/* お気に入り (いいね) */}
                    <button
                        onClick={() => toggleLike(tweet.id)}
                        className={`group flex items-center gap-2 transition-colors hover:text-rose-500 ${
                            tweet.is_liked ? "text-rose-500" : ""
                        }`}
                    >
                        <div className="rounded-full transition-colors group-hover:bg-rose-500/10">
                            <Image
                                src="/images/heart.png"
                                alt="Like"
                                width={20}
                                height={20}
                                className={`brightness-0 invert transition-opacity ${
                                    tweet.is_liked
                                        ? "opacity-100"
                                        : "opacity-60"
                                } group-hover:opacity-100`}
                            />
                        </div>
                        <span className="text-xs font-medium">
                            {tweet.likes_count}
                        </span>
                    </button>

                    {/* 削除 (自分自身の投稿のみ表示) */}
                    {isOwnTweet && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="group flex items-center gap-2 transition-colors hover:text-red-500 disabled:opacity-50"
                        >
                            <div className="rounded-full transition-colors group-hover:bg-red-500/10">
                                <Image
                                    src="/images/cross.png"
                                    alt="Delete"
                                    width={18}
                                    height={18}
                                    className="brightness-0 invert opacity-60 group-hover:opacity-100"
                                />
                            </div>
                            <span className="text-xs font-medium">削除</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
