import { middleware } from "../middleware";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Supabase SSR のモック
vi.mock("@supabase/ssr", () => ({
    createServerClient: vi.fn(),
}));

// NextResponse のモック
const mockRedirect = vi.spyOn(NextResponse, "redirect");
const mockNext = vi.spyOn(NextResponse, "next");

describe("Middleware (ID 1-9: Guest Guard)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createMockRequest = (path: string) => {
        return new NextRequest(new URL(path, "http://localhost:3000"), {
            headers: new Headers(),
        });
    };

    it("ID 1-9: ログイン済みユーザーが /login にアクセスした場合、ホームへリダイレクトされること", async () => {
        const request = createMockRequest("/login");

        // 💡 as any を排除し、ReturnType で型を合わせる
        vi.mocked(createServerClient).mockReturnValue({
            auth: {
                getUser: vi
                    .fn()
                    .mockResolvedValue({
                        data: { user: { id: "user-1" } },
                        error: null,
                    }),
            },
        } as unknown as ReturnType<typeof createServerClient>);

        await middleware(request);

        // / へリダイレクトされたことを検証
        expect(mockRedirect).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: "/",
            }),
        );
    });

    it("ID 1-9 [異常系]: ログイン済みユーザーがパス文字の大小を混在させて (/LoGiN) にアクセスした場合でも、ガードをすり抜けずホームへリダイレクトされること", async () => {
        // 💡 悪意のある（あるいはユーザーの誤入力による）大文字混じりのURL
        const request = createMockRequest("/LoGiN");

        vi.mocked(createServerClient).mockReturnValue({
            auth: {
                getUser: vi
                    .fn()
                    .mockResolvedValue({
                        data: { user: { id: "user-1" } },
                        error: null,
                    }),
            },
        } as unknown as ReturnType<typeof createServerClient>);

        await middleware(request);

        // 💡 現在の middleware.ts では false になり、mockRedirect が呼ばれず fail するはず
        expect(mockRedirect).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: "/",
            }),
        );
    });

    it("未ログインユーザーが /login にアクセスした場合、リダイレクトされずに次の処理へ進むこと", async () => {
        const request = createMockRequest("/login");

        vi.mocked(createServerClient).mockReturnValue({
            auth: {
                getUser: vi
                    .fn()
                    .mockResolvedValue({ data: { user: null }, error: null }),
            },
        } as unknown as ReturnType<typeof createServerClient>);

        await middleware(request);

        expect(mockRedirect).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });

    it("任意のユーザーが公開ルート (/) にアクセスした場合、常に次の処理へ進むこと", async () => {
        const request = createMockRequest("/");

        vi.mocked(createServerClient).mockReturnValue({
            auth: {
                getUser: vi
                    .fn()
                    .mockResolvedValue({ data: { user: null }, error: null }),
            },
        } as unknown as ReturnType<typeof createServerClient>);

        await middleware(request);

        expect(mockRedirect).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });
});
