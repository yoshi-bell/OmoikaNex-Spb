import { describe, it, expect } from "vitest";
import { mapSupabaseError } from "../error-mapping";

describe("mapSupabaseError (BaaS エラーマッピングの検証)", () => {
    describe("ID 6-1: 通信断 (Network)", () => {
        it("大文字混じりのメッセージ (Failed to fetch) を判定できること", () => {
            const error = new Error("Failed to fetch");
            const appError = mapSupabaseError(error);
            expect(appError.type).toBe("NETWORK_ERROR");
            expect(appError.message).toContain("ネットワークに接続できません");
        });

        it("小文字のみのメッセージ (failed to fetch) を判定できること", () => {
            const error = new Error("failed to fetch");
            const appError = mapSupabaseError(error);
            expect(appError.type).toBe("NETWORK_ERROR");
        });
    });

    it("ID 6-2 [異常系]: 認証期限切れ (401) が正しく AUTH_EXPIRED にマッピングされること", () => {
        const error = {
            __isAuthError: true,
            status: 401,
            message: "Invalid login credentials",
        };
        const appError = mapSupabaseError(error);

        expect(appError.type).toBe("AUTH_EXPIRED");
        expect(appError.message).toContain("セッションの期限が切れました");
    });

    it("ID 6-3: [異常系] RLS による 0 件レスポンス（論理矛盾）が発生した際、SYSTEM_ERROR にフォールバックされること", () => {
        // マッパーが未知の文字列エラーを SYSTEM_ERROR にフォールバックすることを確認
        const error = "RLS_EMPTY_RESPONSE";
        const appError = mapSupabaseError(error);

        expect(appError.type).toBe("SYSTEM_ERROR");
    });

    it("ID 6-4 [異常系]: レートリミット (429) が正しく RATE_LIMIT にマッピングされること", () => {
        const error = {
            __isAuthError: true,
            status: 429,
            message: "Too many requests",
        };
        const appError = mapSupabaseError(error);

        expect(appError.type).toBe("RATE_LIMIT");
        expect(appError.message).toContain("リクエストが多すぎます");
    });

    describe("ID 6-5: DB 制約違反 (PostgREST) & パースエラー", () => {
        it("一意制約違反 (23505) が VALIDATION_ERROR になること", () => {
            const conflictError = {
                code: "23505",
                message: "duplicate key",
                details: "",
                hint: "",
            };
            const appError = mapSupabaseError(conflictError);
            expect(appError.type).toBe("VALIDATION_ERROR");
            expect(appError.message).toContain("既に登録されています");
        });

        it("未知の PGRST エラーが SYSTEM_ERROR になること", () => {
            const unknownError = {
                code: "PGRST999",
                message: "unknown pgrst error",
                details: "",
                hint: "",
            };
            const appError = mapSupabaseError(unknownError);
            expect(appError.type).toBe("SYSTEM_ERROR");
            expect(appError.message).toContain("データベースエラーが発生しました");
        });

        it("JSON パースエラーが SYSTEM_ERROR になること", () => {
            const error = new Error("Unexpected end of JSON input");
            const appError = mapSupabaseError(error);
            expect(appError.type).toBe("SYSTEM_ERROR");
            expect(appError.message).toContain("サーバーで問題が発生しました");
        });
    });
});
