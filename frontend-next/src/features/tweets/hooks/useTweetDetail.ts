import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getTweetDetail, getTweetReplies } from "@/features/tweets/api/get-tweet-detail";
import { TweetId } from "@/types/brands";
import { APP_CONFIG } from "@/constants/config";

/**
 * ツイート詳細取得用のクエリフック
 */
export function useTweetDetail(tweetId: TweetId) {
    return useQuery({
        queryKey: ["tweets", tweetId],
        queryFn: () => getTweetDetail(tweetId),
        enabled: !!tweetId,
    });
}

/**
 * 返信一覧取得用のクエリフック (無限スクロール対応)
 */
export function useTweetReplies(tweetId: TweetId) {
    return useInfiniteQuery({
        queryKey: ["tweets", tweetId, "replies"],
        queryFn: ({ pageParam }) =>
            getTweetReplies(tweetId, pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            if (
                !lastPage.data ||
                lastPage.data.length < APP_CONFIG.TWEETS_PER_PAGE
            ) {
                return undefined;
            }
            return lastPage.nextCursor ?? undefined;
        },
        enabled: !!tweetId,
    });
}
