#!/bin/bash

# ==========================================
# テストユーザー用プロフィールの自動アップロード
# ==========================================

# 1. 環境設定 (待機ロジックと JSON 形式でのキー取得)
echo "Waiting for Supabase services to be ready..."
MAX_RETRIES=60
RETRY_COUNT=0

# スクリプトの実行場所をプロジェクトルートに固定
cd "$(dirname "$0")/.."

while true; do
  # JSON 形式でステータスを取得
  STATUS_JSON=$(npx supabase status -o json 2>/dev/null)
  
  if echo "$STATUS_JSON" | grep -q "SERVICE_ROLE_KEY"; then
    # SERVICE_ROLE_KEY の値を抽出
    SERVICE_ROLE_KEY=$(echo "$STATUS_JSON" | grep -oE '"SERVICE_ROLE_KEY": "[^"]+"' | cut -d'"' -f4)
    if [ -n "$SERVICE_ROLE_KEY" ]; then
       break
    fi
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Error: Timeout waiting for Supabase status."
    exit 1
  fi
  
  sleep 2
done

echo "Supabase is ready. Service Role Key retrieved."

SEED_FILE="supabase/seed.sql"
STORAGE_URL="http://127.0.0.1:54321/storage/v1/object/avatars"
IMG_DIR="frontend-next/public/images/profile-image"

# 2. seed.sql から UUID を動的に抽出する関数
get_uuid_from_seed() {
  local email=$1
  grep -B 1 "$email" "$SEED_FILE" | grep -oE "[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}" | head -n 1
}

echo "Extracting User IDs from ${SEED_FILE}..."
ALICE_ID=$(get_uuid_from_seed "alice@example.test")
BOB_ID=$(get_uuid_from_seed "bob@example.test")
CHARLIE_ID=$(get_uuid_from_seed "charlie@example.test")

if [ -z "$ALICE_ID" ] || [ -z "$BOB_ID" ] || [ -z "$CHARLIE_ID" ]; then
  echo "Error: Could not extract UUIDs from ${SEED_FILE}."
  exit 1
fi

echo "Uploading test profile images to Supabase Storage..."

# 3. アップロード関数の定義
upload_avatar() {
  local user_id=$1
  local file_name=$2
  
  echo "Uploading ${file_name} for User ${user_id}..."
  
  # POST (新規作成)
  # ※ 既に存在する場合は 400 が返るが、リセット後なので成功するはず
  curl -s -X POST \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: image/png" \
    --data-binary @"${IMG_DIR}/${file_name}" \
    "${STORAGE_URL}/${user_id}/avatar.png" \
    > /dev/null
    
  echo " Done."
}

# 4. 実行
upload_avatar "${ALICE_ID}" "profile1.png"
upload_avatar "${BOB_ID}" "profile2.png"
upload_avatar "${CHARLIE_ID}" "profile3.png"

echo "All test images have been successfully uploaded."
