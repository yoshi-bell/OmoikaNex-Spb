# OmoikaNex-Spb 開発ログ (Development Log)

## 概要

このドキュメントは、プロジェクト「OmoikaNex-Spb（Supabase版）」の開発プロセスを記録するものです。
当初の Laravel 12 構成から、より迅速な MVP 開発を目指して Supabase へと舵を切った経緯を含め、すべての技術的決定事項と学習の軌跡を蓄積します。

---

## 2026-02-24: SNSプロジェクト始動とドキュメントアーキテクチャの再編

### 1. プロジェクトの目的と方針

- **目的:** 過去のプロジェクトで培った「型安全性の極限までの追求」を初期設計から組み込み、最速で強固なTwitterクローンを開発する。
- **基本方針:**
    - **完全分離型アーキテクチャ (Headless):** Laravel 12 を「API専門」とし、Next.js 15 (App Router) がフロントエンドを統括する。
    - **フロントロードされた型安全性:** 手動での型定義を行わず、初日（Phase 1）から OpenAPI生成ツール (`Scribe`) と `openapi-typescript` による自動同期体制を設計。
    - **ドキュメント駆動開発の継承:** 「憲法・法律・マニュアル」といったAI協働システムを継承・進化させる。

### 2. 環境構築とドキュメント整備の完遂

- `01_SNS_DEVELOPMENT_PLAN.md`（ロードマップ原案）に基づき、前回の `Lara-Inertia-Attendance` で運用されていた `docs-private/` フォルダ内の全ドキュメントを、新しいSNSプロジェクト（Laravel + Next.js 完全分離型）向けにオーバーホールし、最適化した。
- **更新完了:**
    - `01_AGENT_RECOVERY_MANUAL.md` (復旧手順): Next.js/Laravel 向けに更新。
    - `02_RULES_AND_ARCHITECTURE.md` (憲法): API分離・トークン認証（BFF利用）・Zustand・RHF などを組み込んだ新アーキテクチャ宣言へ刷新。
    - `03_WORKFLOW.md` (ロードマップ): SNS開発の Phase 1 〜 5 までのチェックリストを反映完了。
    - `04_CODING_RULES.md` / `05_DESIGN_PATTERNS.md`: Next.js 固有のディレクトリ構成、React Query の Server/Client State 分離、そして Zustand の利用方針を策定。
    - `06_TESTING_GUIDE.md`: JSON API に対するテストと MSW/React Query のモック指針を追加。

---

## 2026-02-26: プロジェクト「OmoikaNex」正式始動とバックエンド初期化

### 1. プロジェクトの命名とディレクトリ移行

- **正式名称決定:** `OmoikaNex`（オモイカネクス）。知恵の神（Omoikane）、繋がり（Nexus）を統合。
- **資産移行:** `SNSアプリ` ディレクトリから全設計ドキュメントを `OmoikaNex` へ移行完了。

### 2. バックエンド基盤 (Phase 1) の構築

- **Laravel 12 API セットアップ:** `laravel.build` (Sail) を使用し、`backend-api` プロジェクトを初期化。
- **インフラ構成:** MySQL 8.4, Mailpit, phpMyAdmin を Docker (Sail) 上で構築。
- **権限調整:** Docker コンテナによる所有権問題を `sudo chown` により解決し、ホスト側からの編集権限を確保。
- **API 基盤の整備:**
    - `php artisan install:api` を実行し、Sanctum 認証基盤を導入。
    - `User` モデルに `HasApiTokens` トレイトを追加し、トークンベース認証の準備を完了。

### 本日の結果

- **ステータス:** Phase 1（インフラと型同期の初期構築）完了。
- **成果:**
    - Laravel 12 (API) と Next.js 15 の基盤を構築。
    - `Scramble` + `openapi-typescript` による API 型同期パイプラインを確立。バックエンドの変更がフロントの `schema.d.ts` に自動反映されることを確認。

---

## 2026-03-02: ON-Plan「二本立て戦略」の策定と Supabase 開発基盤の確立 (Phase 1)

### 1. マスター学習・開発計画 (ON-Plan) の採択
- **戦略転換:** 即戦力化と学習効率の最大化を狙い、バックエンドを Laravel から **Supabase** に切り替えた最速 MVP 開発（Phase A）を先行させる「二本立て戦略」を決定した。
- **構造再編:** 全体を統括する `ON-Plan` フォルダを作成し、その配下に Laravel 版と Supabase 版の両リポジトリを並列配置する構造に整理した。
- **移植性の設計:** フロントエンド UI をバックエンドから完全に抽象化（Repository パターン）し、将来的に Laravel 版（Phase B）へ無修正で移植可能とする高度なアーキテクチャを定義した。

### 2. インフラ構築と疎通確認
- **環境整備:** `OmoikaNex-Spb` ディレクトリから不要な Laravel 資産（`backend-api`）をパージし、純粋な Next.js 15 プロジェクトへとクリーンアップした。
- **Supabase 連携:** 
    - `@supabase/supabase-js` および `@supabase/ssr` を導入。
    - 規約に基づき、SSR/CSR 両対応の「通信局」(`src/lib/supabase/client.ts` / `server.ts`) を構築した。
    - 疎通確認用トップページの実装により、サーバー・クライアント両面からの API 通信成功（`Auth session missing!` レスポンスの正常受信）を実証した。

### 3. アーキテクチャの法制化と認証の抽象化
- **Repository パターンの強制:** `04_CODING_RULES.md` を更新。UI コンポーネント内での `supabase.from()` の直接呼び出しを厳禁とし、API 通信層への隔離をプロジェクトの最高法規とした。
- **認証方式の隠蔽:** `05_DESIGN_PATTERNS.md` をリファクタリング。JWT (Supabase) と セッションCookie (Laravel) の差異を隠蔽するための「認証抽象化フック (`useAuthUser`)」および「サーバーサイド認証関数 (`getAuthUserServer`)」の設計ルールを制定した。
- **二段構えバリデーション:** フロントの Zod とデータベース層の RLS/CHECK 制約を組み合わせた、BaaS 固有のセキュリティ戦略を確立した。

### 4. 品質保証体制の高度化
- **戦略的テストプロトコルの導入:** `06_TESTING_GUIDE.md` に AI 活用の三大戦略（エッジケース探索、プロパティベース、敵対的テスト生成）を統合。バグを「通るためのテスト」ではなく「壊すためのテスト」で狩り取る体制を整えた。

---

## 2026-03-03: IaC の深化と型同期パイプラインの完遂 (Phase 1 完了)

### 1. マイグレーション管理の高度化 (高凝集設計)
- **歴史の再編:** 独立していた「テーブル作成」と「ポリシー設定」のマイグレーションファイルを一つに統合。`npx supabase db reset` を活用することで、開発初期におけるクリーンなインフラ再構築手順を確立した。
- **Infrastructure as Code (IaC) の徹底:** ダッシュボードでの GUI 操作を廃止し、すべてのスキーマ変更を SQL ファイルで管理する規約を `02_RULES_AND_ARCHITECTURE.md` 等へ正式に反映した。

### 2. RLS ポリシーのプロフェッショナルな最適化
- **パフォーマンス向上:** `(select auth.uid())` 形式を採用。PostgreSQL の `initPlan` 最適化（キャッシュ化）を誘発させることで、行ごとの関数実行を回避し、大規模データ取得時の高速化を担保した。
- **堅牢性の強化:** `FOR UPDATE` ポリシーにおいて `WITH CHECK` 句を明示。更新前後の整合性を二重にガードし、予期せぬデータ書き換えを物理レベルで防止した。

### 3. 型同期パイプラインの最終確立
- **自動生成の成功:** Supabase CLI を用い、クラウド上の本物のデータベース構造から直接 `database.types.ts` を生成することに成功。
- **成果:** バックエンドの API 仕様（テーブル構造・リレーション・Null許容性）がフロントエンドの TypeScript 型定義と 100% 同期する、「ミスが不可能な開発基盤」を初日に完成させた。

### 本日の結果
- **ステータス:** Phase 1（インフラと型同期の初期構築）100% 完了。

---

## 2026-03-04: ドメイン駆動なバリデーション基盤と型安全 ID の構築 (Phase 2 開始)

### 1. エラーハンドリング・トランスレーション層の実装
- **統一エラー型の定義:** `src/types/error.ts` に `AppError` 型を新設。BaaS 固有のエラーを UI 層が理解可能なドメインエラーへと抽象化した。
- **エラーマッパーの構築:** `src/lib/error-mapping.ts` を作成。`AuthError`, `PostgRESTError`, およびネットワーク断などの例外を網羅し、`TEST_CASES.md`（セクション5）の要件をコードレベルで満たした。

### 2. Branded Types による型安全な ID 管理の導入
- **名目的型付け (Nominal Typing):** `src/types/brands.ts` を作成し、`UserId`, `TweetId` 等をブランド型として定義。
- **成果:** プリミティブな `string` や `number` の取り違えによる論理バグをコンパイル段階で完全に排除する、堅牢な型システムを構築した。

### 3. ドメイン・スキーマ (Zod) の策定
- **二段階検証の実装:** `src/lib/schemas.ts` において、ユーザー入力のバリデーションと、ドメイン型（Branded Types）へのトランスフォームを統合。
- **高精度なマッピング:** DB の生データを取得した瞬間に「検品（パース）」してドメインオブジェクトへ変換する Repository 層の準備を完了した。

### 4. 技術的判断と知恵
- **Repository の責務明確化:** アーキテクトの助言に基づき、`database.types.ts`（生の DB 型）を Repository 内部に隠蔽し、外部（UI層）へは Zod でパース・変換した純粋なドメイン型のみを公開する戦略を確定させた。
- **DB制約至上主義:** Zod を「快適な UX のための第一関門」と位置づけつつ、最終的な正解は DB の制約（RLS や CHECK）にあるという設計思想を `05_DESIGN_PATTERNS.md` へ反映した。

### 5. UI 基盤と認証抽象化レイヤーの確立
- **Shadcn UI の導入:** `Slate` をベースカラーに採用し、Tailwind CSS v4 と統合された UI コンポーネント基盤を構築。
- **Auth ストア (Zustand):** アプリ全体の認証状態を一元管理するストアを `src/store/auth-store.ts` に実装。Branded なドメインユーザー型を保持するように設計した。
- **認証抽象化フック (useAuthUser):** `src/hooks/useAuthUser.ts` を作成。内部で Supabase のセッション監視を行い、取得データを即座にドメイン型へ変換・ストア同期する仕組みを構築。これにより、UI 層からバックエンドの実装詳細を完全に隠蔽した（Auth Abstraction の執行）。

### 6. ログイン機能の実装と疎通確認
- **Auth Repository の実装:** `src/features/auth/api/auth.ts` を作成。Supabase Auth SDK をカプセル化し、エラーマッパーを介して UI へドメインエラーを返す Repository 層を構築した。
- **ログインフォームの構築:** 見本画像を忠実に再現した `LoginForm.tsx` を実装。RHF + Zod + Shadcn UI を統合し、デザイン性と堅牢性を両立させた。
- **共通認証レイアウト:** `app/(auth)/layout.tsx` および `AuthHeader` を作成。プロジェクトアセットの `logo.png` を活用し、ブランドイメージを統一した。
- **エラー通知基盤の完成:** `src/app/layout.tsx` に `Toaster` を配置。Supabase からの 400 エラーが `mapSupabaseError` で翻訳され、トースト通知として正しく UI に表示されることを実証した。

### 7. 新規登録機能の完遂と DB 自動同期の検証
- **新規登録フォームの実装:** 見本画像に基づき「ユーザーネーム」を含む 3 項目の `RegisterForm.tsx` を構築。会員登録成功後の自動ログインおよびホーム画面への遷移を確認した。
- **DB 自動同期トリガーの成功:** Supabase Auth (`auth.users`) への登録をフックに、アプリケーション用テーブル (`public.users`) へユーザー名とメールアドレスが自動保存されることを物理データで検証。インフラ（SQL）とアプリケーションの高度な連携を実証した。
- **メタデータの最適化:** アプリ全体の `Metadata` を修正し、デフォルトの「Create Next App」から「OmoikaNex-Spb」へとアイデンティティを統一した。

### 8. 技術的判断と例外的な運用
- **インフラ設定の「透明な手動操作」:** Supabase CLI がクラウド側の Auth 設定同期（メール認証の Off）に未対応である制限を特定。規約の「No Manual Changes」に対する例外として、ダッシュボードでの設定変更を実施し、その理由と経緯を本ログに明文化して記録した。
- **エラーマッパーの洗練:** 400 エラーを一律に「ログイン失敗」とせず、Supabase の生のメッセージを尊重しつつ「既に登録済み」等のケースを個別にマッピングするよう `error-mapping.ts` を改良。原因特定能力を向上させた。

---

## 2026-03-05: データフェッチ基盤の確立とダークモード UI への抜本的再編 (Phase 3 開始)

### 1. React Query (Server State) の導入
- **キャッシュ戦略の構築:** `@tanstack/react-query` を導入し、`QueryProvider` を `src/components/providers/QueryProvider.tsx` に配置。Next.js (App Router) 環境下において SSR/CSR 間で安全にインスタンスを共有するシングルトンパターンを構築した。
- **UIとの分離:** 状態管理とフェッチングの責務をライブラリに移譲し、UI側での `useState` への依存を削減した。

### 2. 高凝集な機能別ディレクトリ (Feature-based Structure) の維持
- 汎用フック (`src/hooks`) と機能固有フック (`src/features/.../hooks`) の境界を議論。将来の Laravel 移植時（ON-Plan Phase B）における「フォルダごとの可搬性（移植性）」を最優先とし、`useTimeline.ts` などの機能固有フックは `features` 配下に留める設計判断を堅持した。

### 3. モックアップに基づく UI アーキテクチャの抜本的リニューアル
- **設計資料との齟齬の解消:** AI 生成のデフォルトレイアウト（3カラム・ライトモード・中央フォーム）が画面仕様書の要件と合致していないことを特定し、根本的なリファクタリングを実施。
- **ダークモードへの完全移行:** 全体を `bg-[#16181c]` ベースのダークテーマへ統一し、テキストやボーダーの配色を見本画像に合致させた。
- **2カラム・レイアウトの確立:**
    - **左サイドバー (`Sidebar.tsx`):** ロゴ、ナビゲーションに加え、仕様通り「投稿フォーム (`PostTweetForm`)」をサイドバー下部に内包させる構造に変更。
    - **右メインエリア (`HomePage`):** ヘッダーのすりガラス効果を廃止し、タイムライン表示（`Timeline.tsx`）専用のコンテナとして再定義した。
- **型安全性の遵守:** `Timeline` 内の `key` 指定における不自然なダブルキャスト（`as unknown as string`）を排除し、`String(tweet.id)` による安全な変換へ修正。また、生データへの一時的な `any` 適用に対し、規約通りに意図を明記する ESLint コメントを付与した。

### 4. ツイート投稿 (Insert) と Mutation フローの完成
- **Repository の実装:** `src/features/tweets/api/post-tweet.ts` を作成。Supabase Auth から取得した `user.id` と Zod で検証されたデータを結合し、`tweets` テーブルへ安全に INSERT するロジックを構築。
- **React Query Mutation:** `usePostTweet` フックを作成し、投稿成功時に `queryClient.invalidateQueries(['timeline'])` を発火させる仕組みを実装。これにより、画面の再読み込みなしでタイムラインが自動更新される SNS のコア体験を実現した。

### 5. アセット設定とセキュリティ強化 (next.config.ts)
- **正式アセットの適用:** サイドバーのテキストロゴや仮アイコンを、正式なプロジェクト画像 (`logo.png`, `home.png`, `heart.png` 等) に置き換え、ダークモード用スタイル (`invert`) で最適化した。
- **Next.js セキュリティの適正化:** アバター画像自動生成 API (`api.dicebear.com` / SVG) を利用するため、`next.config.ts` で `dangerouslyAllowSVG: true` と `remotePatterns` を許可。
- **CSP (Content Security Policy) の設定:** 単なる SVG 許可による XSS リスクを排除するため、`contentDispositionType` および厳格な `contentSecurityPolicy` (`script-src 'none'; sandbox;`) を併記。BaaS / フロントエンド開発において要求される高いセキュリティ水準を実践した。

### 6. ツイート削除機能の実装と ZodError の解決 (Phase 4 開始)
- **Repository の実装:** `src/features/tweets/api/delete-tweet.ts` を作成。ツイート ID を受け取り、Supabase の `delete()` を実行。RLS により、本人の投稿以外は DB レベルで削除を拒絶する堅牢な設計を維持。
- **Mutation フック:** `useDeleteTweet.ts` を実装。削除成功時に `timeline` キャッシュを無効化し、UI への即時反映を実現。
- **ZodError (Auth initialization error) の特定と修正:**
    - **現象:** `useAuthUser` フック内で `userSchema.parse()` が失敗し、ログイン状態が `undefined` になるバグが発生。
    - **原因:** Supabase Auth のデータでは `name` が `user_metadata` 内にあるため、`userSchema` が期待するトップレベルの `name` プロパティが欠落していた。
    - **解決:** `useAuthUser.ts` 内でパース前に `user_metadata.name` をトップレベルへマッピングする前処理を追加し、検品フローを正常化。
- **UI 制御の堅牢化:** `TweetCard.tsx` において、`user.id` と `tweet.user_id` の比較を明示的な文字列キャスト (`String()`) に変更。Branded Types の型変換による微細な差異を吸収し、確実に自分の投稿にのみ削除ボタンが表示されるよう修正。
- **ユーザー体験 (UX):** 削除実行前に `window.confirm` による確認工程を挟み、誤操作によるデータ消失を防止。

### 7. 「いいね」機能と楽観的UI更新 (Optimistic Update) の実装 (Phase 4 & 5)
- **Schema & Query 拡張:** `src/lib/schemas.ts` および `get-timeline.ts` を更新。PostgREST のサブクエリを活用し、各ツイートの「いいね総数 (`likes_count`)」と「ログインユーザーのいいね状態 (`is_liked`)」を 1 回のクエリで効率的に取得する仕組みを構築。
- **トグル Repository:** `toggle-like.ts` を実装。既存のいいねの有無を `maybeSingle()` で確認し、動的に追加 (Insert) または削除 (Delete) を行うトグルロジックを確立。
- **楽観的UI更新の導入:** `useToggleLike.ts` フックにおいて React Query の `onMutate` を活用。
    - 通信開始の瞬間にキャッシュを直接書き換え、ハートの点灯とカウント増減を即座に反映。
    - 通信失敗時にはバックアップデータによる自動ロールバック (`onError`) を実装。
- **検証を通じた技術的深化:** 
    - **Mutation のエラー伝播:** Repository が返す失敗オブジェクトを `mutationFn` 内で明示的に `throw` することで、React Query の `onError`（ロールバック）を確実に発火させる設計へ改良。
    - **Network Mode の制御:** オフライン時でも即座にロールバックを発生させるため、`networkMode: 'always'` を採用。BaaS 特有の非同期挙動に対する堅牢性を担保。
- **UI の完成:** `TweetCard.tsx` に「いいね」ボタンを統合。`is_liked` に応じた動的な配色 (`text-rose-500`) と透明度の切り替え、およびリアルタイムな件数表示を実装。

---


