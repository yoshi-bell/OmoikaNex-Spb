#!/bin/bash
# 🟢 開発環境の復元 (Restore Phase) を自動化するスクリプト

set -e

# 【改善1】スクリプトが存在するディレクトリ (supabase) を基準点にする
# これにより、どこからスクリプトを実行しても相対パスが壊れません
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
AUTH_BACKUP="$SCRIPT_DIR/dev_backup_auth_safe.sql"
PUBLIC_BACKUP="$SCRIPT_DIR/dev_backup_public_safe.sql"

# 【改善2】現在稼働中のSupabase DBコンテナ名を動的に取得する
CONTAINER_NAME=$(docker ps --format "{{.Names}}" | grep -E "supabase_db" | head -n 1)

if [ -z "$CONTAINER_NAME" ]; then
  echo "❌ エラー: SupabaseのDBコンテナが見つかりません。npx supabase start が実行されているか確認してください。"
  exit 1
fi

echo "🔍 対象コンテナ: $CONTAINER_NAME"

echo "⏳ 1/3: 既存データの物理削除中..."
docker exec -i "$CONTAINER_NAME" psql -U postgres -d postgres -c "SET session_replication_role = 'replica'; TRUNCATE auth.users, public.users, public.tweets, public.likes, public.follows, storage.objects, storage.buckets CASCADE;"

echo "🚀 2/3: 認証基盤の注入中 (auth.users)..."
# メタコマンド \restrict を除外し、セッション持続性を確保
(echo "SET session_replication_role = 'replica';" && grep -v "^\\\\restrict" "$AUTH_BACKUP") | docker exec -i "$CONTAINER_NAME" psql -U postgres -d postgres

echo "🚀 3/3: 開発データの注入中 (public users, tweets, likes, follows, storage)..."
# メタコマンド \restrict の除外に加え、public バックアップ内に混入している auth スキーマへの重複 INSERT を排除
# 【改善】sedを使用して multi-line の INSERT INTO "auth" ステートメントを完全に削除する
(echo "SET session_replication_role = 'replica';" && sed '/^INSERT INTO "auth"/,/);$/d' "$PUBLIC_BACKUP" | grep -v "^-- \\\\restrict") | docker exec -i "$CONTAINER_NAME" psql -U postgres -d postgres

echo "✅ 復旧完了。レコード件数を確認します:"
docker exec -i "$CONTAINER_NAME" psql -U postgres -d postgres -c "SELECT 'auth count: ' || count(*) FROM auth.users; SELECT 'public users: ' || count(*) FROM public.users; SELECT 'tweets: ' || count(*) FROM public.tweets;"
