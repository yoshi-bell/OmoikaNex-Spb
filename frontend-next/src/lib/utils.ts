import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * プロフィール画像の URL を解決するヘルパー関数
 * 将来の Laravel 移行 (Phase B) を見据え、画像パスの構築を一元管理します。
 * 
 * @param avatarUrl データベースに保存されている画像パス (URL)
 * @returns 表示用の完全な画像 URL、またはデフォルト画像 (/images/profile.png)
 */
export function getAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) {
    return "/images/profile.png";
  }

  // 現時点 (Supabase版) では保存された URL をそのまま返すが、
  // 将来の Laravel 移行時にはここでドメインの付与などを一括制御する
  return avatarUrl;
}
