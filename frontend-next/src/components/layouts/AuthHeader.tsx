import Image from "next/image";
import Link from "next/link";

/**
 * 認証画面（ログイン・新規登録）用の共通ヘッダー
 */
export function AuthHeader() {
    return (
        <header className="flex w-full items-center justify-between px-6 py-4">
            {/* ロゴ部分 */}
            <div className="flex items-center">
                <Link href="/">
                    <Image
                        src="/images/logo.png"
                        alt="SHARE"
                        width={120} // 見本画像に合わせた大まかなサイズ
                        height={40}
                        priority
                        className="object-contain transition-opacity hover:opacity-80"
                    />
                </Link>
            </div>

            {/* ナビゲーション部分 */}
            <nav className="flex gap-6 text-sm font-medium text-white">
                <Link
                    href="/register"
                    className="transition-colors hover:text-gray-300"
                >
                    新規登録
                </Link>
                <Link
                    href="/login"
                    className="transition-colors hover:text-gray-300"
                >
                    ログイン
                </Link>
            </nav>
        </header>
    );
}
