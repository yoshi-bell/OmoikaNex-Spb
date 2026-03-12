import { getUserProfile } from "@/features/users/api/get-profile";
import { ProfileClientView } from "./ProfileClientView";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface ProfilePageProps {
    params: Promise<{ id: string }>;
}

/**
 * プロフィールページのメタデータ生成 (SEO/OGP対応)
 * サーバーサイドで実行されます。
 */
export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const { id } = await params;
    
    try {
        // ページと同様に関数を呼ぶだけ。中身が Supabase かは関知しない。
        const { user } = await getUserProfile(id);
        return {
            title: `${user.name} (@${user.id.slice(0, 8)}) / OmoikaNex`,
            description: user.profile_text || `${user.name}さんのプロフィール`,
        };
    } catch {
        return {
            title: "ユーザーが見つかりません / OmoikaNex",
        };
    }
}

/**
 * プロフィールページ (Server Component)
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
    const { id } = await params;

    // データ取得処理 (try/catch で囲む)
    let profileData;
    try {
        profileData = await getUserProfile(id);
    } catch (error) {
        console.error("Profile Load Error:", error);
        return notFound();
    }

    // JSX の返却は try/catch の外で行う
    return (
        <main className="flex-1">
            <ProfileClientView initialData={profileData} />
        </main>
    );
}
