# 🟢 メタ定義: このファイルの責務 (AIエージェント用)

> **AIエージェントへの指示 (Prompt Repetition Strategy):**
> このファイルは機能実装における「設計パターンと技術的規約」を定義しています。
> 実装を開始する前に内容を読み込み、以下の原則を遵守するよう努めてください。
> 1. 技術の選択理由（Why）を学びの目的として記述すること。
> 2. プロジェクトの一貫性を保つため、定義された「具体的な禁止事項」や「命名規則」を厳守すること。

- **役割:** TypeScript 型ポリシー、データフロー、バリデーション戦略、アーキテクチャパターンの定義。
- **読むべきタイミング:** 設計フェーズ、型定義時、API通信層の構築時。

---

# SNSアプリ 設計パターン (Design Patterns) - 修正提案版

## 🛡️ TypeScript 型定義ポリシー (Type Safety Policy)

- **any の排除:** 原則として `any` 型の使用を避け、`unknown` と型ガード（Type Guard）を活用した堅牢な型システムの構築を目指す。
- **SSOT (Single Source of Truth) の維持:**
    - API の型定義は、Supabase CLI によって自動生成される `types/database.types.ts` を正解の基準とする。
    - フロントエンド側での重複した `interface` 定義（例: `interface User { ... }`）を手動作成・保守することは避け、自動生成された型から派生させることで不整合を未然に防ぐ。
- **Branded Types (Nominal Typing):**
    - `UserId` や `TweetId` などの ID を専用のブランド型として定義し、異なる種類の ID 同士の誤代入をコンパイル段階で検知できる設計を試行する。
- **定数管理と Union Types の自動導出:** 
    - ステータス値などは `constants` ファイルで `as const` を使用して一元管理する。
    - そこから `typeof` および `[keyof typeof ...]` を用いて Union Types を自動導出することで、仕様変更時の手動修正漏れを最小限に抑えることを目指す。
- **コンポーネント型 (Props) の命名規則:** 
    - 一貫性を保つため、React コンポーネントの Props 型は必ず `[Component Name]Props` という命名規則で定義し、エクスポートすることを原則とする。

---

## 🏗️ アーキテクチャ・パターン

### 1. データフローの分離 (Client-Server Separation)

- **構成:** `Supabase (PostgreSQL / RLS)` → (Supabase-js) → `React Query / Repository` → `Zod Validation & Mapping` → `React Component`
- バックエンドが権限と構造を担い、フロントエンドは Repository 層で受け取ったデータを Zod で検証・整形した上で UI へ渡す、責務の明確な分離を目指す。

### 2. 多層的なバリデーション構造 (Validation Layers)

- **フロントエンド検証: React Hook Form (RHF) + Zod:**
    - クライアントサイドの検証には Zod を用い、迅速なフィードバックによる UX 向上と不要な通信の抑制を図る。
    - **useState によるフォーム管理の回避:** 状態管理（`useState`）のみを用いた素のフォーム実装は、複雑化を避けるためにレガシーな手法と位置づけ、本プロジェクトでは原則として採用しない。
- **データベース層での整合性担保: Supabase (DB制約 & RLS):**
    - システムの最終的な防波堤として、PostgreSQL の `CHECK`, `UNIQUE`, `RLS` を活用した物理レベルでの保護を徹底する。
    - 「フロントエンドの検証はあくまで補助」と考え、データベース層での制約設計を常に優先する。

### 3. グローバル状態管理 (Zustand & Server State)

- **Server State:** React Query を用い、非同期データのキャッシュと同期の状態を管理する。
- **Client State:** Zustand を用い、UI 固有のグローバルな状態（モーダルの開閉等）をシンプルに管理することを目指す。

### 4. 認証の抽象化とポータビリティ (Auth Abstraction)

将来のバックエンド移植（Phase B）を見据え、認証の実装詳細を UI から分離する設計を導入する。

- **認証フックの提供 (Client Side):** UI は抽象化された `useAuthUser` 等を介してのみ認証状態にアクセスし、バックエンドの具体的な認証方式（JWT かセッションか等）への依存を減らすことを試みる。
- **サーバーサイドの抽象化 (Server Side):** Server Components 等では、バックエンド非依存の共通関数を介して認証を確認する。
- **通信規格の隠蔽 (API Client):** トークン付与等の方式差は API クライアントのインターセプター層で吸収し、上位層の移植性を高める。

### 5. Repository層における型変換とマッピング (Mapping Strategy)

DB の生データ（プリミティブ型）をドメインの型へと昇華させる「検品所」として Repository 層を定義する。

- **境界線の確立:** `database.types.ts` で定義されたプリミティブ型は、Repository 層の内部に留めるよう努める。
- **Branded Mapping:** Zod の `.transform()` を活用し、データを取得した瞬間にドメイン型へと変換し、UI 層へは完成されたデータを渡すことを目標とする。

### 6. エラーハンドリング・トランスレーション (Error Translation)

Supabase 特有のエラーを、UI が一貫して処理可能なドメインエラーへと変換する。

- **エラーマッパーの役割:** Supabase のエラーコードを、ドメイン固有のエラー種別に翻訳し、システム全体の不透明な失敗を減らすことを試行する。
- **サイレントな失敗への対応:** 通信断、レートリミット、および**「RLS により取得件数が 0 になるが HTTP 200 (Success) が返るケース」**などの BaaS 固有の挙動を適切に検知し、ユーザーへ通知する仕組みの構築を目指す。
