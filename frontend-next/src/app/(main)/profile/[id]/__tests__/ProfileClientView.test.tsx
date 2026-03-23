import { render, screen } from "@/test/utils";
import { ProfileClientView } from "../ProfileClientView";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToggleFollow } from "@/features/follows/hooks/useToggleFollow";
import { asUserId, asTweetId } from "@/types/brands";
import userEvent from "@testing-library/user-event";
import { UserProfileResponse } from "@/features/users/api/get-profile";
import { type TweetDomain } from "@/lib/schemas"; // 💡 追加

// モックの設定
vi.mock("@/hooks/useAuthUser");
vi.mock("@/features/follows/hooks/useToggleFollow");
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

describe("ProfileClientView (ID 4-4, 4-5, 4-7, 4-9: エンゲージメント検証)", () => {
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
        tweets: [
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
        ],
    };

    const mockToggleFollow = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useToggleFollow).mockReturnValue({
            mutate: mockToggleFollow,
            isPending: false,
        } as unknown as ReturnType<typeof useToggleFollow>);
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

        it("ID 4-9: 自分自身のプロフィールにはフォローボタンが表示されず、編集ボタンが表示されること", () => {
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
                ...mockInitialData,
                user: { ...mockInitialData.user, is_following: true },
            };

            render(<ProfileClientView initialData={followingData} userId={mockTargetUserId} />);

            // 💡 判定：aria-label で確実に「フォロー解除」ボタンを取得
            const unfollowButton = screen.getByRole("button", { name: "フォロー解除" });
            expect(unfollowButton).toBeInTheDocument();

            await user.click(unfollowButton);
            expect(mockToggleFollow).toHaveBeenCalledWith(mockTargetUserId);
        });
    });
});
