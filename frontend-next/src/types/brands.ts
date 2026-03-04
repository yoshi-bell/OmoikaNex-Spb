/**
 * ブランド型 (Branded Type) を作成するためのユーティリティ
 */
type Brand<K, T> = T & { __brand: K };

/**
 * ユーザーID (uuid)
 */
export type UserId = Brand<"UserId", string>;

/**
 * ツイートID (bigint)
 */
export type TweetId = Brand<"TweetId", number>;

/**
 * 「いいね」ID (bigint)
 */
export type LikeId = Brand<"LikeId", number>;

/**
 * フォロー関係ID (bigint)
 */
export type FollowId = Brand<"FollowId", number>;

/**
 * プリミティブな型を Branded Type へ強制的に変換する関数
 * (主に Repository 層でのマッピングに使用)
 */
export const asUserId = (id: string) => id as UserId;
export const asTweetId = (id: number) => id as TweetId;
export const asLikeId = (id: number) => id as LikeId;
export const asFollowId = (id: number) => id as FollowId;
