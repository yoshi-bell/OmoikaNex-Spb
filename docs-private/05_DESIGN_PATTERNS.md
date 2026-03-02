# 🟢 メタ定義: このファイルの責務 (AIエージェント用)

> **AIエージェントへの指示 (Prompt Repetition Strategy):**
> このファイルは「機能実装の設計パターンと堅牢性」の正解を定義しています。
> 新機能の設計、型定義、バリデーションロジックの構築、Service層の実装時に必ず読み込んでください。

- **役割:** TypeScript 型ポリシー、Service/DTO パターン、バリデーション戦略、アーキテクチャパターンの定義。
- **読むべきタイミング:** 設計フェーズ、型定義時、バックエンドロジック構築時。

---

# SNSアプリ 設計パターン (Design Patterns)

## 🛡️ TypeScript 型定義ポリシー (Type Safety Policy)

- **any 禁止:** `any` 型の使用を原則禁止。不明な場合は `unknown` + 型ガード（Type Guard）を使用する。
- **SSOT (Single Source of Truth) の徹底化:**
    - APIの型はすべて、Supabase CLI によってバックエンドデータベースから生成された `types/database.types.ts` を唯一の正解（大元の型）とする。
    - フロントエンド側で大元となるモデルの `interface`（例: `interface User { ... }`）を手動作成・保守することは **厳禁**。
- **Branded Types (Nominal Typing):**
    - `UserId` や `TweetId` などの ID 型をただの `number` や `string` ではなく、ブランド型として定義し、誤代入をコンパイル段階で防ぐ。
- **定数管理 (Constants):** ステータス値（pending, approved, etc）などは `constants` ファイルで `as const` を使用して一元管理し、そこから `typeof` および `[keyof typeof ...]` で Union Types を自動生成（導出）する。
- **コンポーネント型 (Props):** React コンポーネントの Props 型は必ず `[Component Name]Props` という命名規則でエクスポートする。
- **Utility Types の活用:** `Pick`, `Omit`, `Partial` などを使用し、生成された大元の型から派生させて再利用性を高める。

---

## 🏗️ アーキテクチャ・パターン

### 1. API中心のデータフロー (Client-Server Separation)

- **パターン:** `Supabase (PostgreSQL / RLS)` → (Supabase-js) → `React Query / Repository` → `Zod Validation & Mapping` → `React Component`
- バックエンド (Supabase) はデータ構造と権限に責任を持ち、フロントエンドは Repository 層で受け取ったデータを Zod で検証・パースし、キャッシュ（React Query）して表示する。

### 2. 鉄壁の二段構えフォーム基盤 (Form & Validation)

- **第一関門: React Hook Form (RHF) + Zod:**
    - クライアントサイドの「入力中・送信前」の検証は、**必ず Zod を用いて RHF と統合**して行う。即座にユーザーへエラーを返し、不要なサーバー通信を防ぐ。
    - 状態管理（`useState`）を使った素のフォーム実装はレガシー技術として扱い、採用しない。
- **最後の砦: Supabase Validation (DB制約 & RLS):**
    - フロントでの防御をすり抜けたり、APIを直接叩かれたりするケースへの防波堤として、**データベース層（PostgreSQL）での検証** を徹底する。
    - **CHECK制約・UNIQUE制約:** 文字数制限や重複禁止など、データの不整合を最下層で弾く。
    - **RLS (Row Level Security):** Laravelの `Policy` や `FormRequest` の認可処理の代替として、「そのユーザーはその操作（INSERT/UPDATE）をする権限があるか？」を SQL のポリシー設定で確実にガードする。

### 3. グローバル状態管理 (Zustand & Server State)

- **Server State (サーバー由来のデータ):** React Query
    - API からフェッチしたリストや詳細データ、それらの「ロード中」「エラー」などの状態は React Query (TanStack Query) に任せる。
- **Client State (UI専用のデータ):** Zustand
    - モーダルウィンドウの開閉、ダークモード設定、現在のログインユーザーのプレビュー状態など、サーバーと通信しない「UI固有のグローバル変数」は Zustand ストアに保存する。

### 4. 認証の抽象化とポータビリティ (Auth Abstraction)

将来の Laravel 移行 (Phase B) において UI を無修正で流用するため、認証ロジックを UI から完全に隠蔽する。

- **【対策 1】 認証のカスタムフック化 (Client Side):**
    - UI コンポーネントは直接 `supabase.auth` を参照せず、必ず抽象化されたフック `useAuthUser` 等を介して現在のユーザー情報や認証状態を取得する。
- **【対策 2】 サーバーサイドの抽象化 (Server Side):**
    - Next.js の Server Components や Middleware で認証を確認する場合、直接 Supabase クライアントを呼ばず、バックエンド非依存の共通関数（例: `getAuthUserServer`）を呼び出す。内部で Cookie（JWT）を扱うか Laravel に問い合わせるかは、この関数内でのみ管理する。
- **【対策 3】 通信規格の隠蔽 (API Client):**
    - 「ヘッダーに JWT を載せる (Supabase)」か「Cookie をそのまま送る (Laravel)」かという差異は、API クライアント（`src/lib/api-client.ts`）のインターセプター層で吸収する。UI や Repository 側は、通信規格の詳細を一切意識せずにリクエストを投げられる構成を維持する。
