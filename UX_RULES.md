# UX_RULES — claude-skills

`full` レーンで ChatGPT が担当する UX の成果物の置き場所と受け渡し。

## 成果物

| ファイル | 誰が | いつ | 置き場所 |
|---|---|---|---|
| `UX_SPEC.md` | ChatGPT | 実装の前（最初） | `design/UX_SPEC.md` |
| `UX_REVIEW.md` | ChatGPT | 実装のあと（最後） | `design/UX_REVIEW.md` |
| スクリーンショット | Claude Code | UX レビューの前 | `design/screenshots/` |

## 受け渡し

1. ChatGPT の成果物は、人が `design/inbox/` に置く
2. Claude Code が中身を確かめ、上の表の場所へ移してコミットする（`design/inbox/` には残さない）
3. Claude Code は UX_SPEC.md に沿って実装し、スクリーンショットを撮って `design/screenshots/` に置く
   - **PC とスマホ、それぞれ1枚以上**
   - ファイル名：`<画面名>-pc.png`／`<画面名>-sp.png`
4. 人が ChatGPT にスクリーンショットを渡し、UX_REVIEW.md をもらって `design/inbox/` に置く → 2 へ

UX_REVIEW.md の指摘のうち、直すものは PR で直す。直さないものは理由を UX_REVIEW.md の末尾に書く。
直す指摘がなくなったら、PR にラベル `ux-pass` を付ける（UI の変更がある full の PR はマージに必須。`~/Projects/ai-dev-harness/policies/git-flow.md`）。

## UI の変更がある full の PR で確かめること

UI の変更がある `full` の PR **だけ**。solo や、UI の変更がない PR では不要。

- [ ] **変更に関係する主要操作を通しで1回**（Playwright か手動）。やった方法と結果を PR に書く
- [ ] **変更に関係する空・エラー・完了状態のうち、該当するものだけスクリーンショット**を撮り、`design/screenshots/` に置く（該当しない状態は撮らなくてよい）
  - ファイル名：`<画面名>-<empty|error|done>-<pc|sp>.png`
