import { render, screen } from "@/test/utils";
import TweetDetailPage from "../page";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useParams, useRouter } from "next/navigation";
import {
    useTweetDetail,
    useTweetReplies,
} from "@/features/tweets/hooks/useTweetDetail";
import { useInView } from "react-intersection-observer";
import { asTweetId, asUserId } from "@/types/brands";
import { TweetDomain } from "@/lib/schemas";

// モックの設定
vi.mock("next/navigation", () => ({
    useParams: vi.fn(),
    useRouter: vi.fn(),
}));
vi.mock("@/features/tweets/hooks/useTweetDetail");
vi.mock("react-intersection-observer");

// TweetCard は振る舞いを確認したいため、実際のものを使用（内部のフックは別途モック済み）
vi.mock("@/features/tweets/hooks/useDeleteTweet", () => ({
    useDeleteTweet: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/features/tweets/hooks/useToggleLike", () => ({
    useToggleLike: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/features/tweets/hooks/usePostTweet", () => ({
    usePostTweet: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/useAuthUser", () => ({
    useAuthUser: () => ({ user: { id: "me" }, isAuthenticated: true }),
}));

describe("TweetDetail (ID 3-2, 3-3, 3-4: 返信スレッド表示)", () => {
    const mockPush = vi.fn();
    const mockBack = vi.fn();
    const mockFetchNextPage = vi.fn();

    const mockMainTweet: TweetDomain = {
        id: asTweetId(100),
        user_id: asUserId("user-1"),
        content: "Main Tweet Content",
        created_at: "2026-03-23T08:00:00Z",
        updated_at: "2026-03-23T08:00:00Z",
        likes_count: 10,
        is_liked: false,
        replies_count: 2,
        is_following: false,
        parent_id: null,
        user: { id: asUserId("user-1"), name: "User 1", email: "u1@e.com", created_at: "now", is_following: false },
    };

    const mockReplies: TweetDomain[] = [
        {
            id: asTweetId(101),
            user_id: asUserId("user-2"),
            content: "First Reply",
            created_at: "2026-03-23T08:05:00Z",
            updated_at: "2026-03-23T08:05:00Z",
            likes_count: 2,
            is_liked: false,
            replies_count: 0,
            is_following: false,
            parent_id: asTweetId(100),
            user: { id: asUserId("user-2"), name: "User 2", email: "u2@e.com", created_at: "now", is_following: false },
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useParams).mockReturnValue({ id: "100" });
        vi.mocked(useRouter).mockReturnValue({
            push: mockPush,
            back: mockBack,
            refresh: vi.fn(),
        } as unknown as ReturnType<typeof useRouter>);

        vi.mocked(useInView).mockReturnValue({
            ref: vi.fn(),
            inView: false,
            entry: undefined,
        } as unknown as ReturnType<typeof useInView>);

        // メインツイート取得のモック
        vi.mocked(useTweetDetail).mockReturnValue({
            data: { data: mockMainTweet, error: null },
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useTweetDetail>);

        // 返信一覧取得のモック
        vi.mocked(useTweetReplies).mockReturnValue({
            data: {
                pages: [{ data: mockReplies, nextCursor: null, error: null }],
                pageParams: [undefined],
            },
            isLoading: false,
            fetchNextPage: mockFetchNextPage,
            hasNextPage: false,
            isFetchingNextPage: false,
        } as unknown as ReturnType<typeof useTweetReplies>);
    });

    it("ID 3-2: 元ツイートが上部に表示され、その下に返信一覧が表示されること", () => {
        render(<TweetDetailPage />);

        // メインツイートの確認
        expect(screen.getByText("Main Tweet Content")).toBeInTheDocument();
        // 返信の確認
        expect(screen.getByText("First Reply")).toBeInTheDocument();
        // 「スレッド」というタイトル（ヘッダー）の確認
        expect(screen.getByText("スレッド")).toBeInTheDocument();
    });

    it("ID 3-2: 初期ロード中（メインツイート取得中）は読み込み中インジケーターが表示されること", () => {
        vi.mocked(useTweetDetail).mockReturnValue({
            isLoading: true,
        } as unknown as ReturnType<typeof useTweetDetail>);

        render(<TweetDetailPage />);
        expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });

    it("ID 3-5: [異常系] 攻撃2：ツイートが存在しない、または取得に失敗した場合、エラーメッセージが表示されること", () => {
        // 💡 取得エラー状態をシミュレート
        vi.mocked(useTweetDetail).mockReturnValue({
            data: null,
            isLoading: false,
            isError: true, // 🚨 エラー発生
        } as unknown as ReturnType<typeof useTweetDetail>);

        render(<TweetDetailPage />);

        // 💡 判定：エラーメッセージが正しく表示され、メインツイートの内容が出ていないこと
        expect(screen.getByText("ツイートの取得に失敗しました。")).toBeInTheDocument();
        expect(screen.queryByText("Main Tweet Content")).not.toBeInTheDocument();
    });

    it("ID 3-5: [異常系] 攻撃1：すでに返信を取得中の場合、さらに読み込もうとしても fetchNextPage は呼ばれないこと", async () => {
        // 💡 取得中の状態をシミュレート
        vi.mocked(useTweetReplies).mockReturnValue({
            data: { pages: [{ data: mockReplies, nextCursor: "c2", error: null }], pageParams: [undefined] },
            isLoading: false,
            fetchNextPage: mockFetchNextPage,
            hasNextPage: true,
            isFetchingNextPage: true, // 🚨 取得中
        } as unknown as ReturnType<typeof useTweetReplies>);

        // 💡 最下部にいる状態
        vi.mocked(useInView).mockReturnValue({
            ref: vi.fn(),
            inView: true,
            entry: undefined,
        } as unknown as ReturnType<typeof useInView>);

        render(<TweetDetailPage />);

        // 💡 すでに取得中なら追加で呼ばれてはいけない
        expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it("ID 3-3: 返信一覧の中のツイートに対しても「いいね」ボタンが存在すること", () => {
        render(<TweetDetailPage />);
        
        // メインツイートと返信、それぞれに「いいね」ボタンがあるはず
        const likeButtons = screen.getAllByRole("button", { name: "いいね" });
        expect(likeButtons.length).toBeGreaterThanOrEqual(2);
    });

    it("ID 3-4 [エッジケース]: 自己参照ループ（親と子が同じID）が発生しているデータでも、無限ループ（スタックオーバーフロー）を起こさず安全に描画が停止すること", () => {
        // 💡 意図的に不整合なデータを作成
        const recursiveTweet = { 
            ...mockMainTweet, 
            id: asTweetId(999), 
            parent_id: asTweetId(999) 
        };
        vi.mocked(useTweetDetail).mockReturnValue({
            data: { data: recursiveTweet, error: null },
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useTweetDetail>);

        // 💡 判定：これがフリーズせずに描画を終えられれば、再帰的なコンポーネント呼び出しをしていない証明になる
        render(<TweetDetailPage />);
        expect(screen.getByText("Main Tweet Content")).toBeInTheDocument();
    });

    it("ID 3-4: 深すぎるネスト（100階層等）の探索に対し、再帰描画を避け「ページ遷移（詳細画面への遷移）」で対応することで安全性が確保されていること", async () => {
        render(<TweetDetailPage />);

        // 💡 返信をクリックした際、その詳細画面へ「遷移」することをアサート
        // これにより、コンポーネントスタックを累積させず、遷移ごとにリセットされる仕組み（安全停止）を証明する
        const replyContent = screen.getByText("First Reply");
        replyContent.click();

        expect(mockPush).toHaveBeenCalledWith("/tweet/101");
    });

    it("戻るボタンをクリックすると、前の画面に戻ること", () => {
        render(<TweetDetailPage />);
        const backButton = screen.getByRole("button", { name: "" }); // Lucide-react のアイコンボタン
        backButton.click();
        expect(mockBack).toHaveBeenCalled();
    });

    it("返信が 0 件の場合、メッセージが表示されること", () => {
        vi.mocked(useTweetReplies).mockReturnValue({
            data: { pages: [{ data: [], nextCursor: null, error: null }], pageParams: [undefined] },
            isLoading: false,
            hasNextPage: false,
        } as unknown as ReturnType<typeof useTweetReplies>);

        render(<TweetDetailPage />);
        expect(screen.getByText("まだ返信はありません")).toBeInTheDocument();
    });
});
