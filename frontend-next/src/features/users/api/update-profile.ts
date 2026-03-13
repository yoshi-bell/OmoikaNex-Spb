import { createClient } from "@/lib/supabase/client";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { Database } from "@/types/database.types";

export interface UpdateProfileParams {
    userId: string;
    name: string;
    profileText?: string | null;
    avatarFile?: File | null;
}

export interface UpdateProfileResponse {
    success: boolean;
    error?: AppError;
}

/**
 * ユーザープロフィールを更新する (Repository - Server Side)
 * 
 * 1. 画像ファイルがある場合は Storage へアップロード
 * 2. ユーザー情報を DB へ保存
 * 
 * @param params 更新データ（ID, 名前, 自己紹介, 画像ファイル）
 */
export async function updateProfile(params: UpdateProfileParams): Promise<UpdateProfileResponse> {
    const supabase = createClient();
    let avatarPath: string | undefined;

    try {
        // 1. 画像のアップロード処理 (存在する場合のみ)
        if (params.avatarFile) {
            // パス形式: [userId]/avatar.png
            // ※ 常に同じ名前で上書きすることで管理をシンプルに保つ（キャッシュ対策はフロント側で対応）
            const filePath = `${params.userId}/avatar.png`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, params.avatarFile, {
                    upsert: true, // 既存があれば上書き
                });

            if (uploadError) {
                return { success: false, error: mapSupabaseError(uploadError) };
            }

            avatarPath = filePath;
        }

        // 2. DB レコードの更新
        const updateData: Database["public"]["Tables"]["users"]["Update"] = {
            name: params.name,
            profile_text: params.profileText,
            updated_at: new Date().toISOString(),
        };

        // 画像が更新された場合のみ path を追加
        if (avatarPath) {
            updateData.avatar_url = avatarPath;
        }


        const { error: dbError } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", params.userId);

        if (dbError) {
            return { success: false, error: mapSupabaseError(dbError) };
        }

        return { success: true };

    } catch (error) {
        console.error("updateProfile Unexpected Error:", error);
        return {
            success: false,
            error: {
                type: "SYSTEM_ERROR",
                message: "予期せぬエラーが発生しました",
            },
        };
    }
}
