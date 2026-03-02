# SNSアプリ OmoikaNex 開発ログ (Development Log)

## 概要

このドキュメントは、過去のプロジェクトで得た高度なリファクタリングの知見（Zod, React Hook Form, Zustand, OpenAPI連携, APIベースの完全分離構成）をフロントロードした、最新の技術スタック（Laravel 12 / Next.js 15 / TypeScript）による SNS アプリケーションの開発プロセス、技術的決定事項、および学習の軌跡を記録するものです。

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

### 本日の結果と次回のタスク

**次回のタスク (Phase 1):** Backend (Laravel 12) のインストール、APIルーティング設定、Sanctumトークン環境の構築、および `Scribe` の初期設定へ進む。

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

### 本日の結果と次回のタスク

- **ステータス:** Phase 1（インフラと型同期の初期構築）完了。
- **成果:**
    - Laravel 12 (API) と Next.js 15 の基盤を構築。
    - `Scramble` + `openapi-typescript` による API 型同期パイプラインを確立。バックエンドの変更がフロントの `schema.d.ts` に自動反映されることを確認。
- **次回のタスク (Phase 2):** 「鉄壁のフォーム基盤」の構築。Zod スキーマの策定、React Hook Form (RHF) の導入、および Shadcn UI による UI コンポーネント基盤の整備。

---

## 2026-03-02: ON-Plan「二本立て戦略」の策定と OmoikaNex-Spb の始動

### 1. マスター学習計画 (ON-Plan) の決定

- **戦略転換:** 即戦力化と学習効率の最大化を狙い、バックエンドを Laravel から **Supabase** に切り替えた最速MVP開発（Phase A）を先行させる「二本立て戦略」を採択した。
- **構造再編:** 全体を統括する `ON-Plan` フォルダを作成。その配下に、Laravel用の `OmoikaNex` (Phase B向け・一時凍結) と、新設した Supabase用の `OmoikaNex-Spb` (Phase A) の両リポジトリを配置する構造に整理した。
- **マスター計画書:** `ON-Plan/IMPLEMENTATION_PLAN.md` を作成し、フロントエンドUIコードを抽象化（Repositoryパターン）し、後日 Laravel 版へ「UIへの修正ゼロで移植する」という壮大なアーキテクチャ設計を定義した。

### 2. OmoikaNex-Spb ドキュメントの Supabase 化

- `OmoikaNex-Spb/docs-private/` 以下の設計ドキュメントから Laravel 依存の記述を徹底的に排除・修正した。
- `02_RULES_AND_ARCHITECTURE.md`: バックエンドを `Supabase (PostgreSQL, Auth, Realtime)` に変更。
- `04_CODING_RULES.md`: フロントエンド内で `supabase.from()` の直接呼び出しを禁じ、API通信層に隔離する **Repository パターンの強制** をルール化した。
- `05_DESIGN_PATTERNS.md`: Laravel FormRequest に代わる「Next.js + Zod (第一関門)」と「Supabase RLS & 制約 (最後の砦)」の **二段構えバリデーション戦略** を定義した。
- `01_AGENT_RECOVERY_MANUAL.md` / `06_TESTING_GUIDE.md`: 復旧手順やテスト要件を Supabase 環境に最適化。

### 本日の結果と次回のタスク

- **ステータス:** Phase 1 (Supabase) 設計・ドキュメント整備の完了。
- **次回のタスク:** `OmoikaNex-Spb` フォルダ内にある不要な Laravel 資産（`backend-api`）の完全な削除とクリーンアップ。その後、Next.js 15 プロジェクト上への Supabase クライアント (`@supabase/supabase-js`, `@supabase/ssr`) の導入および環境変数の設定に進む。
