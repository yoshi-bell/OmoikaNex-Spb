import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/features/users/api/update-profile";
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuthUser";

/**
 * プロフィール更新用のカスタムフック
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthUser();

    return useMutation({
        mutationFn: (formData: FormData) => updateProfile(formData),

        onSuccess: (result, formData) => {
            if (result.success) {
                toast.success("プロフィールを更新しました");

                // FormData から更新後の値を取得
                const userId = formData.get("userId") as string;
                const name = formData.get("name") as string;
                const profileText = formData.get("profileText") as string | null;
                const hasNewFile = (formData.get("avatarFile") as File | null)?.size ?? 0 > 0;

                // 1. Zustand ストアのユーザー情報を即座に更新 (サイドバー等への即時反映用)
                if (user) {
                    setUser({
                        ...user,
                        name: name,
                        profile_text: profileText,
                        // 画像が更新された場合はパスを更新
                        avatar_url: hasNewFile
                            ? `${userId}/avatar.png`
                            : user.avatar_url,
                        updated_at: new Date().toISOString(),
                    });
                }

                // 2. 関連するキャッシュを全て無効化して再取得を促す
                // 1. プロフィール詳細データ
                queryClient.invalidateQueries({
                    queryKey: ["profile", userId],
                });

                // 2. ログインユーザー情報 (ヘッダーやサイドバー用)
                queryClient.invalidateQueries({ queryKey: ["auth-user"] });

                // 3. タイムラインなどの投稿者情報も最新化
                queryClient.invalidateQueries({ queryKey: ["timeline"] });
                queryClient.invalidateQueries({ queryKey: ["tweets"] });
            } else {
                toast.error(result.error?.message || "更新に失敗しました");
            }
        },

        onError: (error) => {
            console.error("useUpdateProfile Error:", error);
            toast.error("通信エラーが発生しました");
        },
    });
}
