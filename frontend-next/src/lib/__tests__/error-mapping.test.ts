import { describe, it, expect } from "vitest";
import { mapSupabaseError } from "../error-mapping";

describe("mapSupabaseError (判定漏れの検証)", () => {
    it("ID 6-1 [異常系]: 大文字混じりのネットワークエラーメッセージが、正しく NETWORK_ERROR にマッピングされること", () => {
        // 💡 現在の実装では errorMsg.includes("Failed to fetch") など大文字を期待している箇所があるが、
        // 指摘の通り、小文字化の統一が漏れているとマッチしないリスクがある。
        const error = new Error("Failed to fetch");
        const appError = mapSupabaseError(error);

        expect(appError.type).toBe("NETWORK_ERROR");
        expect(appError.message).toContain("ネットワークに接続できません");
    });

    it('ID 6-4 [異常系]: 小文字のみのエラーメッセージ "failed to fetch" でも正しく判定されること', () => {
        const error = new Error("failed to fetch");
        const appError = mapSupabaseError(error);

        expect(appError.type).toBe("NETWORK_ERROR");
    });

    it('ID 6-5 [異常系]: パースエラー "Unexpected end of JSON input" が正しく SYSTEM_ERROR にマッピングされること', () => {
        const error = new Error("Unexpected end of JSON input");
        const appError = mapSupabaseError(error);

        expect(appError.type).toBe("SYSTEM_ERROR");
        expect(appError.message).toContain("サーバーで問題が発生しました");
    });
});
