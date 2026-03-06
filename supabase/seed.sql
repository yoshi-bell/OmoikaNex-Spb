-- テスト用ダミーデータの生成スクリプト

-- 1. テストユーザーの作成 (auth.users)
-- パスワードはすべて "password123" です。
-- confirmed_at は DB の制約により手動挿入が制限されているため除外します。
-- 代わりに email_confirmed_at を指定することで、ログイン可能な「認証済みユーザー」として扱われます。
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
  -- 必須タイムスタンプ
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

-- 2. 大量ツイートの生成 (public.tweets)
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
