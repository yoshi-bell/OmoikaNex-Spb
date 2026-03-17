"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { loginSchema, type LoginFormType } from "@/lib/schemas";
import { authApi } from "@/features/auth/api/auth";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { userSchema } from "@/lib/schemas";

/**
 * ログインフォーム・コンポーネント
 *
 * 見本画像のデザインを忠実に再現しつつ、
 * RHF + Zod による堅牢なバリデーションと Repository 層を介した通信を行う。
 */
export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useAuthStore();
    const supabase = createClient();

    // 1. フォームの初期化 (Zod スキーマを適用)
    const form = useForm<LoginFormType>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // 2. 送信ハンドラー
    const onSubmit = async (values: LoginFormType) => {
        setIsLoading(true);

        // Repository 層を呼び出し、Supabase と通信 (Cookie のセット)
        const { success, error } = await authApi.signIn(values);

        if (success) {
            // 3. クライアントサイドのストアを即座に同期 (リロードなし反映のため)
            const {
                data: { user: sbUser },
            } = await supabase.auth.getUser();
            if (sbUser) {
                const { data: profile } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", sbUser.id)
                    .single();

                const domainUser = userSchema.parse({
                    ...sbUser,
                    ...profile,
                    name:
                        profile?.name ||
                        sbUser.user_metadata?.name ||
                        "Unknown",
                });
                setUser(domainUser);
            }

            toast.success('ログインしました。')
            router.push('/')
            router.refresh()
            } else {
            // 翻訳されたドメインエラーを表示
            toast.error(error?.message || 'ログインに失敗しました。')

            // メール認証未完了の場合、その場で再送信して案内ページへ誘導
            if (error?.type === 'AUTH_NOT_CONFIRMED') {
              // 通信結果を確実に待機 (Floating Promise の解消)
              const resendResult = await authApi.resendVerificationEmail(values.email)
              
              if (resendResult.success) {
                toast.info('認証メールを再送信しました。メールをご確認ください。')
                setTimeout(() => {
                  router.push(`/register/verify?email=${encodeURIComponent(values.email)}`)
                }, 2000)
              } else {
                // レートリミット等のエラー時は遷移させず、その場に留める
                toast.error('メールの送信制限に達したか、エラーが発生しました。しばらく待ってから再度お試しください。')
              }
            }

            // フィールド固有のエラーがあればマッピング

            if (error?.errors) {
                Object.entries(error.errors).forEach(([field, messages]) => {
                    form.setError(field as keyof LoginFormType, {
                        message: messages[0],
                    });
                });
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="bg-white rounded-lg p-8 shadow-md">
            <h1 className="text-center text-xl font-bold mb-8 text-gray-800">
                ログイン
            </h1>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* メールアドレス入力 */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="メールアドレス"
                                        type="email"
                                        {...field}
                                        className="h-12 border-gray-300 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* パスワード入力 */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        placeholder="パスワード"
                                        type="password"
                                        {...field}
                                        className="h-12 border-gray-300 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* 送信ボタン（見本の鮮やかな青紫色を再現） */}
                    <div className="flex justify-center mt-8">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-10 py-6 rounded-full font-bold transition-all disabled:opacity-50"
                        >
                            {isLoading ? "ログイン中..." : "ログイン"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
