# 🔵 メタ定義: このファイルの責務 (AIエージェント用)

> **AIエージェントへの指示 (Prompt Repetition Strategy):**
> このファイルはプロジェクトの「設計図」であり「憲法」です。
> 実装を開始する前に、内容を**「合計2回」**読み込み、不変の原則（API分離・フロントロードされた型安全・テスト駆動）を完全に理解してください。

- **役割:** プロジェクトの「仕様」「設計方針」「不変の原則」の定義。
- **読むべきタイミング:** 新しい機能の実装、DB変更、または設計上の判断が必要な時。
- **思考の優先順位:** 設計と方針に関して最優先。ここにある原則に反するコードを書いてはならない。
- **詳細な実装ルール:** コーディング規約、設計パターン、テスト指針については、下部の **「ドキュメントナビゲーション」** に従い、`04_CODING_RULES.md`, `05_DESIGN_PATTERNS.md`, `06_TESTING_GUIDE.md` を参照すること。

---

# SNSアプリ ルールとアーキテクチャ (Rules & Architecture)

## ⚖️ プロジェクト憲法 (The Constitution)

> **警告:** 以下のルールは、本プロジェクトにおいて**最優先される絶対的な制約**である。
> AIエージェントは独自の判断でこれに違反する提案や実装を行ってはならない。

1.  **言語と対話の厳守 (Japanese Only Policy):**
    - 思考、応答、ユーザーとの対話、およびドキュメント記述はすべて**日本語**で行うこと。
    - 英語での応答は、コード内の識別子や技術用語を除き、原則禁止とする。
    - Gitコミットメッセージは「日本語」かつ「プレフィックス（`feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`）」を必ず使用すること。
2.  **型安全性のフロントロード化 (Type Safety Front-loading):**
    - 過去プロジェクトで後から苦労して導入した技術（Zod, RHF, Zustand, OpenAPI連携, Branded Types）を**最初から標準アーキテクチャとして組み込む**。
    - フロントエンドの型定義を手動で作成・保守してはならない。必ず Supabase CLI による自動生成型定義 (`Database` 型) を利用すること。
3.  **BaaSベースの高速MVPと移植性 (Supabase & Portability):**
    - バックエンドは **Supabase** を利用し、最速でプロダクト（MVP）を構築する。
    - 将来的な「Next.js + Laravel構成（ON-Plan Phase B）」への移植を前提とするため、Next.jsのUIコンポーネント内にSupabase特有のコードを直接書くことを固く禁じる（Repositoryパターンの強制）。
4.  **品質の保証 (Testing & Verification):**
    - 新機能の開発にあたっては、その品質を担保するため、必ず対応するテストを作成・実行し、継続的な動作保証の基盤を構築すること。

---

## 🏗️ アーキテクチャと設計思想 (Architecture & Philosophy)

### アーキテクチャ: Supabase ファースト (Supabase First)

- **Backend / Database:** Supabase (PostgreSQL, Auth, Realtime)
- **Frontend:** Next.js 15 (App Router) + TypeScript
- **コンポーネント / UI:** Tailwind CSS, Shadcn/ui
- **状態管理 (State):** Zustand (グローバルUI状態), React Query (サーバー非同期取得/キャッシュ)
- **型・バリデーション:** Zod, React Hook Form (RHF), `@supabase/supabase-js` 生成型

### 認証 (Authentication)

- **Supabase Auth** を採用。
- `@supabase/ssr` を用いて、Next.jsの Middleware および Server Components とシームレスに統合されたCookieベースのセキュアなセッション管理を行う。

### 開発方針

- **Repository パターンの強制:** Supabase特有のデータフェッチロジックは `src/features/.../api` など特定の層に隔離し、UIコンポーネントから直接呼ばない。将来のLaravel化（バックエンド差し替え）時にUIへの修正をゼロにするため。
- **ドキュメント駆動開発:** AIのリカバリと品質担保のため、実装前に必ず設計をドキュメント化し、実装後にログを残すサイクルを徹底する。

---

## 🔒 技術仕様と重要ルール (Technical Specs & Rules)

### データベース設計

- **マイグレーション:** Supabase CLI を用いたマイグレーション管理。
- **セキュリティ:** Row Level Security (RLS) を必ず有効化し、データベースレベルでのアクセス制御（認可）を徹底する。

### バリデーション

- **Backend:** データベース(RLS)およびスキーマ制約による保護。
- **Frontend:** `Zod` + `React Hook Form` をUI（Shadcn UI）と強固に統合した「鉄壁のフォーム基盤」を構築し、Supabaseの自動生成型とマッピングする。

---

## 📚 ドキュメントナビゲーション

AIエージェントは、現在のタスクに応じて以下のファイルを読み込むこと。

1.  **コーディング中:** `04_CODING_RULES.md`（命名、スタイル、ディレクトリ構造）
2.  **実装パターン検討中:** `05_DESIGN_PATTERNS.md`（設計、型ポリシー、バリデーション）
3.  **テスト作成中:** `06_TESTING_GUIDE.md`（テスト戦略、モック、各テストフレームワーク）

---

## 📂 ドキュメント構成 (Documentation Structure)

- **`03_WORKFLOW.md`:** 開発の手順書・ロードマップ（作業時はこれを常に見る）。
- **`04_CODING_RULES.md`:** コーディング規約。
- **`05_DESIGN_PATTERNS.md`:** 設計パターン。
- **`06_TESTING_GUIDE.md`:** テスト指針。
- **`07_DEV_LOG.md`:** 開発ログ。
- **`01_AGENT_RECOVERY_MANUAL.md`:** エージェント復旧マニュアル。
