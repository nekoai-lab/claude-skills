# claude-skills

月ねこAI（[@nekoai-lab](https://github.com/nekoai-lab)）が実際に使っているClaude Code SKILL集です。

「呼び出したときだけ読み込まれる」設計なので、トークンを無駄に消費しません。
実務で育てたSKILLを順次追加していきます。

---

## SKILL一覧

| SKILL | 説明 | 呼び出し例 |
|-------|------|-----------|
| [security-review](./security-review/SKILL.md) | AIが生成・修正したコードをシニアセキュリティエンジニアの視点でレビュー。OWASP Top 10 / OWASP LLM Top 10 / CVSS準拠。GCP / Python / Next.js対応 | 「セキュリティレビューして」 |
| [agent-design-review](./agent-design-review/SKILL.md) | AIエージェントの仕様書・要件定義をレビュー。ハーネス設計・ツール分類・コンテキスト設計・マルチエージェント構成・陳腐化リスクの5軸で問題を検出 | 「仕様書を見て」「設計レビューして」 |
| [information-design](./information-design/SKILL.md) | スライド・レポート・ダッシュボード・提案書の情報設計。わかりやすく・比較しやすく・誤解なく伝えるための設計原則を適用 | 「情報設計してレビューして」 |
| [public-dashboard-design](./public-dashboard-design/SKILL.md) | 公共ダッシュボードや説明責任が求められる資料に対して、誤解防止・比較しやすさ・信頼性確保を優先した設計ルールを適用 | 「公共向けのダッシュボードをレビューして」 |

---

## 使い方

### Claude Codeへの登録

プロジェクトの `.claude/skills/` ディレクトリにコピーして使います。

```bash
# 例：security-reviewをプロジェクトに追加
mkdir -p your-project/.claude/skills/security-review
curl -o your-project/.claude/skills/security-review/SKILL.md \
  https://raw.githubusercontent.com/nekoai-lab/claude-skills/main/security-review/SKILL.md
```

### 呼び出し方

Claude Codeのチャットで自然に話しかけるだけで自動的に読み込まれます。

```
# セキュリティレビュー
セキュリティレビューして

# コードを指定してレビュー
このコードのセキュリティレビューして
[コードを貼る]

# エージェント設計レビュー
仕様書を見てレビューして
[仕様書を貼る]
```

---

## SKILLの設計思想

- **呼び出し型**：毎回コンテキストに入るCursorルールと違い、必要なときだけ読み込む
- **実務ベース**：教科書的なチェックリストではなく、実際のインシデントから逆算した観点
- **コード付き**：抽象的な指摘ではなく、具体的な修正案をコードで返す
- **AI固有のリスクを含む**：従来のセキュリティチェックリストにないプロンプトインジェクション・SSRFなどに対応

---

## 関連リポジトリ

- [nekoai-lab/agent-design-docs](https://github.com/nekoai-lab/agent-design-docs) — AIエージェント設計思想ドキュメント（Zenn Book付録）

---

## Author

**月ねこAI / nekoai-lab**

- GitHub: [@nekoai-lab](https://github.com/nekoai-lab)
- Zenn: [月ねこAI](https://zenn.dev/nekoai)
- note:「月ねこAIニュース」

---

## License

MIT
