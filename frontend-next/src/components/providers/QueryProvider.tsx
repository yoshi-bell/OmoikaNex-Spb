"use client";

import {
    isServer,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";

/**
 * QueryClient の初期化関数
 * (Next.js SSR/CSR で正しくインスタンスを共有するための標準的な構成を目指す)
 */
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // デフォルトでは 1分間データを新鮮 (fresh) とみなす。
                // SNS アプリケーションとしての即時性を考慮した設定を試行。
                staleTime: 60 * 1000,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (isServer) {
        // サーバーサイドではリクエストごとに新しいクライアントを作成
        return makeQueryClient();
    } else {
        // ブラウザでは1つのクライアントを使い回す
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}

export function QueryProvider({ children }: { children: ReactNode }) {
    // NOTE: クライアント初期化時に useState を使うのではなく、
    // 上記の singleton パターンでインスタンスを保持する。
    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
