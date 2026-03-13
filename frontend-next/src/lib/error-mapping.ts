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

    // 1. Supabase Auth 関連のエラー
    if (error instanceof AuthError) {
        appError.message = error.message;

        switch (error.status) {
            case 400:
                appError.type = "AUTH_FAILED";
                if (error.message.includes("already registered")) {
                    appError.message = "このメールアドレスは既に登録されています。";
                }
                break;
            case 401:
                appError.type = "AUTH_EXPIRED";
                appError.message =
                    "セッションの期限が切れました。再度ログインしてください。";
                break;
            case 422:
                appError.type = "VALIDATION_ERROR";
                appError.message = "入力内容に不備があります。";
                break;
            case 429:
                appError.type = "RATE_LIMIT";
                appError.message =
                    "リクエストが多すぎます。しばらく時間を置いてからお試しください。";
                break;
        }
        return appError;
    }

    // 2. PostgREST (Database) 関連のエラー判定
    // (PostgREST エラーは instance of で判定できないため、オブジェクトのプロパティで判別)
    if (isPostgrestError(error)) {
        const code = error.code;

        // PostgreSQL のエラーコードに基づく変換
        if (code === "23505") {
            // Unique Violation
            appError.type = "VALIDATION_ERROR";
            appError.message = "既に登録されています。";
            // 簡易的なフィールドマッピング（実際には詳細なパースが必要）
            appError.errors = {
                email: ["このメールアドレスは既に登録されています。"],
            };
        } else if (code === "23514") {
            // Check Violation (例: name の 50文字制限など)
            appError.type = "VALIDATION_ERROR";
            appError.message = "入力内容が規定の制限を超えています。";
        } else if (code.startsWith("PGRST")) {
            appError.type = "SYSTEM_ERROR";
            appError.message = "データベースエラーが発生しました。";
        } else if (code === "42501") {
            // RLS Violation
            appError.type = "PERMISSION_DENIED";
            appError.message = "この操作を行う権限がありません。";
        }

        return appError;
    }

    // 3. ネットワークエラー判定
    if (error instanceof TypeError && error.message === "Failed to fetch") {
        appError.type = "NETWORK_ERROR";
        appError.message =
            "ネットワークに接続できません。通信環境を確認してください。";
        return appError;
    }

    return appError;
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
        typeof (error as Record<string, unknown>).code === "string" &&
        "message" in error &&
        typeof (error as Record<string, unknown>).message === "string"
    );
}
