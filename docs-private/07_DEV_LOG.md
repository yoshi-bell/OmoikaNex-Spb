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

