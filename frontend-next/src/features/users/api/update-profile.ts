"use server";

import { createClient } from "@/lib/supabase/server";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { Database } from "@/types/database.types";

export interface UpdateProfileResponse {
    success: boolean;
    error?: AppError;
}

/**
 * ユーザープロフィールを更新する (Server Action)
 *
 * FormData を受け取り、サーバーサイドで Storage アップロードと DB 更新を実行します。
 * クライアントサイドに Supabase の実装詳細を漏らしません。
 *
 * @param formData フォームデータ (userId, name, profileText, avatarFile)
 */
export async function updateProfile(
    formData: FormData,
): Promise<UpdateProfileResponse> {
    const supabase = await createClient();

    // FormData から値を取り出し
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const profileText = formData.get("profileText") as string | null;
    const avatarFile = formData.get("avatarFile") as File | null;

    if (!userId || !name) {
        return {
            success: false,
            error: {
                type: "VALIDATION_ERROR",
                message: "必須項目が不足しています",
            },
        };
    }

    try {
        // 💡 強化: 本人確認 (ガード)
        const {
            data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser || authUser.id !== userId) {
            return {
                success: false,
                error: {
                    type: "PERMISSION_DENIED",
                    message: "この操作を行う権限がありません。",
                },
            };
        }

        let avatarPath: string | undefined;

        // 1. 画像のアップロード処理
        if (avatarFile && avatarFile.size > 0) {
            const filePath = `${userId}/avatar.png`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, avatarFile, {
                    upsert: true,
                });

            if (uploadError) {
                return { success: false, error: mapSupabaseError(uploadError) };
            }

            avatarPath = filePath;
        }

        // 2. DB レコードの更新
        const updateData: Database["public"]["Tables"]["users"]["Update"] = {
            name: name,
            profile_text: profileText,
            updated_at: new Date().toISOString(),
        };

        if (avatarPath) {
            updateData.avatar_url = avatarPath;
        }

        const { error: dbError } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", userId);

        if (dbError) {
            return { success: false, error: mapSupabaseError(dbError) };
        }

        return { success: true };
    } catch (error) {
        console.error("updateProfile Server Action Error:", error);
        return {
            success: false,
            error: {
                type: "SYSTEM_ERROR",
                message: "予期せぬエラーが発生しました",
            },
        };
    }
}
