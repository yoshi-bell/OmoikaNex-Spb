import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * プロフィール画像の URL を解決するヘルパー関数
 * 
 * @param avatarPath データベースに保存されている画像パス (例: [user_id]/avatar.png)
 * @returns 表示用の完全な画像 URL、またはデフォルト画像 (/images/profile.png)
 */
export function getAvatarUrl(avatarPath?: string | null): string {
  if (!avatarPath) {
    return "/images/profile.png";
  }

  // すでにフルURL（http...）で始まっている場合はそのまま返す（下位互換性のため）
  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

  // 相対パスの場合は Supabase の公開 URL を付加
  // 形式: [SupabaseURL]/storage/v1/object/public/avatars/[path]
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/avatars/${avatarPath}`;
}
