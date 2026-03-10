"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { userSchema } from "@/lib/schemas";

/**
 * アプリケーション全体の認証状態を統括するプロバイダー
 *
 * Web Locks の競合（N+1アクセス）を防ぐため、
 * Supabase へのセッション確認はこのコンポーネントで「一生に一度だけ」実行します。
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const { setUser, clearAuth, isInitialized, setInitialized } = useAuthStore();

    useEffect(() => {
        // 既に初期化中、または完了済みの場合は何もしない (シングルトン・ガード)
        if (isInitialized) return;

        // 初期化開始をマーク
        setInitialized(true);

        const initializeAuth = async () => {
            try {
                // 1. 現在のセッション（ログイン状態）を確認
                const {
                    data: { user: supabaseUser },
                } = await supabase.auth.getUser();

                if (supabaseUser) {
                    // 生データをドメイン型 (Branded Types) へパース・変換
                    const domainUser = userSchema.parse({
                        ...supabaseUser,
                        name: supabaseUser.user_metadata?.name || "Unknown",
                    });
                    setUser(domainUser);
                } else {
                    clearAuth();
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                clearAuth();
            }
        };

        initializeAuth();

        // 2. 認証状態の変化を購読 (ログイン/ログアウト/トークン更新)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const domainUser = userSchema.parse({
                    ...session.user,
                    name: session.user.user_metadata?.name || "Unknown",
                });
                setUser(domainUser);
            } else {
                clearAuth();
            }
        });

        // クリーンアップ: 購読の解除
        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth, setUser, clearAuth, isInitialized, setInitialized]);

    return <>{children}</>;
}
