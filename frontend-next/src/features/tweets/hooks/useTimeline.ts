import { useQuery } from "@tanstack/react-query";
import { getTimeline } from "@/features/tweets/api/get-timeline";
import { TweetDomain } from "@/lib/schemas";
import { AppError } from "@/types/error";

/**
 * タイムライン取得用のカスタムフック
 *
 * サーバー状態 (Server State) としてタイムラインを管理し、
 * キャッシュ、ローディング状態、エラー情報を UI コンポーネントに提供します。
 */
export function useTimeline() {
    return useQuery<{ data: TweetDomain[] | null; error: AppError | null }>({
        // クエリキー: キャッシュの識別子として 'timeline' を使用
        queryKey: ["timeline"],

        // クエリ関数: 先ほど作成した Repository を呼び出す
        queryFn: async () => {
            const result = await getTimeline();

            // NOTE: React Query は throw されたエラーのみを error 状態として扱いますが、
            // 本プロジェクトでは Repository が返す統一された AppError オブジェクトを
            // そのまま UI に渡す設計を試行しています。
            return result;
        },

        // 取得したデータが 30 秒間は「新鮮 (fresh)」とみなし、
        // その間は再取得を行わないように調整。SNS アプリの特性に合わせます。
        staleTime: 30 * 1000,
    });
}
