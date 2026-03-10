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
    // 初期化（Supabaseとの初回の疎通）が開始/完了したかどうかのフラグ
    isInitialized: boolean;

    // アクション: ユーザー情報のセット
    setUser: (user: UserDomain | null) => void;
    // アクション: ログアウト処理（状態のリセット）
    clearAuth: () => void;
    // アクション: 初期化開始フラグのセット
    setInitialized: (value: boolean) => void;
}

/**
 * 認証情報を一元管理する Zustand ストア
 */
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isInitialLoading: true,
    isInitialized: false,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
            isInitialLoading: false,
            isInitialized: true,
        }),

    clearAuth: () =>
        set({
            user: null,
            isAuthenticated: false,
            isInitialLoading: false,
            isInitialized: true,
        }),

    setInitialized: (value) => set({ isInitialized: value }),
}));
