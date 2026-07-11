---
name: astro-marketing-site-launch
description: Astro等の静的マーケ/ブログサイトを「検索・AI・回遊・モバイル・アクセシビリティに強い」状態で作る/監査するためのチェックリストと実装パターン。ユーザーが「新しいサイトを作る」「ブログ/インサイト機能を追加する」「サイトのSEO/AIO/モバイル/アクセシビリティを見て」「公開前チェックして」などと言ったときに使う。JSON-LD・canonical・カテゴリ/タグ静的ページ・llms.txt/RSS/sitemap/robots・前後記事/関連記事/文脈CTA・横はみ出しゼロ・ファビコン要件・依存バージョンの落とし穴（@astrojs/sitemapのAstro4互換等）を含む。
---

# Astro Marketing Site Launch Checklist

静的マーケ/ブログサイト（Astro 前提、他SSGにも概ね応用可）を「最初から検索・AI・回遊・モバイル・アクセシビリティに強い」状態で作るためのチェックリストと具体パターン。過去プロジェクトで後追い修正したものを最初から仕込むためのもの。

新規サイト着手時、または既存サイトの品質監査時に、このチェックリストを上から確認する。既に満たしている項目はスキップ。

## ✅ 既に良かった土台（＝最低ライン。新規でもここは必ず満たす）

前回プロジェクトで着手時点から品質が高く、そのまま踏襲すべきもの。新規でも最初からこの水準を作る。

- **`<head>` を共通 Base レイアウトで一元管理**。Props で `title / description / path / ogType / ogImage / noindex / jsonLd` を受け、ページごとに上書き可能な設計
- **canonical を `site + path` で自動生成**（手書きしない）
- **OGP / Twitter Card 完備**: `og:type/site_name/title/description/url/image` + `og:image:width=1200`/`height=630` + `og:locale=ja_JP`、`twitter:card=summary_large_image`
- **JSON-LD を `@graph` で基底実装**: `Organization`(+`founder`) / `WebSite` / `Person` を `@id` で相互参照。ページ固有 JSON-LD は Props で差し替え、未指定なら既定グラフ
- **`noindex` 制御**を Props で持つ（`thanks` 等の非インデックスページ用に `<meta name="robots" content="noindex,follow">`）
- **GA4 は本番ドメイン限定で読み込む inline ガード**を入れる（`location.hostname` を判定し、localhost/プレビューでは計測しない）。この分離は品質が高い
- **フォント最適化**: `preconnect`（googleapis / gstatic）+ `display=swap`
- **PWA/アイコン基礎**: `site.webmanifest` / `theme-color` / `apple-touch-icon`
- **Content Collections + Zod スキーマ**で型安全に。`category` は `z.enum([...])`、`tags`/`related` は `default([])`、`pubDate` は `z.coerce.date()`、`draft: z.boolean().default(false)`
- **CI/CD**: Firebase Hosting + GitHub Actions（PR で一時プレビューチャンネル、`main` で本番自動デプロイ）
- **URL 一貫性**: `trailingSlash:'always'` + `build.format:'directory'` を最初から
- **デザイン/レスポンシブの基礎がモダン**であること（clamp によるタイポ、CSS変数によるカラートークン等）

## 0. 前提設定（astro.config / 配信）

- `site: 'https://example.com'`（canonical / sitemap / RSS が正しいURLになる）
- `trailingSlash: 'always'` + `build: { format: 'directory' }`（`/about/index.html`）で URL とファイルを一致させる
- Firebase Hosting なら `firebase.json` に `"trailingSlash": true`。拡張子付き（`.xml`/`.txt`/`.ico`）ファイルはこの設定でもそのまま配信される
- ビルドは `ASTRO_TELEMETRY_DISABLED=1 npm run build`（サンドボックス外書き込みの EPERM を回避）

## 1. SEO 構造

- 共通 `<head>`（Base レイアウト）に: `title` / `meta description` / `<link rel="canonical">` / OGP(`og:*`) / Twitter Card / `lang="ja"`
- JSON-LD を `@graph` で用意:
  - 全ページ: `Organization`(+`founder`) / `WebSite` / `Person`
  - 記事: `BlogPosting`(`headline`/`datePublished`/`dateModified`/`author`/`publisher`/`articleSection`/`image`) + `BreadcrumbList`
  - 一覧/カテゴリ/タグ: `CollectionPage` + `BreadcrumbList`
- **著者の `sameAs`**: `Person` に外部プロフィール（X/LinkedIn/note/Zenn 等）の配列を入れると E-E-A-T に有利。URL はオーナーに確認する
- **カテゴリ/タグは静的ページとして生成する**（JS フィルタだけにしない＝クローラブルにする）
  - `src/pages/insights/category/[category].astro` と `tag/[tag].astro` を `getStaticPaths` で生成
  - 日本語タグは URL 用スラッグマップ（例 `生成AI → generative-ai`）を用意し、`%E3%…` の生URLを避ける
  - 一覧ページのカテゴリ「チップ」は `<button>` の JS フィルタではなく **実リンク `<a href>` + JS で `preventDefault` して絞り込む**（プログレッシブエンハンスメント）。クローラは実リンクを辿れる
  - 記事本文のカテゴリバッジ/タグは、対応するカテゴリ/タグ静的ページへリンクする

## 2. AIO・フィード・robots

- **llms.txt は動的生成**にする（記事追加に自動追従）。`public/llms.txt` を静的で置くと更新漏れの原因
  - `src/pages/llms.txt.ts` を `APIRoute` で作り、`getCollection` からカテゴリ別に一覧を生成、`Content-Type: text/plain; charset=utf-8`
- **RSS**: `@astrojs/rss` で `src/pages/rss.xml.js`、`Base` の `<head>` に `<link rel="alternate" type="application/rss+xml" href="/rss.xml">`
- **サイトマップ**: `@astrojs/sitemap` を integrations に追加（全ページ＝カテゴリ/タグ含む を自動収録）。`filter` で `/contact/thanks/`・`/rss.xml`・`/llms.txt` を除外
  - 生成物は `/sitemap-index.xml`（入口）と `/sitemap-0.xml`
  - **静的 `public/sitemap.xml` は削除**（動的生成と衝突/重複するため）
- **robots.txt**: `Sitemap: https://example.com/sitemap-index.xml` を明記。AIクローラ（GPTBot / OAI-SearchBot / ClaudeBot / Google-Extended / PerplexityBot / CCBot 等）に `Allow: /`。`/contact/thanks/` は `Disallow`

## 3. 回遊性（記事ページ）

- **前後記事ナビ**: 全記事を日付降順ソートし、現在記事の前後（新しい/古い）へのリンクを記事下に
- **文脈付きサービス導線**: 記事カテゴリ → 対応サービス(`/services/#advertising` 等)への CTA ブロックをカテゴリ別文言で
- **関連記事は加点方式**: `共有タグ数*10 + 同カテゴリ` でスコアし降順、同点は新しさ。frontmatter の `related: [slug]` を最優先（手動指定）。単なる「最新3件」にしない
- 共通のカードグリッドは 1 コンポーネント（`PostGrid.astro` 等）に集約して一覧/カテゴリ/タグで再利用

## 4. モバイル（横はみ出しゼロ）

**必ず 390px 幅で横スクロールが出ないか検証する**（詳細は下記「検証」）。

よくある原因と対策:
- Grid の `grid-template-columns: 1fr` は `minmax(auto,1fr)` 相当で **コンテンツ最小幅で縮まない**。中に `min-width:480px` の要素（表など）があると列が膨張しページがはみ出す
  - → モバイルで `minmax(0,1fr)` を使い、子に `min-width:0` を付ける
- **広いテーブルはスクロールラッパーで包む**: `.twrap{overflow-x:auto}` + `.twrap table{min-width:480px}`。Markdown の素の `<table>` は JS で `.twrap` に自動ラップ（`t.closest('.twrap')` で二重防止）
- flex/grid 子要素の `min-width:0`、`overflow-wrap:break-word` を長文英語に
- 一覧グリッドは幅に応じて 3→2→1 カラムへ段階的に

## 5. アクセシビリティ

- **H1 は 1ページ1つ**。日本語の価値提案コピーを H1 にし、装飾的な英語ディスプレイ文字は `<p role="presentation" aria-hidden="true">` に（見た目は維持）
- **複製DOM**（マーキー/ティッカーの2周目コピー等）は `aria-hidden="true"` + 内部リンクに `tabindex="-1"`
- **装飾画像**は `alt=""` + `aria-hidden="true"`。**意味を持つ画像**は説明的な `alt`
- 英語ディスプレイ見出しに `text-wrap:balance`
- ナビ/フィルタは JS 専用ボタンにせず実リンクで（クローラ・キーボード両対応）

## 6. ファビコン（検索結果でロゴを出す）

Google 検索のファビコンは要件が厳しい。汎用アイコン（箱）が出る典型原因:
- **正方形でない**（例 546×484）→ 却下される。**必ず正方形**
- **48px 未満**（32×32 のみ 等）→ 48px 以上（48 の倍数推奨: 48/96/192/512）を用意
- `/favicon.ico` が無い（404）
- `<head>` の `rel="icon"` が非正方形画像を指している

対応（`scripts/make-favicon.mjs` に生成スクリプトあり）:
- 正方形ソース（例 512×512 のアプリアイコン）から 16/32/48 を作り、正規の `.ico` を `public/favicon.ico` に生成
- `<head>`:
  ```html
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/logo/favicon-48.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/logo/icon-192.png" />
  <link rel="apple-touch-icon" href="/assets/logo/apple-touch-icon.png" />
  ```
- macOS でのリサイズ: `sips -z 48 48 icon-512.png --out favicon-48.png`
- 検索結果への反映は再クロール後で **数日〜数週間**。GSC の URL 検査でインデックス登録をリクエストして促進

## 7. その他の実装ディテール

- **メール難読化（フッター）**: ソースに `mailto:` と `@` を出さない。`<a class="fmail" data-u="contact" data-d="example.com">contact<span aria-hidden="true">&#64;</span>example.com</a>` を JS で `href="mailto:..."` に復元
- ヘッダー/フッターの CTA リンク先を実在ページ（`/contact/`）に統一。存在しない `#anchor` を指さない
- サービスカード等のリンクは実在アンカー（`/services/#advertising`）に

## 検証（デプロイ前に必ず）

```
Checklist:
- [ ] ビルド成功: ASTRO_TELEMETRY_DISABLED=1 npm run build
- [ ] dist に sitemap-index.xml / sitemap-0.xml / rss.xml / llms.txt / favicon.ico がある
- [ ] sitemap にカテゴリ/タグページが含まれ、thanks/rss/llms が除外されている
- [ ] 390px 幅で横スクロールなし（下記スクリプト）
- [ ] 記事に前後ナビ・関連記事・サービス導線が出る
- [ ] favicon.ico が正方形・複数サイズ、head の rel=icon が全て正方形
```

390px 横はみ出しチェック（dev サーバ + ブラウザで実行）:
```js
(() => {
  const vw = document.documentElement.clientWidth;
  const over = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1) over.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,30), right: Math.round(r.right) });
  });
  return { viewport: vw, docScrollWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > vw + 1, offenders: over.slice(0,15) };
})()
```
`.twrap` 内の表要素が `offenders` に出るのは正常（枠内でスクロールしている）。`documentElement.scrollWidth === viewport` なら合格。

## 依存バージョンの落とし穴（重要）

- **`@astrojs/sitemap` は Astro のメジャーに合わせる**。最新（3.7+）は Astro 5 専用フック `astro:routes:resolved` を使うため、**Astro 4 では `Cannot read properties of undefined (reading 'reduce')` でビルドが落ちる**。Astro 4 系では `@astrojs/sitemap@3.2.1` に固定する
- 「アクション @v4 が非推奨」の警告は @v4 自体ではなく **GitHub 側が Node 20 ランタイムを非推奨化**したのが原因。`actions/checkout@v5` / `actions/setup-node@v5`（Node 24 前提）に上げ、ビルド Node も 22 へ

## デプロイ（GitHub → Firebase Hosting の例）

- `main` push で本番自動デプロイ、PR で一時プレビューチャンネル（`@astrojs/rss` 等の追加後は `npm ci` が通るか要確認）
- **コミットメールは GitHub の noreply を使う**。個人メールだと `GH007: Your push would publish a private email address` で push 拒否される
  - `git -c user.email="<id>+<user>@users.noreply.github.com" commit --amend --reset-author --no-edit`
- サービスアカウント鍵の JSON は `.gitignore`（`*firebase-adminsdk*.json` 等）で必ず除外

## Additional resources

- ファビコン生成スクリプト: [scripts/make-favicon.mjs](scripts/make-favicon.mjs)
