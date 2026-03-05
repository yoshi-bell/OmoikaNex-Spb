import { Sidebar } from "@/components/layouts/Sidebar";

/**
 * ログイン後画面の共通レイアウト
 * 
 * 仕様に基づき、深いダークモード（bg-[#16181c]）と、
 * 左サイドバー・右メインエリアの 2 カラム構成を実装。
 */
export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen justify-center bg-[#16181c] text-white">
            <div className="flex w-full max-w-5xl">
                {/* 左側: Sidebar (境界線 border-slate-800) */}
                <div className="sticky top-0 h-screen w-72 border-r border-slate-800">
                    <Sidebar />
                </div>

                {/* 右側: Main Area */}
                <main className="min-h-screen flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
