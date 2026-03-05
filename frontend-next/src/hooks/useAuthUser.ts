import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { userSchema } from "@/lib/schemas";

/**
 * 認証情報アクセスのための抽象化カスタムフック
 *
 * UI コンポーネントはこのフックを唯一の窓口として使用します。
 * 内部で Supabase のセッション監視とストアへの同期を行い、
 * バックエンドの実装詳細（JWT等）を隠蔽します。
 */
export function useAuthUser() {
    const supabase = createClient();
    const { user, isAuthenticated, isInitialLoading, setUser, clearAuth } =
        useAuthStore();

    useEffect(() => {
        // 1. 初期セッションの確認と同期
        const initializeAuth = async () => {
            try {
                const {
                    data: { user: supabaseUser },
                } = await supabase.auth.getUser();

                if (supabaseUser) {
                    // 生データをドメイン型 (Branded Types) へパース・変換
                    // Auth オブジェクトの user_metadata から name を抽出してマッピング
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
    }, [supabase.auth, setUser, clearAuth]);

    return {
        user,
        isAuthenticated,
        isInitialLoading,
    };
}
