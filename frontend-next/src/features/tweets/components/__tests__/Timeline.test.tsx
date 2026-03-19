import { render, screen, waitFor } from "@/test/utils";
import { Timeline } from "../Timeline";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { useTimeline } from "@/features/tweets/hooks/useTimeline";
import { useInView } from "react-intersection-observer";
import { asTweetId, asUserId } from "@/types/brands";
import { TweetDomain } from "@/lib/schemas";

// モックの設定
vi.mock("@/features/tweets/hooks/useTimeline");
vi.mock("react-intersection-observer");

// 子コンポーネントのモック (テストの焦点を絞る)
vi.mock("../TweetCard", () => ({
    TweetCard: ({ tweet }: { tweet: TweetDomain }) => (
        <div data-testid="tweet-card">{tweet.content}</div>
    ),
}));

describe("Timeline (ID 2-1, 2-2, 2-8: タイムライン取得・無限スクロール)", () => {
    const mockFetchNextPage = vi.fn();
    const mockRefetch = vi.fn();

    const mockTweets: TweetDomain[] = [
        {
            id: asTweetId(1),
            user_id: asUserId("user-1"),
            content: "First Tweet",
            created_at: "2026-03-19T10:00:00Z",
            updated_at: "2026-03-19T10:00:00Z",
            likes_count: 0,
            is_liked: false,
            replies_count: 0,
            is_following: false,
            parent_id: null,
            user: { id: asUserId("user-1"), name: "User 1", email: "u1@e.com", created_at: "now", is_following: false },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // useInView のデフォルトモック (最下部にはいない状態)
        vi.mocked(useInView).mockReturnValue({
            ref: vi.fn(),
            inView: false,
            entry: undefined,
        } as unknown as ReturnType<typeof useInView>);

        // useTimeline のデフォルトモック (データあり状態)
        vi.mocked(useTimeline).mockReturnValue({
            data: {
                pages: [{ data: mockTweets, nextCursor: "cursor-2", error: null }],
                pageParams: [undefined],
            },
            isLoading: false,
            isError: false,
            fetchNextPage: mockFetchNextPage,
            hasNextPage: true,
            isFetchingNextPage: false,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof useTimeline>);
    });

    it("ID 2-1: 正常にタイムラインが取得され、ツイートが表示されること", async () => {
        render(<Timeline />);

        expect(screen.getByText("First Tweet")).toBeInTheDocument();
        expect(screen.getAllByTestId("tweet-card")).toHaveLength(1);
    });

    it("ID 2-1: 初期ローディング中にスケルトンが表示されること", () => {
        vi.mocked(useTimeline).mockReturnValue({
            isLoading: true,
        } as unknown as ReturnType<typeof useTimeline>);

        render(<Timeline />);

        // TweetCardSkeleton 内の div の存在を確認
        expect(screen.getAllByTestId("tweet-skeleton")).toHaveLength(3);
    });

    it("ID 2-2: 最下部に到達した際、fetchNextPage が呼ばれること", async () => {
        // 最下部に到達した状態にする
        vi.mocked(useInView).mockReturnValue({
            ref: vi.fn(),
            inView: true,
            entry: undefined,
        } as unknown as ReturnType<typeof useInView>);

        render(<Timeline />);

        await waitFor(() => {
            expect(mockFetchNextPage).toHaveBeenCalled();
        });
    });

    it("ID 2-2 [異常系]: すでに次ページを取得中（isFetchingNextPage: true）の場合、最下部に到達しても fetchNextPage は呼ばれないこと", async () => {
        vi.mocked(useTimeline).mockReturnValue({
            data: { pages: [{ data: mockTweets, nextCursor: "cursor-2", error: null }], pageParams: [undefined] },
            isLoading: false,
            isError: false,
            fetchNextPage: mockFetchNextPage,
            hasNextPage: true,
            isFetchingNextPage: true, // 🚨 取得中の状態
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof useTimeline>);

        vi.mocked(useInView).mockReturnValue({
            ref: vi.fn(),
            inView: true,
            entry: undefined,
        } as unknown as ReturnType<typeof useInView>);

        render(<Timeline />);

        // 💡 すでに取得中なら追加で呼ばれてはいけない
        expect(mockFetchNextPage).not.toHaveBeenCalled();
        
        // 💡 攻撃2対策: 追加読み込み中もスケルトンが出ていることを確認
        expect(screen.getAllByTestId("tweet-skeleton")).toHaveLength(1);
    });

    it("ID 2-2 [エッジケース]: 次のページが存在しない（hasNextPage: false）場合、最下部に到達しても fetchNextPage は呼ばれないこと", async () => {
        vi.mocked(useTimeline).mockReturnValue({
            data: { pages: [{ data: mockTweets, nextCursor: null, error: null }], pageParams: [undefined] },
            isLoading: false,
            isError: false,
            fetchNextPage: mockFetchNextPage,
            hasNextPage: false, // 🚨 もうデータがない
            isFetchingNextPage: false,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof useTimeline>);

        vi.mocked(useInView).mockReturnValue({
            ref: vi.fn(),
            inView: true,
            entry: undefined,
        } as unknown as ReturnType<typeof useInView>);

        render(<Timeline />);

        expect(mockFetchNextPage).not.toHaveBeenCalled();
        
        // 💡 攻撃3対策: ユーザーに完了を伝えていること
        expect(screen.getByText("すべての投稿を表示しました")).toBeInTheDocument();
    });

    it("ID 2-8: タブ（おすすめ/フォロー中）を切り替えると、mode が正しく渡されること", async () => {
        const user = userEvent.setup();
        render(<Timeline />);

        const followingTab = screen.getByRole("button", { name: /フォロー中/i });
        await user.click(followingTab);

        // useTimeline が "following" mode で呼ばれていることを確認
        expect(useTimeline).toHaveBeenCalledWith("following");
    });

    it("異常系: 取得失敗時にエラーメッセージと再試行ボタンが表示されること", async () => {
        const user = userEvent.setup();
        vi.mocked(useTimeline).mockReturnValue({
            isLoading: false,
            isError: true,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof useTimeline>);

        render(<Timeline />);

        expect(screen.getByText("データの取得に失敗しました")).toBeInTheDocument();
        const retryButton = screen.getByRole("button", { name: /再試行する/i });
        await user.click(retryButton);

        expect(mockRefetch).toHaveBeenCalled();
    });

    it("データが空の場合、専用のメッセージが表示されること", () => {
        vi.mocked(useTimeline).mockReturnValue({
            data: { pages: [{ data: [], nextCursor: null, error: null }], pageParams: [undefined] },
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useTimeline>);

        render(<Timeline />);

        expect(screen.getByText("まだ投稿がありません")).toBeInTheDocument();
    });
});
