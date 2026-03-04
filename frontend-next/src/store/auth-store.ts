import { create } from "zustand";
import { UserDomain } from "@/lib/schemas";

/**
 * 認証状態を管理するストアのインターフェース
 */
interface AuthState {
    // 現在ログイン中のユーザー（未ログイン時は null）
    user: UserDomain | null;
    // 認証状態のフラグ
    isAuthenticated: boolean;
    // 初期ロード中かどうかのフラグ
    isInitialLoading: boolean;

    // アクション: ユーザー情報のセット
    setUser: (user: UserDomain | null) => void;
    // アクション: ログアウト処理（状態のリセット）
    clearAuth: () => void;
}

/**
 * 認証情報を一元管理する Zustand ストア
 */
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isInitialLoading: true,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
            isInitialLoading: false,
        }),

    clearAuth: () =>
        set({
            user: null,
            isAuthenticated: false,
            isInitialLoading: false,
        }),
}));
