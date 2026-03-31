# GEMINI.md (OmoikaNex-Spb)

このファイルは、本プロジェクト **OmoikaNex** に参加する AI エージェントのための「ナビゲーションマップ」です。

## 🗺 ドキュメント案内図 (Navigation Map)
1. **[復旧マニュアル]** `docs-private/01_AGENT_RECOVERY_MANUAL.md` (最優先)
2. **[憲法と設計思想]** `docs-private/02_RULES_AND_ARCHITECTURE.md`
3. **[手順書]** `docs-private/03_WORKFLOW.md`
4. **[コーディング規約]** `docs-private/04_CODING_RULES.md` / `05_DESIGN_PATTERNS.md`

## 🚀 技術スタック & 重要ルール (Summary)
- **Frontend:** Next.js (App Router), Tailwind CSS (Mobile First, No `@apply`), Shadcn/ui.
- **Backend/DB:** Supabase (PostgreSQL), Zod (Schema validation).
- **データアクセス層の徹底分離:** UIから直接Supabaseを呼び出すのは**厳禁**。必ず `src/features/[domain]/api/` を経由すること。
- **型安全:** Supabaseの型をUIに露出させず、Zodでマッピングしたドメイン型を使用する。
- **デザイン再現:** `docs-private/project-detail/` 内の `.png` 見本を「絶対正解」としてレイアウトを再現すること。

## 🤖 AI 駆動開発の独自ルール
- **Co-authoring:** コミット末尾に `Co-authored-by: Gemini CLI <gemini-cli@google.com>` を付与。
- **Documentation First:** 変更は必ず `07_DEV_LOG.md` に記録せよ。
- **意図を語る:** コードコメントは「何」ではなく「なぜ（Why）」を記述すること。

