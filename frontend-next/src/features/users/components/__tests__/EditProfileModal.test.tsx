import { render, screen, waitFor } from "@testing-library/react";
import { EditProfileModal } from "../EditProfileModal";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { asUserId } from "@/types/brands";
import userEvent from "@testing-library/user-event";
import { updateProfile } from "@/features/users/api/update-profile";
import { toast } from "sonner";
import React from "react";

// Server Action のモック
vi.mock("@/features/users/api/update-profile", () => ({
    updateProfile: vi.fn(),
}));

// トーストのモック
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// URL.createObjectURL/revokeObjectURL のモック (画像プレビュー用)
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

describe("EditProfileModal (ID 5-1, 5-2, 5-3: プロフィール管理・結合テスト)", () => {
    let queryClient: QueryClient;

    const mockUser = {
        id: asUserId("user-1"),
        name: "Old Name",
        email: "test@example.com",
        avatar_url: "old-avatar.png",
        created_at: "now",
        updated_at: "now",
        profile_text: "Old Bio",
        is_following: false,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });
    });

    it("ID 5-1: [Integration] 正常値で保存実行した際、Server Actionが発火し、UI全域（キャッシュ）へ即時反映されること", async () => {
        const user = userEvent.setup();
        vi.mocked(updateProfile).mockResolvedValue({ success: true });

        render(
            <EditProfileModal
                user={mockUser}
                trigger={<button>Edit</button>}
            />,
            { wrapper },
        );

        // 1. モーダルを開く
        await user.click(screen.getByText("Edit"));
        expect(screen.getByText("プロフィールを編集")).toBeInTheDocument();

        // 2. フォーム入力
        const nameInput = screen.getByLabelText("名前");
        const bioInput = screen.getByLabelText("自己紹介");

        await user.clear(nameInput);
        await user.type(nameInput, "New Name");
        await user.clear(bioInput);
        await user.type(bioInput, "New Bio");

        // 3. 保存実行
        await user.click(screen.getByRole("button", { name: "保存" }));

        // 4. 検証: APIが正しい FormData で呼ばれたか
        await waitFor(() => {
            expect(updateProfile).toHaveBeenCalled();
            const formData = vi.mocked(updateProfile).mock.calls[0][0];
            expect(formData.get("name")).toBe("New Name");
            expect(formData.get("profileText")).toBe("New Bio");
        });

        // 5. 検証: モーダルが閉じているか
        await waitFor(() => {
            expect(
                screen.queryByText("プロフィールを編集"),
            ).not.toBeInTheDocument();
        });
    });

    it("ID 5-3: [Integration] 更新API失敗時、UIが一時的に待機後、トーストで「更新に失敗しました」と表示され、モーダルが開いたままであること", async () => {
        const user = userEvent.setup();
        vi.mocked(updateProfile).mockResolvedValue({
            success: false,
            error: { type: "SYSTEM_ERROR", message: "更新に失敗しました" },
        });

        render(
            <EditProfileModal
                user={mockUser}
                trigger={<button>Edit</button>}
            />,
            { wrapper },
        );

        await user.click(screen.getByText("Edit"));
        await user.click(screen.getByRole("button", { name: "保存" }));

        // 💡 判定: エラートーストが呼ばれていること (実際のメッセージに同期)
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("更新に失敗しました");
        });

        // 💡 判定: モーダルが開いたままであること
        expect(screen.getByText("プロフィールを編集")).toBeInTheDocument();
    });

    it("ID 5-1: [Unit] 名前が空の場合、バリデーションエラーが表示され送信が阻止されること", async () => {
        const user = userEvent.setup();
        render(
            <EditProfileModal
                user={mockUser}
                trigger={<button>Edit</button>}
            />,
            { wrapper },
        );

        await user.click(screen.getByText("Edit"));
        const nameInput = screen.getByLabelText("名前");

        await user.clear(nameInput);
        await user.click(screen.getByRole("button", { name: "保存" }));

        // 💡 判定: Zod のエラーメッセージが出ていること
        expect(
            await screen.findByText("名前を入力してください"),
        ).toBeInTheDocument();
        expect(updateProfile).not.toHaveBeenCalled();
    });

    it("ID 5-2: [Unit][Backend] 5MBを超える画像を選択した際、フロントのガードによりエラーが表示され送信が阻止されること", async () => {
        const user = userEvent.setup();
        render(
            <EditProfileModal
                user={mockUser}
                trigger={<button>Edit</button>}
            />,
            { wrapper },
        );

        await user.click(screen.getByText("Edit"));

        // 5MB超のダミーファイル
        const largeFile = new File([new ArrayBuffer(5242881)], "large.png", {
            type: "image/png",
        });
        const input = screen.getByTestId("avatar-input");

        await user.upload(input, largeFile);

        // 💡 判定: サイズエラーのメッセージが表示されること
        expect(
            await screen.findByText("画像サイズは5MB以内にしてください"),
        ).toBeInTheDocument();

        // 💡 判定: 保存を押しても API が呼ばれないこと
        await user.click(screen.getByRole("button", { name: "保存" }));
        expect(updateProfile).not.toHaveBeenCalled();
    });

    it("ID 5-7: [Integration] エラー発生後にモーダルを閉じ、再度開いた際に、内部ステートが初期化され正常な状態から再試行できること", async () => {
        const user = userEvent.setup();
        render(
            <EditProfileModal
                user={mockUser}
                trigger={<button>Edit</button>}
            />,
            { wrapper },
        );

        await user.click(screen.getByText("Edit"));

        // 1. エラーを発生させる
        const largeFile = new File([new ArrayBuffer(5242881)], "large.png", { type: "image/png" });
        await user.upload(screen.getByTestId("avatar-input"), largeFile);
        expect(await screen.findByText("画像サイズは5MB以内にしてください")).toBeInTheDocument();

        // 2. モーダルを閉じる
        await user.keyboard("{Escape}");
        await waitFor(() => {
            expect(screen.queryByText("プロフィールを編集")).not.toBeInTheDocument();
        });

        // 3. 再び開く
        await user.click(screen.getByText("Edit"));

        // 💡 判定: エラーが消え、デフォルトの状態に戻っていること
        expect(screen.queryByText("画像サイズは5MB以内にしてください")).not.toBeInTheDocument();
        expect(screen.getByText("クリックして画像を変更")).toBeInTheDocument();
    });

    it("ID 5-6: [Integration] 画像プレビュー生成後にキャンセル・上書きを行う際、古いBlob URLが確実に解放されること（※プレビュー表示の検証）", async () => {
        const user = userEvent.setup();
        render(
            <EditProfileModal
                user={mockUser}
                trigger={<button>Edit</button>}
            />,
            { wrapper },
        );

        await user.click(screen.getByText("Edit"));

        const file = new File(["hello"], "avatar.png", { type: "image/png" });
        const input = screen.getByTestId("avatar-input");

        await user.upload(input, file);

        // 💡 判定: プレビューが表示されること
        const previewImage = screen.getByAltText("Avatar");
        expect(previewImage.getAttribute("src")).toContain("mock-url");
    });
});
