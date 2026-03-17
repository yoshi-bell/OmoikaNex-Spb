import { useInfiniteQuery } from "@tanstack/react-query";
import { getTimeline } from "@/features/tweets/api/get-timeline";
import { TweetDomain } from "@/lib/schemas";
import { AppError } from "@/types/error";
import { APP_CONFIG } from "@/constants/config";
import { useAuthUser } from "@/hooks/useAuthUser";

/**
 * タイムライン取得用のカスタムフック (無限スクロール対応)
 *
 * useInfiniteQuery を使用して、ページごとのデータを取得・保持します。
 * スクロールに応じて fetchNextPage を呼び出すことで追加データを読み込みます。
 */
export function useTimeline(mode: "all" | "following" = "all") {
    const { user } = useAuthUser();

    return useInfiniteQuery<{
        data: TweetDomain[] | null;
        nextCursor: string | null;
        error: AppError | null;
    }>({
        // クエリキーに mode と user.id を含めることで、タブやユーザーごとにキャッシュを分離
        queryKey: ["timeline", mode, user?.id],

        // クエリ関数 (pageParam にカーソルが渡される)
        queryFn: async ({ pageParam }) => {
            return await getTimeline(pageParam as string | undefined, mode);
        },

        // 初回ページ用のパラメータ
        initialPageParam: undefined,

        // 次のページのパラメータを決定するロジック
        getNextPageParam: (lastPage) => {
            // 取得件数が設定件数未満なら、次はないと判断
            if (
                lastPage.data &&
                lastPage.data.length < APP_CONFIG.TWEETS_PER_PAGE
            ) {
                return undefined;
            }
            return lastPage.nextCursor;
        },

        // 取得したデータが 30 秒間は「新鮮 (fresh)」とみなす
        staleTime: 30 * 1000,
    });
}
