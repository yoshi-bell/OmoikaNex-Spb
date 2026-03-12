# GEMINI.md

このファイルは、本プロジェクト **OmoikaNex** に参加する AI エージェントのための「ナビゲーションマップ」です。

## 🗺 ドキュメント案内図 (Navigation Map)
プロジェクトの全ての正解は `docs-private/` フォルダに集約されています。AI はまず以下の順序でこれらを読解すること。

1.  **[復旧マニュアル]** `docs-private/01_AGENT_RECOVERY_MANUAL.md`
    - セッション開始時に真っ先に読み込み、現在のフェーズと歴史を同期せよ。
2.  **[憲法と設計思想]** `docs-private/02_RULES_AND_ARCHITECTURE.md`
    - プロジェクトの不変の原則。
3.  **[手順書]** `docs-private/03_WORKFLOW.md`
    - 開発サイクル、検証ルール、および「AI駆動開発規約」の定義。
4.  **[コーディング規約]** `docs-private/04_CODING_RULES.md` / `05_DESIGN_PATTERNS.md`
    - 具体的な実装スタイルと型安全設計の指針。

## 🤖 AI 駆動開発の独自ルール
Findy AI駆動開発偏差値の向上と、AI・人間共創の透明性を担保するため、以下を厳守せよ。

- **Co-authoring:** 
  全ての Git コミットの末尾に以下の署名を付与すること。
  `Co-authored-by: Gemini CLI <gemini-cli@google.com>`
- **Documentation First:** 
  実装の変更は必ず `07_DEV_LOG.md` に記録し、人間との認識齟齬を最小化せよ。

---
*このファイルは AI 向けですが、公開リポジトリにおける「AIとの共創の証」としても機能します。*
