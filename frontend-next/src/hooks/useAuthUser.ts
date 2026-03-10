import { useAuthStore } from "@/store/auth-store";

/**
 * 認証情報アクセスのための抽象化カスタムフック
 *
 * Web Locks の競合を防ぐため、初期化ロジックは AuthProvider へ移動しました。
 * このフックは Zustand ストアから現在の認証状態を返すのみの軽量な窓口です。
 */
export function useAuthUser() {
    const { user, isAuthenticated, isInitialLoading } = useAuthStore();

    return {
        user,
        isAuthenticated,
        isInitialLoading,
    };
}
