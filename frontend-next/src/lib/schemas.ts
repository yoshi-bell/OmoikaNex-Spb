import { z } from "zod";
import { asUserId, asTweetId } from "@/types/brands";

/**
 * ==========================================
 * 1. 認証系 (Authentication) スキーマ
 * ==========================================
 */

/**
 * ログイン用
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "メールアドレスを入力してください")
        .email("メールアドレスの形式が正しくありません"),
    password: z
        .string()
        .min(1, "パスワードを入力してください")
        .min(8, "パスワードは8文字以上で入力してください"),
});

/**
 * ユーザー登録用
 */
export const registerSchema = loginSchema
    .extend({
        name: z
            .string()
            .min(1, "ユーザー名を入力してください")
            .max(50, "ユーザー名は50文字以内で入力してください"),
        password: z
            .string()
            .min(8, "パスワードは8文字以上で入力してください")
            .regex(
                /^(?=.*?[a-z])(?=.*?\d)[a-z\d]+$/i,
                "パスワードは英数字を混合してください",
            ),
        password_confirmation: z
            .string()
            .min(1, "確認用パスワードを入力してください"),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "パスワードが一致しません",
        path: ["password_confirmation"],
    });

/**
 * ==========================================
 * 2. ツイート系 (Tweet) スキーマ
 * ==========================================
 */

/**
 * 新規投稿・返信用
 */
export const tweetFormSchema = z.object({
    content: z
        .string()
        .min(1, "投稿内容を入力してください")
        .max(140, "投稿は140文字以内で入力してください"),
    parent_id: z.number().nullable().optional(),
});

/**
 * ==========================================
 * 3. ドメインオブジェクト (Mapping) スキーマ
 * ==========================================
 */

/**
 * ユーザー情報のドメイン変換用 (as UserId)
 */
export const userSchema = z.object({
    id: z.string().transform(asUserId),
    name: z.string(),
    email: z.string(),
    profile_text: z.string().nullable().optional(),
    created_at: z.string(),
});

/**
 * ツイート情報のドメイン変換用 (as TweetId)
 */
export const tweetSchema = z.object({
    id: z.number().transform(asTweetId),
    user_id: z.string().transform(asUserId),
    parent_id: z
        .number()
        .nullable()
        .transform((val) => (val ? asTweetId(val) : null)),
    content: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    // リレーション（ユーザー情報など）が含まれる場合の定義も今後追加
});

/**
 * 型推論 (Types derived from schemas)
 */
export type LoginFormType = z.infer<typeof loginSchema>;
export type RegisterFormType = z.infer<typeof registerSchema>;
export type TweetFormType = z.infer<typeof tweetFormSchema>;
export type UserDomain = z.output<typeof userSchema>;
export type TweetDomain = z.output<typeof tweetSchema>;
