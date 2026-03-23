import { renderHook } from "@testing-library/react";
import { useTimeline } from "../useTimeline";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthUser } from "@/hooks/useAuthUser";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { asUserId } from "@/types/brands";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// モックの設定
vi.mock("@tanstack/react-query", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@tanstack/react-query")>();
    return {
        ...actual,
        useInfiniteQuery: vi.fn(),
    };
});
vi.mock("@/hooks/useAuthUser");
vi.mock("@/features/tweets/api/get-timeline");

describe("useTimeline (ID 2-8: クエリキーによるキャッシュ隔離の物理的証明)", () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("ID 2-8: ユーザー A で実行した際、クエリキーに ユーザー A の ID が含まれていること", () => {
        const userIdA = asUserId("user-A");
        vi.mocked(useAuthUser).mockReturnValue({
            user: { id: userIdA, name: "User A", email: "a@e.com", created_at: "now", is_following: false },
            isAuthenticated: true,
            isInitialLoading: false,
            setUser: vi.fn(),
            clearAuth: vi.fn(),
        } as unknown as ReturnType<typeof useAuthUser>);

        renderHook(() => useTimeline("all"), { wrapper });

        // 💡 核心：useInfiniteQuery が呼ばれる際のクエリキーを検証
        expect(useInfiniteQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["timeline", "all", userIdA],
            })
        );
    });

    it("ID 2-8: ユーザー B に切り替わった際、クエリキーが変化し、キャッシュが物理的に隔離されること", () => {
        const userIdB = asUserId("user-B");
        vi.mocked(useAuthUser).mockReturnValue({
            user: { id: userIdB, name: "User B", email: "b@e.com", created_at: "now", is_following: false },
            isAuthenticated: true,
            isInitialLoading: false,
            setUser: vi.fn(),
            clearAuth: vi.fn(),
        } as unknown as ReturnType<typeof useAuthUser>);

        renderHook(() => useTimeline("all"), { wrapper });

        // 💡 判定：ユーザー B の ID がキーに含まれていることを証明
        expect(useInfiniteQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["timeline", "all", userIdB],
            })
        );
    });

    it("ID 2-8: 未ログイン状態（user: null）でも、キーが崩れず安全に隔離（undefinedが含まれる）されること", () => {
        vi.mocked(useAuthUser).mockReturnValue({
            user: null,
            isAuthenticated: false,
            isInitialLoading: false,
            setUser: vi.fn(),
            clearAuth: vi.fn(),
        } as unknown as ReturnType<typeof useAuthUser>);

        renderHook(() => useTimeline("all"), { wrapper });

        expect(useInfiniteQuery).toHaveBeenCalledWith(
            expect.objectContaining({
                queryKey: ["timeline", "all", undefined],
            })
        );
    });
});
