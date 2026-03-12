-- テスト用ダミーデータの生成スクリプト

-- 1. テストユーザーの作成 (auth.users)
-- パスワードはすべて "password123" です。
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  raw_app_meta_data, 
  raw_user_meta_data, 
  role, 
  aud, 
  instance_id,
  confirmation_token, 
  recovery_token, 
  email_change_token_new, 
  email_change,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token,
  created_at,
  updated_at
)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001', 'alice@example.test', crypt('password123', gen_salt('bf')), now(), 
    '{"provider": "email", "providers": ["email"]}', '{"name": "Alice"}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000',
    '', '', '', '', '', '', '', '', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000002', 'bob@example.test', crypt('password123', gen_salt('bf')), now(), 
    '{"provider": "email", "providers": ["email"]}', '{"name": "Bob"}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000',
    '', '', '', '', '', '', '', '', now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000003', 'charlie@example.test', crypt('password123', gen_salt('bf')), now(), 
    '{"provider": "email", "providers": ["email"]}', '{"name": "Charlie"}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000',
    '', '', '', '', '', '', '', '', now(), now()
  )
ON CONFLICT (id) DO NOTHING;

-- 2. 親ツイート (Top-level Tweets) の生成
-- 投稿時間を1時間ずつずらして 60件作成
INSERT INTO public.tweets (user_id, content, created_at)
SELECT 
  CASE (i % 3)
    WHEN 0 THEN '00000000-0000-0000-0000-000000000001'::uuid
    WHEN 1 THEN '00000000-0000-0000-0000-000000000002'::uuid
    ELSE '00000000-0000-0000-0000-000000000003'::uuid
  END as user_id,
  'これはテスト投稿の ' || i || ' 件目です。無限スクロールのテスト中！' as content,
  now() - (i || ' hours')::interval as created_at
FROM generate_series(1, 60) AS i;

-- 3. 返信ツイート (Replies) の生成
-- 最新の親ツイートを1つ特定し、それに対して 30件の返信を紐付ける
DO $$
DECLARE
    parent_id_val bigint;
BEGIN
    -- 最新の親ツイートIDを取得
    SELECT id INTO parent_id_val FROM public.tweets WHERE parent_id IS NULL ORDER BY created_at DESC LIMIT 1;

    -- そのツイートに対して30件の返信を作成
    INSERT INTO public.tweets (user_id, content, parent_id, created_at)
    SELECT 
      CASE (j % 3)
        WHEN 0 THEN '00000000-0000-0000-0000-000000000001'::uuid
        WHEN 1 THEN '00000000-0000-0000-0000-000000000002'::uuid
        ELSE '00000000-0000-0000-0000-000000000003'::uuid
      END as user_id,
      '返信テスト ' || j || ' 件目。詳細画面の無限スクロールを検証しています。' as content,
      parent_id_val as parent_id,
      now() - (j || ' minutes')::interval as created_at
    FROM generate_series(1, 30) AS j;
END $$;

-- 4. 全ユーザーの avatar_url を ID に基づいて一括更新 (相対パスのみ保存)
UPDATE public.users SET avatar_url = id || '/avatar.png';
