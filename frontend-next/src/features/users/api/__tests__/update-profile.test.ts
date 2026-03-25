import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateProfile } from "../update-profile";
import { createClient } from "@/lib/supabase/server";

// Supabase Server Client のモック
vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn(),
}));

describe("updateProfile Repository (ID 5-1, 5-4, 5-5: プロフィール更新・セキュリティ検証)", () => {
    const mockUserId = "user-1";
    const mockOtherUserId = "user-other";

    // 💡 ポイント: メソッドチェーンをシミュレートするための専用オブジェクト
    const mockQueryChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
    };

    const mockSupabase = {
        auth: {
            getUser: vi.fn(),
        },
        storage: {
            from: vi.fn().mockReturnThis(),
            upload: vi.fn(),
        },
        from: vi.fn().mockReturnValue(mockQueryChain),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

        // デフォルト: 本人としてログイン済み
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: mockUserId } },
            error: null,
        });

        // デフォルト: API成功
        mockSupabase.storage.upload.mockResolvedValue({ data: {}, error: null });
        mockQueryChain.eq.mockResolvedValue({ error: null });
    });

    const createFormData = (userId: string, name = "New Name") => {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("name", name);
        formData.append("profileText", "Default Bio content"); // 💡 Zodを通過させるためのデフォルト値
        return formData;
    };

    it("ID 5-1: [Integration] 正常な認証情報とデータで更新した際、成功を返すこと (Happy Path)", async () => {
        const formData = createFormData(mockUserId);
        const result = await updateProfile(formData);

        expect(result.success).toBe(true);
        expect(mockSupabase.from).toHaveBeenCalledWith("users");
        expect(mockQueryChain.update).toHaveBeenCalledWith(
            expect.objectContaining({ name: "New Name" })
        );
    });

    it("ID 5-4: [Backend][E2E] 他人のUUIDで更新を試みた際、認証チェックにより拒否されること", async () => {
        // 💡 攻撃：FormData には他人の ID を入れるが、セッションは本人
        const formData = createFormData(mockOtherUserId);
        
        const result = await updateProfile(formData);

        // 💡 判定: error-mapping.ts の定義に沿ったメッセージであることを検証
        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("PERMISSION_DENIED");
        expect(result.error?.message).toBe("この操作を行う権限がありません。");
        expect(mockQueryChain.update).not.toHaveBeenCalled();
    });

    it("ID 5-5: [Backend] 他人のパスへ画像をアップロードしようとした際、Storageエラーが適切にハンドリングされること", async () => {
        const formData = createFormData(mockUserId);
        formData.append("avatarFile", new File(["dummy image content"], "avatar.png", { type: "image/png" }));

        // 💡 攻撃：Storage が 403 (権限なし) を返す (details, hint を追加)
        mockSupabase.storage.upload.mockResolvedValue({
            data: null,
            error: { message: "Access denied", code: "42501", details: "", hint: "" },
        });

        const result = await updateProfile(formData);

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("PERMISSION_DENIED");
        expect(result.error?.message).toBe("この操作を行う権限がありません。");
    });

    it("ID 5-2: [Unit][Backend] 5MBを超える巨大な画像（DoS攻撃）をサーバー側で拒絶できること", async () => {
        const formData = createFormData(mockUserId);
        // 5MB超のダミーファイル
        const largeFile = new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], "large.png", { type: "image/png" });
        formData.append("avatarFile", largeFile);

        const result = await updateProfile(formData);

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe("画像サイズは5MB以内にしてください");
        expect(mockSupabase.storage.upload).not.toHaveBeenCalled();
    });

    it("ID 5-8: [Unit][Backend] 許可されていないファイル形式（MIMEスプーフィング）をサーバー側で検知し、物理的にアップロードを拒絶できること", async () => {
        const formData = createFormData(mockUserId);
        const maliciousFile = new File(["malicious content"], "attack.exe", { type: "application/x-msdownload" });
        formData.append("avatarFile", maliciousFile);

        const result = await updateProfile(formData);

        expect(result.success).toBe(false);
        expect(result.error?.message).toBe("許可されていないファイル形式です");
        expect(mockSupabase.storage.upload).not.toHaveBeenCalled();
    });

    it("ID 5-9: [Unit][Backend] 50文字を超える名前等の不正データを直接 POST した際、DB到達前にサーバー側 Zod で検知・遮断できること", async () => {
        const longName = "a".repeat(51); // 50文字制限超過
        const formData = createFormData(mockUserId, longName);

        const result = await updateProfile(formData);

        expect(result.success).toBe(false);
        expect(result.error?.type).toBe("VALIDATION_ERROR");
        expect(result.error?.message).toBe("入力内容が規定の制限を超えています。");
        expect(mockQueryChain.update).not.toHaveBeenCalled();
    });
});
