import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    updateProfile,
    type UpdateProfileParams,
} from "@/features/users/api/update-profile";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

/**
 * プロフィール更新用のカスタムフック
 *
 * 成功時にプロフィールのキャッシュと、ログインユーザー情報のキャッシュを無効化し、
 * アプリ全体の表示を最新状態に同期します。
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();

    return useMutation({
        mutationFn: (params: UpdateProfileParams) => updateProfile(params),

        onSuccess: (result, variables) => {
            if (result.success) {
                toast.success("プロフィールを更新しました");

                // 1. Zustand ストアのユーザー情報を即座に更新 (サイドバー等への即時反映用)
                if (user) {
                    setUser({
                        ...user,
                        name: variables.name,
                        profile_text: variables.profileText || null,
                        // 画像が更新された場合はパスを上書き
                        avatar_url: variables.avatarFile
                            ? `${variables.userId}/avatar.png`
                            : user.avatar_url,
                        updated_at: new Date().toISOString(),
                    });
                }

                // 2. 関連するキャッシュを全て無効化して再取得を促す
                // 1. プロフィール詳細データ
                queryClient.invalidateQueries({
                    queryKey: ["profile", variables.userId],
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
