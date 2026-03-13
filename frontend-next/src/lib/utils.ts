import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * プロフィール画像の URL を解決するヘルパー関数
 *
 * @param avatarPath データベースに保存されている画像パス (例: [user_id]/avatar.png)
 * @param updatedAt データの最終更新日時。キャッシュ破棄用のパラメータとして使用。
 * @returns 表示用の完全な画像 URL、またはデフォルト画像 (/images/profile.png)
 */
export function getAvatarUrl(
    avatarPath?: string | null,
    updatedAt?: string | null,
): string {
    if (!avatarPath) {
        return "/images/profile.png";
    }

    // 公開ストレージのベースURLを構築
    let fullUrl = avatarPath;
    if (!avatarPath.startsWith("http")) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        fullUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${avatarPath}`;
    }

    // updatedAt がある場合、キャッシュ回避用パラメータを付与
    if (updatedAt) {
        const timestamp = new Date(updatedAt).getTime();
        return `${fullUrl}?t=${timestamp}`;
    }

    return fullUrl;
}
