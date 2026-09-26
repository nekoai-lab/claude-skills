## 何を変えたか

-

## 確認したこと

- [ ] build
- [ ] lint
- [ ] test
- [ ] `tasks/current.md` を更新した

## レビュー

- レーン: solo / full（認証・お金・個人データ・削除を含む変更は full）
- 実装: Claude Code / Codex / Cursor Agent（1つだけ残す。request-qa がこれを見てレビュー担当を決める）
- QA_REPORT（`request-qa <PR番号>` の PR コメント）: あり / なし（solo）
- UX_REVIEW.md: あり / なし（solo・画面の変更なし）
- full のマージ条件：CI ＋ ラベル `qa-pass`（UI の変更ありは `ux-pass` も）。未実施・待機中は合格扱いにしない

## UI の変更がある full のときだけ

- [ ] 変更に関係する主要操作を通しで1回（Playwright / 手動）：
- [ ] 関係する空・エラー・完了状態のうち、該当するものだけスクリーンショット（`design/screenshots/`）
