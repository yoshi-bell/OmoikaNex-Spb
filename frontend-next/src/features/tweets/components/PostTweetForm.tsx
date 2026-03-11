"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tweetFormSchema, type TweetFormType } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { usePostTweet } from "@/features/tweets/hooks/usePostTweet";

/**
 * 投稿作成フォーム・コンポーネント (ダークモード・サイドバー仕様)
 *
 * 見本画像に基づき、「シェア」ラベル、白枠の入力エリア、
 * 右下の紫色の送信ボタンを配置。
 */
export function PostTweetForm() {
    const { mutate: postTweet, isPending } = usePostTweet();

    const form = useForm<TweetFormType>({
        resolver: zodResolver(tweetFormSchema),
        defaultValues: {
            content: "",
        },
    });

    const onSubmit = async (values: TweetFormType) => {
        postTweet(values, {
            onSuccess: (result) => {
                if (result.success) {
                    form.reset();
                    // 投稿後、最新のツイートを確認できるよう最上部へスクロール
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            },
        });
    };

    return (
        <div className="flex flex-col space-y-3">
            {/* ラベル */}
            <label className="text-xl font-bold text-white">シェア</label>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="relative flex flex-col"
                >
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder="いまどうしてる？"
                                        disabled={isPending}
                                        className="min-h-[140px] resize-none border border-white bg-transparent p-4 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                            </FormItem>
                        )}
                    />

                    {/* ボタン: 右下に配置 */}
                    <div className="mt-4 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="rounded-full bg-indigo-600 px-8 py-2 font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isPending ? "送信中..." : "シェアする"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
