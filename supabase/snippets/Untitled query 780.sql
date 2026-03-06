SELECT 
  email,
  encrypted_password,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  is_sso_user
FROM auth.users
WHERE email IN (
  'alice@example.test', -- シードで作成したユーザー
  'test@example.com'    -- ※ここに、あなたがUIから新規登録して正常にログインできているユーザーのメールアドレスを入れてください
);