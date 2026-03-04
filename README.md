# OmoikaNex-Spb

最新の技術スタック（Next.js 15 / Supabase / TypeScript）を活用し、フロントエンドの抽象化を検証する SNS アプリケーション（Twitterクローン）の学習プロジェクトです。

## 🚀 本プロジェクトでの挑戦 (ON-Plan Phase A)
単なる SNS 機能の実装にとどまらず、将来のバックエンド移植（Laravel化）を円滑にするための、ポータビリティの高いアーキテクチャ設計を目指しています。

- **バックエンドの抽象化 (Repository Pattern):** UI コンポーネントから Supabase SDK の直接呼び出しを分離。API 通信層を隔離することで、バックエンドの差し替えを容易にする構成を試行。
- **サーバー駆動型 SSOT:** Supabase CLI を導入。データベースの物理構造から TypeScript 型定義を自動生成する一貫したパイプラインを構築。
- **認証の抽象化 (Auth Abstraction):** JWT (Supabase) と セッションCookie (Laravel) の差異を隠蔽。抽象化フック `useAuthUser` により UI 層を認証方式の変化から保護する設計を導入。
- **堅牢な二段構えバリデーション:** 
    - **Frontend:** Zod + React Hook Form による即時検証。
    - **Backend:** PostgreSQL の RLS (Row Level Security) と CHECK 制約によるデータ整合性の担保。
- **エラーマッピングの試み:** BaaS 固有のエラーをドメインエラーへ翻訳する変換層を実装。ネットワーク断やレートリミット等の例外ケースへの対応を検証。
- **品質保証へのアプローチ:** 
    - AI を活用した「戦略的テストプロトコル（エッジケース探索・敵対的生成）」の導入。
    - **Vitest** によるコンポーネントテスト。
    - **Playwright** によるブラウザ自動テスト (E2E)。

---

## 🛠 使用技術 (Tech Stack)

### Backend (BaaS)
- **Platform:** Supabase (PostgreSQL, Auth, Realtime)
- **Language:** SQL (PostgreSQL / RLS)
- **Type Sync:** Supabase CLI

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **Language:** TypeScript (Strict Mode / Branded Types)
- **Validation:** Zod
- **Form:** React Hook Form
- **State Management:** Zustand (Client), React Query (Server)
- **Styling:** Tailwind CSS v4, Shadcn/ui
- **Quality:** ESLint, Prettier, Vitest, Playwright

---

## 📖 機能一覧

### 1. ユーザー＆認証機能
- **会員登録:** ユーザーネーム、メール、パスワードによる登録。DB トリガーによる public テーブルへの自動同期。
- **ログイン/ログアウト:** Supabase Auth を利用したセキュアなセッション管理。
- **認証保護:** Middleware による未ログインアクセスの遮断（予定）。

### 2. SNS コア機能 (開発中)
- **タイムライン:** 全ユーザーの投稿表示（無限スクロール）。
- **ツイート投稿:** 140文字以内のテキスト投稿。自己参照構造によるコメント（リプライ）機能。
- **エンゲージメント:** ツイートへの「いいね」機能（楽観的UI更新対応）。
- **フォローシステム:** ユーザー間のフォロー/フォロワー管理。
- **プロフィール:** ユーザー詳細情報と投稿履歴の表示。

---

## 📦 環境構築

### 前提条件
- Node.js (v20以上)
- Git
- Supabase アカウント

### 1. セットアップ

```bash
# リポジトリをクローン
git clone git@github.com:yoshi-bell/OmoikaNex-Spb.git
cd OmoikaNex-Spb/frontend-next

# 依存関係のインストール
npm install

# .env.local の作成
# 以下の内容で作成し、Supabase の Project URL と Anon Key を設定してください。
# NEXT_PUBLIC_SUPABASE_URL=your_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
cp .env.example .env.local
```

### 2. データベースの構築と型同期

```bash
# プロジェクトの初期化と紐付け
npx supabase login
npx supabase link --project-ref your_project_id

# マイグレーションの反映 (テーブル・ポリシー作成)
npx supabase db push

# TypeScript 型定義の自動生成
npm run codegen
```

### 3. Supabase ダッシュボードでの手動設定 (重要)
現在、CLI が未対応の項目について、以下の設定をダッシュボードから手動で行ってください。

1.  **Authentication > Providers > Email** を開く。
2.  **Confirm email** を **Off** に変更して保存する。
    - ※ これを行わないと、会員登録時に即時ログインできずエラーとなります。

---

## 🧪 テストと品質管理

### テスト実行
```bash
# フロントエンド単体テスト (Vitest)
npm run test:unit

# E2E テスト (Playwright)
npm run test:e2e
```

### GitHub Actions (CI)
プッシュ・PR作成時に以下の工程が自動実行されます。
1. **Lint/Format:** ESLint および Prettier によるコード品質チェック。
2. **Build:** TypeScript コンパイルおよび Next.js ビルド。
3. **Tests:** 全自動テストの実行。

---

## 🛡 ライセンス
[MIT license](https://opensource.org/licenses/MIT).
