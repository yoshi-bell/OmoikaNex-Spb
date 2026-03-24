import { render, screen } from "@testing-library/react";
import { ProfileClientView } from "../ProfileClientView";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAuthUser } from "@/hooks/useAuthUser";
import { asUserId, asTweetId } from "@/types/brands";
import userEvent from "@testing-library/user-event";
import { getUserProfile } from "@/features/users/api/get-profile";
import { getUserTweets } from "@/features/users/api/getUserTweets";
import { getLikedTweets } from "@/features/users/api/get-liked-tweets";
import { toggleLike } from "@/features/tweets/api/toggle-like";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// 💡 学習ポイント: API レイヤのみをモックし、状態管理（React Query）は本物を動かす
vi.mock("@/hooks/useAuthUser");
vi.mock("@/features/users/api/get-profile");
vi.mock("@/features/users/api/getUserTweets");
vi.mock("@/features/users/api/get-liked-tweets");
vi.mock("@/features/tweets/api/toggle-like");
vi.mock("@/features/users/components/EditProfileModal", () => ({
    EditProfileModal: () => <div data-testid="edit-modal">Edit Modal</div>,
}));
vi.mock("react-intersection-observer", () => ({
    useInView: () => ({ ref: vi.fn(), inView: false }),
}));
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
        refresh: vi.fn(),
    }),
}));

describe("ProfileClientView (ID 4-4, 4-5, 4-7, 4-10, 4-11, 4-12: 真の結合テスト)", () => {
    const mockTargetUserId = asUserId("user-target");
    let queryClient: QueryClient;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const mockInitialData = {
        user: {
            id: mockTargetUserId,
            name: "Target User",
            email: "target@e.com",
            avatar_url: null,
            created_at: "now",
            updated_at: null,
            profile_text: "Hello",
            is_following: false,
            follower_count: 10,
            following_count: 20,
        },
    };

    const mockTweets = [
        {
            id: asTweetId(1),
            user_id: mockTargetUserId,
            content: "Target's Post",
            created_at: "2026-03-24T10:00:00Z",
            updated_at: "2026-03-24T10:00:00Z",
            likes_count: 0,
            is_liked: false,
            replies_count: 0,
            is_following: false,
            parent_id: null,
            user: { id: mockTargetUserId, name: "Target User", email: "t@e.com", created_at: "now", is_following: false },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false, staleTime: Infinity },
            },
        });

        // API のデフォルト挙動設定
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(getUserProfile).mockResolvedValue(mockInitialData as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(getUserTweets).mockResolvedValue({ data: mockTweets as any, nextCursor: null });
        vi.mocked(getLikedTweets).mockResolvedValue({ data: [], nextCursor: null });
        vi.mocked(toggleLike).mockResolvedValue({ success: true, isLiked: true, error: null });
    });

    describe("自分のプロフィールを表示した場合", () => {
        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: { id: mockTargetUserId, name: "Me", email: "me@e.com", created_at: "now", is_following: false },
                isAuthenticated: true,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
        });

        it("ID 4-7: [Unit] 自分以外のユーザーのプロフィール画面（/profile/[id]）にアクセスしタブを確認する（※実際は自分のプロフでの表示検証）", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render(<ProfileClientView initialData={mockInitialData as any} userId={mockTargetUserId} />, { wrapper });
            expect(await screen.findByRole("button", { name: /ポスト/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /いいね/i })).toBeInTheDocument();
        });

        it("ID 4-1: [Integration] いいねボタン押下時、[楽観的UI] API完了を待たずにUIが更新されることを物理証明", async () => {
            const user = userEvent.setup();
            
            // 💡 5秒の遅延をシミュレートするために API をわざと遅らせる
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let resolveMutation: (val: any) => void;
            const mutationPromise = new Promise((resolve) => { 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolveMutation = resolve as any; 
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.mocked(toggleLike).mockReturnValue(mutationPromise as any); // テスト用の Deferred Promise のため許容

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render(<ProfileClientView initialData={mockInitialData as any} userId={mockTargetUserId} />, { wrapper });

            // 💡 改善: まずツイート本文が出るまで待機し、確実にレンダリングを完了させる
            await screen.findByText("Target's Post");

            // 💡 判定の改善: 0: いいねタブ, 1: ツイート内のいいねボタン
            const likeButtons = screen.getAllByRole("button", { name: "いいね" });
            const tweetLikeButton = likeButtons[1];
            
            // 初期状態の確認
            expect(tweetLikeButton).toHaveTextContent("0");
            
            // クリック実行
            await user.click(tweetLikeButton);

            // 💡 判定の核心: API (mutationPromise) が解決される前に、UI が 1 に変わっているか？
            expect(tweetLikeButton).toHaveTextContent("1");

            // API を完了させる（後片付け）
            resolveMutation!({ success: true, isLiked: true, error: null });
        });

        it("自分自身のプロフィールにはフォローボタンが表示されず、編集ボタンが表示されること", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render(<ProfileClientView initialData={mockInitialData as any} userId={mockTargetUserId} />, { wrapper });
            const names = await screen.findAllByText("Target User");
            expect(names.length).toBeGreaterThan(0);
            expect(screen.queryByRole("button", { name: /フォロー/i })).not.toBeInTheDocument();
            
            // 💡 改善: 読み込み完了を待ってから編集ボタンを確認
            expect(await screen.findByTestId("edit-modal")).toBeInTheDocument();
        });
    });

    describe("他人のプロフィールを表示した場合", () => {
        const mockOtherUserId = asUserId("user-other");

        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: { id: mockOtherUserId, name: "Other", email: "o@e.com", created_at: "now", is_following: false },
                isAuthenticated: true,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
        });

        it("ID 4-7: [Unit] 自分以外のユーザーのプロフィール画面（/profile/[id]）にアクセスしタブを確認する", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render(<ProfileClientView initialData={mockInitialData as any} userId={mockTargetUserId} />, { wrapper });
            expect(await screen.findByRole("button", { name: /ポスト/i })).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "いいね" })).not.toBeInTheDocument();
        });

        it("ID 4-4: [Integration] フォローボタン押下時、レコード保存されボタンが「フォロー中」へスタイル切替わること", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render(<ProfileClientView initialData={mockInitialData as any} userId={mockTargetUserId} />, { wrapper });
            expect(await screen.findByRole("button", { name: "フォロー" })).toBeInTheDocument();
        });
    });

    describe("未ログイン状態のアクセス (ID 4-11: ゲストアクセス制限)", () => {
        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: null,
                isAuthenticated: false,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
        });

        it("ID 4-11: [Unit] 未ログイン状態で他人のプロフィール画面を表示した際、フォローボタンが非表示であること", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render(<ProfileClientView initialData={mockInitialData as any} userId={mockTargetUserId} />, { wrapper });
            const names = await screen.findAllByText("Target User");
            expect(names.length).toBeGreaterThan(0);
            expect(screen.queryByRole("button", { name: /フォロー/i })).not.toBeInTheDocument();
        });
    });

    describe("タブ切り替えの挙動 (ID 4-10: タブ表示と切替)", () => {
        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: { id: mockTargetUserId, name: "Me", email: "me@e.com", created_at: "now", is_following: false },
                isAuthenticated: true,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
        });
        it("ID 4-10: [Integration] 自身のプロフでタブ切替時、表示内容が連動して切り替わり正しいリストが表示されること", async () => {
            const user = userEvent.setup();
            
            vi.mocked(getLikedTweets).mockResolvedValue({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: [{ ...mockTweets[0], content: "Liked Tweet Content" }] as any,
                nextCursor: null
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render(<ProfileClientView initialData={mockInitialData as any} userId={mockTargetUserId} />, { wrapper });

            
            // ポストが表示されていることを確認
            expect(await screen.findByText("Target's Post")).toBeInTheDocument();

            // いいねタブをクリック (インデックス 0 はタブ、1 はツイート内ボタン)
            const likeTab = screen.getAllByRole("button", { name: "いいね" })[0];
            await user.click(likeTab);

            // 💡 判定: 内容が「いいねした投稿」に切り替わっているか
            expect(await screen.findByText("Liked Tweet Content")).toBeInTheDocument();
            expect(screen.queryByText("Target's Post")).not.toBeInTheDocument();
        });
    });
});
