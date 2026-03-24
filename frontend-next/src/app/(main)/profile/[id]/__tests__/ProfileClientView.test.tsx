import { render, screen, waitFor } from "@/test/utils";
import { ProfileClientView } from "../ProfileClientView";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToggleFollow } from "@/features/follows/hooks/useToggleFollow";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { asUserId, asTweetId } from "@/types/brands";
import userEvent from "@testing-library/user-event";
import { UserProfileResponse } from "@/features/users/api/get-profile";
import { type TweetDomain } from "@/lib/schemas";
import { useInView } from "react-intersection-observer";

// モックの設定
vi.mock("@/hooks/useAuthUser");
vi.mock("@/features/follows/hooks/useToggleFollow");
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return {
        ...actual,
        useQuery: vi.fn(),
        useInfiniteQuery: vi.fn(),
    };
});
vi.mock("react-intersection-observer");
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
        refresh: vi.fn(),
    }),
}));

// 子コンポーネントの簡易モック
vi.mock("@/features/tweets/components/TweetCard", () => ({
    TweetCard: ({ tweet }: { tweet: TweetDomain }) => <div data-testid="tweet-card">{tweet.content}</div>,
}));
vi.mock("@/features/users/components/EditProfileModal", () => ({
    EditProfileModal: () => <div data-testid="edit-modal">Edit Modal</div>,
}));

describe("ProfileClientView (ID 4-4, 4-5, 4-7, 4-10, 4-11, 4-12: エンゲージメント・表示制御検証)", () => {
    const mockTargetUserId = asUserId("user-target");
    const mockInitialData: UserProfileResponse = {
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

    const mockTweets: TweetDomain[] = [
        {
            id: asTweetId(1),
            user_id: mockTargetUserId,
            content: "Target's Post",
            created_at: "now",
            updated_at: "now",
            likes_count: 0,
            is_liked: false,
            replies_count: 0,
            is_following: false,
            parent_id: null,
            user: { id: mockTargetUserId, name: "Target User", email: "t@e.com", created_at: "now", is_following: false },
        },
    ];

    const mockToggleFollow = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        
        // 共通のモック設定
        vi.mocked(useToggleFollow).mockReturnValue({
            mutate: mockToggleFollow,
            isPending: false,
        } as unknown as ReturnType<typeof useToggleFollow>);

        vi.mocked(useInView).mockReturnValue({
            ref: vi.fn(),
            inView: false,
        } as unknown as ReturnType<typeof useInView>);

        vi.mocked(useQuery).mockReturnValue({
            data: mockInitialData,
            isLoading: false,
        } as unknown as ReturnType<typeof useQuery>);

        // 無限スクロールのデフォルトモック
        vi.mocked(useInfiniteQuery).mockReturnValue({
            data: {
                pages: [{ data: mockTweets, nextCursor: null }],
            },
            isLoading: false,
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchNextPage: vi.fn(),
        } as unknown as ReturnType<typeof useInfiniteQuery>);
    });

    describe("自分のプロフィールを表示した場合", () => {
        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: { id: mockTargetUserId, name: "Me", email: "me@e.com", created_at: "now", is_following: false },
                isAuthenticated: true,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
            } as unknown as ReturnType<typeof useAuthUser>);
        });

        it("ID 4-7: 「ポスト」タブと「いいね」タブの両方が表示されること", () => {
            render(<ProfileClientView initialData={mockInitialData} userId={mockTargetUserId} />);
            expect(screen.getByRole("button", { name: /ポスト/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /いいね/i })).toBeInTheDocument();
        });

        it("自分自身のプロフィールにはフォローボタンが表示されず、編集ボタンが表示されること", () => {
            render(<ProfileClientView initialData={mockInitialData} userId={mockTargetUserId} />);
            expect(screen.queryByRole("button", { name: /フォロー/i })).not.toBeInTheDocument();
            expect(screen.getByTestId("edit-modal")).toBeInTheDocument();
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
            } as unknown as ReturnType<typeof useAuthUser>);
        });

        it("ID 4-7: 他人のプロフィールでは「いいね」タブが表示されないこと", () => {
            render(<ProfileClientView initialData={mockInitialData} userId={mockTargetUserId} />);
            expect(screen.getByRole("button", { name: /ポスト/i })).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /いいね/i })).not.toBeInTheDocument();
        });

        it("ID 4-4: 未フォローの場合、フォローボタンが表示され、クリックで toggleFollow が呼ばれること", async () => {
            const user = userEvent.setup();
            render(<ProfileClientView initialData={mockInitialData} userId={mockTargetUserId} />);

            const followButton = screen.getByRole("button", { name: "フォロー" });
            expect(followButton).toBeInTheDocument();

            await user.click(followButton);
            expect(mockToggleFollow).toHaveBeenCalledWith(mockTargetUserId);
        });

        it("ID 4-5: フォロー中の場合、ボタンの表示が変わり、クリックで toggleFollow が呼ばれること", async () => {
            const user = userEvent.setup();
            const followingData = {
                user: { ...mockInitialData.user, is_following: true },
            };
            
            vi.mocked(useQuery).mockReturnValue({
                data: followingData,
                isLoading: false,
            } as unknown as ReturnType<typeof useQuery>);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render(<ProfileClientView initialData={followingData as any} userId={mockTargetUserId} />);

            // 💡 判定：aria-label で確実に「フォロー解除」ボタンを取得
            const unfollowButton = screen.getByRole("button", { name: "フォロー解除" });
            expect(unfollowButton).toBeInTheDocument();

            await user.click(unfollowButton);
            expect(mockToggleFollow).toHaveBeenCalledWith(mockTargetUserId);
        });
    });

    describe("未ログイン状態のアクセス (ID 4-11: ゲストアクセス制限)", () => {
        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: null, // 🚨 未ログイン
                isAuthenticated: false,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
            } as unknown as ReturnType<typeof useAuthUser>);
        });

        it("ID 4-11: 未ログイン時はフォローボタンが表示されないこと", () => {
            render(<ProfileClientView initialData={mockInitialData} userId={mockTargetUserId} />);
            expect(screen.queryByRole("button", { name: /フォロー/i })).not.toBeInTheDocument();
        });
    });

    describe("フォロー処理中の状態 (ID 4-12: フォロー連打防止)", () => {
        const mockOtherUserId = asUserId("user-other");

        beforeEach(() => {
            vi.mocked(useAuthUser).mockReturnValue({
                user: { id: mockOtherUserId, name: "Other", email: "o@e.com", created_at: "now", is_following: false },
                isAuthenticated: true,
                isInitialLoading: false,
                setUser: vi.fn(),
                clearAuth: vi.fn(),
            } as unknown as ReturnType<typeof useAuthUser>);

            vi.mocked(useToggleFollow).mockReturnValue({
                mutate: vi.fn(),
                isPending: true, // 🚨 処理中をシミュレート
            } as unknown as ReturnType<typeof useToggleFollow>);
        });

        it("ID 4-12: フォロー処理中 (isPending: true) はボタンが非活性 (disabled) になり連打を防止できること", () => {
            render(<ProfileClientView initialData={mockInitialData} userId={mockTargetUserId} />);
            const followButton = screen.getByRole("button", { name: "フォロー" });
            expect(followButton).toBeDisabled();
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
            } as unknown as ReturnType<typeof useAuthUser>);
        });

        it("ID 4-10: 「いいね」タブをクリックすると、表示内容が切り替わること", async () => {
            const user = userEvent.setup();
            
            // いいねタブ用のモック（最初は空）
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vi.mocked(useInfiniteQuery).mockImplementation((options: any) => {
                if (options.queryKey.includes("profile-likes")) {
                    return {
                        data: { pages: [{ data: [], nextCursor: null }] },
                        isLoading: false,
                        hasNextPage: false,
                        isFetchingNextPage: false,
                        fetchNextPage: vi.fn(),
                    } as unknown as ReturnType<typeof useInfiniteQuery>;
                }
                return {
                    data: { pages: [{ data: mockTweets, nextCursor: null }] },
                    isLoading: false,
                    hasNextPage: false,
                    isFetchingNextPage: false,
                    fetchNextPage: vi.fn(),
                } as unknown as ReturnType<typeof useInfiniteQuery>;
            });

            render(<ProfileClientView initialData={mockInitialData} userId={mockTargetUserId} />);
            
            // いいねタブをクリック
            await user.click(screen.getByRole("button", { name: "いいね" }));

            // いいねした投稿がない場合のメッセージが表示されること
            await waitFor(() => {
                expect(screen.getByText("まだいいねしたポストがありません")).toBeInTheDocument();
            });
        });
    });
});
