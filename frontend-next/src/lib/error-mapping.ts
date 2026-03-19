import { AuthError } from "@supabase/supabase-js";
import { AppError } from "@/types/error";

/**
 * Supabase からのエラーを OmoikaNex の共通エラー形式に変換します。
 * (TEST_CASES.md セクション 5 の要件に基づく実装)
 */
export function mapSupabaseError(error: unknown): AppError {
    // デフォルトのエラー（システムエラー）
    const appError: AppError = {
        type: "SYSTEM_ERROR",
        message: "予期せぬエラーが発生しました。",
        originalError: error,
    };

    const errorMsg = (error instanceof Error ? error.message : String(error)).toLowerCase();

    // 1. Supabase Auth 関連のエラー判定
    if (isSupabaseAuthError(error)) {
        appError.message = error.message;

        // HTTP ステータスコードまたはメッセージ内容による詳細判定
        const status = error.status;
        const message = error.message.toLowerCase();

        if (status === 401) {
            appError.type = "AUTH_EXPIRED";
            appError.message = "セッションの期限が切れました。再度ログインしてください。";
        } else if (status === 429) {
            appError.type = "RATE_LIMIT";
            appError.message = "リクエストが多すぎます。しばらく時間を置いてからお試しください。";
        } else if (message.includes("already registered")) {
            appError.type = "AUTH_FAILED";
            appError.message = "このメールアドレスは既に登録されています。";
            appError.errors = {
                email: ["このメールアドレスは既に登録されています。"],
            };
        } else if (message.includes("not confirmed") || message.includes("not verified")) {
            appError.type = "AUTH_NOT_CONFIRMED";
            appError.message = "メール認証が完了していません。";
        } else if (
            status === 400 ||
            message.includes("invalid login credentials") ||
            message.includes("invalid credentials")
        ) {
            appError.type = "AUTH_FAILED";
            appError.message = "認証情報が一致しません。";
        }

        // JSON パースエラーや「fetch failed」などがラップされている場合は下流の判定に任せる
        if (
            !message.includes("unexpected end of json input") &&
            !message.includes("auth session or user missing") &&
            !message.includes("fetch")
        ) {
            return appError;
        }
    }

    // 2. PostgREST (Database) 関連のエラー判定
    if (isPostgrestError(error)) {
        const code = error.code;

        if (code === "23505") {
            appError.type = "VALIDATION_ERROR";
            appError.message = "既に登録されています。";
            appError.errors = {
                email: ["このメールアドレスは既に登録されています。"],
            };
        } else if (code === "23514") {
            appError.type = "VALIDATION_ERROR";
            appError.message = "入力内容が規定の制限を超えています。";
        } else if (typeof code === "string" && code.startsWith("PGRST")) {
            appError.type = "SYSTEM_ERROR";
            appError.message = "データベースエラーが発生しました。";
        } else if (code === "42501") {
            appError.type = "PERMISSION_DENIED";
            appError.message = "この操作を行う権限がありません。";
        }

        return appError;
    }

    // 3. ネットワークエラー判定
    if (
        errorMsg.includes("failed to fetch") ||
        errorMsg.includes("fetch failed") ||
        errorMsg.includes("load failed")
    ) {
        appError.type = "NETWORK_ERROR";
        appError.message = "ネットワークに接続できません。通信環境を確認してください。";
        return appError;
    }

    // 4. サーバー/パースエラー
    if (
        errorMsg.includes("unexpected end of json input") ||
        errorMsg.includes("auth session or user missing") ||
        error instanceof SyntaxError
    ) {
        appError.type = "SYSTEM_ERROR";
        appError.message = "サーバーで問題が発生しました。しばらく時間を置いてからお試しください。";
        return appError;
    }

    return appError;
}

/**
 * 型ガード: Supabase Auth エラーかどうかを判定します。
 */
function isSupabaseAuthError(error: unknown): error is AuthError {
    return (
        error instanceof AuthError ||
        (typeof error === "object" && error !== null && "__isAuthError" in error)
    );
}

/**
 * 型ガード: PostgREST エラーかどうかを判定します。
 */
function isPostgrestError(
    error: unknown,
): error is { code: string; message: string; details: string; hint: string } {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        "message" in error &&
        "details" in error &&
        "hint" in error
    );
}
