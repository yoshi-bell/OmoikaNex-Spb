/**
 * OmoikaNex プロジェクトにおける共通エラー種別
 */
export type AppErrorType =
    | "VALIDATION_ERROR" // 入力値の不備
    | "AUTH_FAILED" // 認証情報の不一致（ログイン失敗など）
    | "AUTH_NOT_CONFIRMED" // メール認証が未完了
    | "AUTH_EXPIRED" // セッション有効期限切れ
    | "NOT_FOUND" // リソースが存在しない
    | "PERMISSION_DENIED" // 権限不足 (RLS 違反など)
    | "RATE_LIMIT" // 過剰なリクエスト
    | "NETWORK_ERROR" // 通信断、タイムアウト
    | "SYSTEM_ERROR"; // その他、予期せぬサーバーエラー

/**
 * UI へ渡される統一エラーオブジェクトの構造
 */
export interface AppError {
    type: AppErrorType;
    message: string;
    // バリデーションエラーの場合、フィールドごとのメッセージを格納
    // Laravel のレスポンス形式 (Record<string, string[]>) に準拠
    errors?: Record<string, string[]>;
    // デバッグ用の生のエラー情報（開発環境のみで使用）
    originalError?: unknown;
}
