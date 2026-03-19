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
 * RHF + Zod によるバリデーションと、
 * 画面遷移を伴うケースにおける二重送信防止（isLoading維持）を実装。
 */
export function LoginForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useAuthStore();
    const supabase = createClient();

    const form = useForm<LoginFormType>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormType) => {
        setIsLoading(true);

        // 1. 認証リクエスト
        const { success, error } = await authApi.signIn(values);

        if (success) {
            // 2. プロフィール同期 (部分的障害でもクラッシュしないよう保護)
            try {
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
            } catch (e) {
                console.error("Profile sync failed (Partial Failure):", e);
                // 認証自体は成功しているため、最低限の情報でフォールバックして続行
                // (これを忘れると Zustand ストアが更新されず UI が不整合になる)
                const {
                    data: { user: sbUser },
                } = await supabase.auth.getUser();
                if (sbUser) {
                    const fallbackUser = userSchema.parse({
                        id: sbUser.id,
                        email: sbUser.email,
                        name: sbUser.user_metadata?.name || "Unknown",
                        avatar_url: null,
                        created_at: sbUser.created_at,
                        updated_at: null,
                    });
                    setUser(fallbackUser);
                }
            }

            toast.success("ログインしました。");
            router.push("/");
            router.refresh();
            // 💡 画面遷移を伴うため、isLoading(false) は呼ばず return する
            return;
        }

        // 3. エラーハンドリング
        if (error?.type === "AUTH_NOT_CONFIRMED") {
            // メール未認証の場合：再送信して案内ページへ
            const resendResult = await authApi.resendVerificationEmail(
                values.email
            );

            if (resendResult.success) {
                toast.info(
                    "認証メールを再送信しました。メールをご確認ください。"
                );
                setTimeout(() => {
                    router.push(
                        `/register/verify?email=${encodeURIComponent(values.email)}`
                    );
                }, 2000);
                // 💡 2秒後の遷移を待つため、isLoading(false) は呼ばず return する
                return;
            } else {
                toast.error(
                    "メールの送信制限に達したか、エラーが発生しました。しばらく待ってから再度お試しください。"
                );
            }
        } else {
            // 通常の認証エラーまたはサーバーエラー
            toast.error(error?.message || "ログインに失敗しました。");

            // フィールドエラーのマッピング
            if (error?.errors) {
                Object.entries(error.errors).forEach(([field, messages]) => {
                    form.setError(field as keyof LoginFormType, {
                        message: messages[0],
                    });
                });
            }
        }

        // 通常エラー時のみ、再入力を許可するためにローディングを解除する
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
