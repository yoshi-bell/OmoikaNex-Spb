import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 認証ミドルウェア (OmoikaNex-Spb)
 * 
 * 1. Supabase のセッション（Cookie）を常に最新に保つ。
 * 2. ログイン済みユーザーが /login や /register にアクセスするのを阻止する (Guest Guard)。
 */
export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // セッションの取得とリフレッシュ (auth.getUser() は安全なサーバーサイド確認手段)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // ---------------------------------------------------------
    // 1. Guest Guard (ログイン済みユーザーへの制限)
    // ---------------------------------------------------------
    // ログイン済みユーザーがログイン/登録画面にアクセスした場合、ホームへ飛ばす
    const isGuestOnlyPath = pathname.startsWith("/login") || pathname.startsWith("/register");
    if (user && isGuestOnlyPath) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // ---------------------------------------------------------
    // 2. Auth Guard (将来的な拡張用)
    // ---------------------------------------------------------
    // 現在の仕様では「未ログインでも閲覧は可能」とするため、
    // ここで一律リダイレクトは行わず、各ページ/コンポーネント側で制御する。
    // 例: 設定画面など「ログイン必須」のルートが増えた場合はここに追加。

    return response;
}

export const config = {
    matcher: [
        /*
         * 次のパスを除くすべてのリクエストパスにマッチさせる:
         * - _next/static (静的ファイル)
         * - _next/image (画像最適化ファイル)
         * - favicon.ico (ファビコンファイル)
         * - public フォルダ内のアセット (logo.png など)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
