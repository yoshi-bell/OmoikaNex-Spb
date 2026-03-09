"use client";

import { useState } from "react";
import { TweetDomain, tweetFormSchema, type TweetFormType } from "@/lib/schemas";
import Image from "next/image";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useDeleteTweet } from "@/features/tweets/hooks/useDeleteTweet";
import { useToggleLike } from "@/features/tweets/hooks/useToggleLike";
import { usePostTweet } from "@/features/tweets/hooks/usePostTweet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { useRouter } from "next/navigation";

interface TweetCardProps {
    tweet: TweetDomain;
    isLinkable?: boolean;
    isReply?: boolean;
}

/**
 * ツイートカード・コンポーネント (ダークモード仕様)
 */
export function TweetCard({
    tweet,
    isLinkable = true,
    isReply = false,
}: TweetCardProps) {
    const router = useRouter();
    const { user } = useAuthUser();
    const { mutate: deleteTweet, isPending: isDeleting } = useDeleteTweet();
    const { mutate: toggleLike } = useToggleLike();
    const { mutate: postTweet, isPending: isPostingReply } = usePostTweet();

    // 返信フォームの表示状態
    const [isReplyOpen, setIsReplyOpen] = useState(false);

    // 返信用フォームの初期化
    const form = useForm<TweetFormType>({
        resolver: zodResolver(tweetFormSchema),
        defaultValues: {
            content: "",
            parent_id: Number(tweet.id),
        },
    });

    // 自分の投稿かどうかを判定 (文字列として比較することで確実に判定)
    const isOwnTweet = user && String(user.id) === String(tweet.user_id);

    const handleDelete = () => {
        if (window.confirm("この投稿を削除してもよろしいですか？")) {
            deleteTweet(tweet.id);
        }
    };

    const onReplySubmit = (values: TweetFormType) => {
        postTweet(values, {
            onSuccess: (result) => {
                if (result.success) {
                    form.reset();
                    setIsReplyOpen(false);
                }
            },
        });
    };

    const handleCardClick = () => {
        if (isLinkable) {
            router.push(`/tweet/${tweet.id}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`flex gap-4 border-b border-slate-800 p-6 transition-colors ${
                isLinkable ? "cursor-pointer hover:bg-white/5" : ""
            } ${isReply ? "bg-black/20 border-l-2 border-l-indigo-500/30" : ""}`}
        >
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
                    {/* 返信 (コメント) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsReplyOpen(!isReplyOpen);
                        }}
                        className={`group flex items-center gap-2 transition-colors hover:text-indigo-400 ${
                            isReplyOpen ? "text-indigo-400" : ""
                        }`}
                    >
                        <div className="rounded-full transition-colors group-hover:bg-indigo-400/10">
                            <Image
                                src="/images/detail.png"
                                alt="Reply"
                                width={18}
                                height={18}
                                className={`brightness-0 invert transition-opacity ${
                                    isReplyOpen ? "opacity-100" : "opacity-60"
                                } group-hover:opacity-100`}
                            />
                        </div>
                        <span className="text-xs font-medium">
                            {tweet.replies_count}
                        </span>
                    </button>

                    {/* お気に入り (いいね) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(tweet.id);
                        }}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
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

                {/* 返信フォーム (インライン展開) */}
                {isReplyOpen && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-6 border-t border-slate-800 pt-6 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        <div className="flex gap-4">
                            {/* ログインユーザーのアイコン */}
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-800">
                                <Image
                                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.id || "default")}`}
                                    alt={user?.name || "User"}
                                    width={40}
                                    height={40}
                                />
                            </div>

                            <div className="flex-1">
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onReplySubmit)}
                                        className="flex flex-col"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="content"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="返信をツイート"
                                                            disabled={isPostingReply}
                                                            className="min-h-[80px] resize-none border-none bg-transparent p-0 text-[15px] text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="mt-2 flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={isPostingReply || !form.watch("content")}
                                                className="rounded-full bg-indigo-600 px-6 py-1.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {isPostingReply ? "送信中..." : "返信する"}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
