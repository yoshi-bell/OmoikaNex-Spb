"use server";

import { createClient } from "@/lib/supabase/server";
import { mapSupabaseError } from "@/lib/error-mapping";
import { AppError } from "@/types/error";
import { Database } from "@/types/database.types";
import { profileFormSchema } from "@/lib/schemas";

export interface UpdateProfileResponse {
    success: boolean;
    error?: AppError;
}

// 💡 学習ポイント: セキュリティ定数はバックエンドでも厳格に定義する
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

/**
 * ユーザープロフィールを更新する (Server Action)
 *
 * 🛡️ サーバーサイド・バリデーションを徹底し、DoS攻撃やファイル偽装を防ぎます。
 *
 * @param formData フォームデータ (userId, name, profileText, avatarFile)
 */
export async function updateProfile(
    formData: FormData,
): Promise<UpdateProfileResponse> {
    const supabase = await createClient();

    // 1. FormData からの抽出と基本チェック
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const profileText = formData.get("profileText") as string | null;
    const avatarFile = formData.get("avatarFile") as File | null;

    if (!userId) {
        return {
            success: false,
            error: {
                type: "VALIDATION_ERROR",
                message: "必須項目が不足しています",
            },
        };
    }

    try {
        // 🛡️ 防壁1: 認証・本人確認
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

        // 🛡️ 防壁2: Zod によるテキストバリデーション (文字数制限等の再検証)
        const validatedFields = profileFormSchema.safeParse({
            name,
            profile_text: profileText,
        });

        if (!validatedFields.success) {
            return {
                success: false,
                error: {
                    type: "VALIDATION_ERROR",
                    message: "入力内容が規定の制限を超えています。",
                },
            };
        }

        // 🛡️ 防壁3: ファイルのセキュリティチェック
        if (avatarFile && avatarFile.size > 0) {
            // 1. サイズチェック (DoS対策)
            if (avatarFile.size > MAX_FILE_SIZE) {
                return {
                    success: false,
                    error: {
                        type: "VALIDATION_ERROR",
                        message: "画像サイズは5MB以内にしてください",
                    },
                };
            }
            // 2. MIMEタイプチェック (偽装ファイル対策)
            if (!ALLOWED_MIME_TYPES.includes(avatarFile.type)) {
                return {
                    success: false,
                    error: {
                        type: "VALIDATION_ERROR",
                        message: "許可されていないファイル形式です",
                    },
                };
            }
        }

        // 2. 画像のアップロード処理
        let avatarPath: string | undefined;
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

        // 3. DB レコードの更新
        const updateData: Database["public"]["Tables"]["users"]["Update"] = {
            name: validatedFields.data.name,
            profile_text: validatedFields.data.profile_text,
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
                message: "予期せぬエラーが発生しました。",
            },
        };
    }
}
