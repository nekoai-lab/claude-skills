---
name: astro-marketing-site-launch
description: Astro等の静的マーケ/ブログサイトやLPを「検索・AI・回遊・モバイル・アクセシビリティ・コンバージョン・信頼」に強い状態で作る/監査するためのチェックリストと実装パターン。ユーザーが「新しいサイト/LPを作る」「ブログ/インサイト機能を追加する」「サイトのSEO/AIO/モバイル/アクセシビリティを見て」「公開前チェックして」などと言ったときに使う。SEO(JSON-LD/canonical/カテゴリ・タグ静的ページ)・AIO(llms.txt/RSS/sitemap/robots)・回遊(前後記事/関連記事/文脈CTA)・パフォーマンス(Core Web Vitals)・コンバージョン設計(CRO)・計測(GA4イベント/CV)・フォーム/スパム対策・法令/Cookie同意/外部送信規律・プライバシーポリシー・横はみ出しゼロ・ファビコン要件・セキュリティヘッダ・依存の落とし穴(@astrojs/sitemapのAstro4互換等)を含む。
---

# Astro Marketing Site Launch Checklist

静的マーケ/ブログ/LPサイト（Astro 前提、他SSGにも概ね応用可）を最初から品質高く作るためのチェックリスト。過去プロジェクトで「最初から良かった土台」と「後追いで直した改善」を、視点別に整理したもの。

新規着手時・公開前監査時に、下の**視点マップ**から該当セクションを確認する。

## 視点マップ（どの観点か一目でわかる）

| 視点 | 目的 | セクション |
|------|------|-----------|
| **土台** | 最初から満たすべき最低ライン | ✅ 既に良かった土台 |
| **守り** | 検索・AI・クローラに正しく届ける | 1 SEO / 2 AIO・フィード |
| **回遊** | サイト内を回してもらう | 3 回遊性 |
| **体験** | モバイル・アクセシビリティ | 4 モバイル / 5 a11y |
| **信頼** | 法令・ポリシー・フォームで安心させる | 6 信頼・ポリシー・フォーム |
| **攻め** | 速さとCVで成果を出す | 7 パフォーマンス / 8 CRO / 9 計測 |
| **堅牢** | セキュリティ・エラー・正規化 | 10 セキュリティ・エラー |
| **運用** | 公開後も壊れない | 運用 / 検証 / デプロイ |

---

## ✅ 既に良かった土台（＝最低ライン。新規でも必ず満たす）

前回プロジェクトで着手時点から品質が高く、そのまま踏襲すべきもの。

### 技術基盤
- **`<head>` を共通 Base レイアウトで一元管理**。Props: `title / description / path / ogType / ogImage / noindex / jsonLd`
- **canonical を `site + path` で自動生成**
- **OGP / Twitter Card 完備**: `og:image:width=1200`/`height=630`、`og:locale=ja_JP`、`twitter:card=summary_large_image`
- **JSON-LD `@graph` 基底**: `Organization`(+`founder`) / `WebSite` / `Person` を `@id` で相互参照
- **`noindex` 制御**を Props で持つ（`thanks` 等）
- **GA4 は本番ドメイン限定**の inline ガード（localhost/プレビューでは計測しない）
- **フォント**: `preconnect` + `display=swap`
- **PWA/アイコン基礎**: `site.webmanifest` / `theme-color` / `apple-touch-icon`
- **Content Collections + Zod**: `category` は `z.enum`、`pubDate` は `z.coerce.date()`、`draft` フラグ
- **CI/CD**: Firebase Hosting + GitHub Actions（PRプレビュー + `main` 本番）
- **URL一貫性**: `trailingSlash:'always'` + `build.format:'directory'`
- **デザイン基礎**: clamp タイポ、CSS変数トークン
- **カスタム404**（`src/pages/404.astro`）

### 信頼・ポリシー（前回サイトの強み。テンプレ流用で済ませない）
- **プライバシーポリシーを実務水準で作り込む**（§6 参照）。制定日/最終改定日を明記
- **フッターに Privacy Policy リンク**を常設（`Footer.astro` の Company 欄）
- **問い合わせフォームに同意チェック必須**（プライバシーポリシーへのリンク付き）
- **問い合わせページのサイドに信頼要素**（返信目安「2営業日」・プライバシー・連絡手段）＝ CROの安心材料
- **thanks ページは `noindex`**（CV計測ポイントだが検索結果には出さない）

### フォーム完成度（前回の型を踏襲）
- ネイティブ HTML5 バリデーション + JS `checkValidity()` / `reportValidity()`
- **二重送信防止**（送信中 `disabled` + 「送信中…」）
- Google Forms へ `no-cors` POST + `Promise.race` タイムアウト → 失敗でも `thanks` へ遷移
- `label` と入力の紐付け、`必須/任意` の明示

## 0. 前提設定（astro.config / 配信）

- `site: 'https://example.com'`
- `trailingSlash: 'always'` + `build: { format: 'directory' }`
- Firebase Hosting: `"trailingSlash": true`（`.xml`/`.txt`/`.ico` はそのまま配信）
- ビルド: `ASTRO_TELEMETRY_DISABLED=1 npm run build`

## 1. SEO 構造 【守り】

- 全ページ: `title` / `meta description` / canonical / OGP / Twitter Card / `lang="ja"`
- JSON-LD `@graph`:
  - 全ページ: `Organization` / `WebSite` / `Person`
  - 記事: `BlogPosting` + `BreadcrumbList`
  - 一覧/カテゴリ/タグ/ポリシー: `WebPage` or `CollectionPage` + `BreadcrumbList`
- **著者 `sameAs`**: X/LinkedIn/note/Zenn 等（E-E-A-T）。URL はオーナー確認
- **カテゴリ/タグは静的ページ**（JSフィルタだけにしない）
  - `getStaticPaths` で `/insights/category/[category]/` `/insights/tag/[tag]/` を生成
  - 日本語タグはスラッグマップ（`生成AI → generative-ai`）
  - チップは **`<a href>` + JS `preventDefault`**（プログレッシブエンハンスメント）

## 2. AIO・フィード・robots 【守り】

- **llms.txt 動的生成**（`src/pages/llms.txt.ts`）。静的 `public/llms.txt` は削除
- **RSS**: `@astrojs/rss` + `<link rel="alternate" type="application/rss+xml">`
- **サイトマップ**: `@astrojs/sitemap`（`filter` で thanks/rss/llms 除外）→ `/sitemap-index.xml`
- **robots.txt**: `Sitemap:` 明記、AIクローラ `Allow: /`、`/contact/thanks/` は `Disallow`

## 3. 回遊性 【回遊】

- **前後記事ナビ**（日付降順ソート）
- **文脈付きサービス導線**（カテゴリ → `/services/#advertising` 等）
- **関連記事は加点方式**: `共有タグ*10 + 同カテゴリ`、frontmatter `related` 最優先
- カードグリッドは `PostGrid.astro` 等に集約

## 4. モバイル 【体験】

390px 幅で横スクロールゼロを必須検証。

- Grid: `1fr` → `minmax(0,1fr)` + 子に `min-width:0`
- 広い表: `.twrap{overflow-x:auto}` + JS自動ラップ（二重防止）
- `overflow-wrap:break-word`、グリッドは 3→2→1 カラム

## 5. アクセシビリティ 【体験】

- **H1は1つ**。装飾英字は `<p role="presentation" aria-hidden="true">`
- 複製DOM（ティッカー等）: `aria-hidden` + `tabindex="-1"`
- 装飾画像: `alt=""` + `aria-hidden`
- `text-wrap:balance`、ナビ/フィルタは実リンク
- **色コントラスト** 4.5:1、**:focus-visible** を消さない
- **`prefers-reduced-motion`** でアニメ停止
- **スキップリンク**、フォーム `label` 紐付け

## 6. 信頼・ポリシー・フォーム 【信頼】

前回プロジェクトでこだわって作ったポリシー実装を踏襲する。テンプレの流用で済ませない。

### プライバシーポリシー必須章立て（最低12項目）

| # | 章 | 内容 |
|---|-----|------|
| 1 | 取得する情報 | フォーム入力・取引情報・Cookie/アクセスログ |
| 2 | 利用目的 | 問い合わせ対応・サービス提供・改善・分析・法令対応 |
| 3 | 第三者への提供 | 法令例外・同意困難時の保護 |
| 4 | 業務委託先への提供 | 委託と監督 |
| 5 | **Cookie・外部送信** | **改正電気通信事業法の外部送信規律**。送信先（例 Google LLC）・送信情報・利用目的を**具体列挙**、オプトアウト手段 |
| 6 | 広告配信データ | リターゲティング、ハッシュ化提供、国外第三者への同意確認 |
| 7 | **AIツール業務利用** | 個人情報/機密を学習に使わせない、匿名化・学習不使用設定、社内ルール ← **AI時代の差別化** |
| 8 | 安全管理措置 | 漏えい防止・アクセス制御 |
| 9 | 肖像権・著作権・免責 | 人物写真の同意、コンテンツ権利、外部リンク免責 |
| 10 | 開示・訂正・削除請求 | 本人確認と対応窓口 |
| 11 | 改定 | 重要変更時のサイト告知 |
| 12 | お問い合わせ窓口 | 事業者名 + フォームリンク |

### ポリシーページの実装パターン
- `src/pages/privacy.astro`、`.prose` で読みやすい本文（`max-width:760px`、`line-height:2`）
- **制定日・最終改定日**をページ上部に表示
- **JSON-LD**: `WebPage` + `BreadcrumbList`（`noindex` にしない＝信頼ページとして索引させる）
- 窓口は `.contact-box` で視覚的に区切る
- SP: 下部パディングを十分に（フッター重なり防止）

### サイト全体での信頼導線
- フッター Company 欄に **Privacy Policy** 常設
- 問い合わせフォーム: `<label class="consent"><input required> <a href="/privacy/">プライバシーポリシー</a>に同意</label>`
- 問い合わせサイド: 「安心のプライバシー」「2営業日以内に返信」を並べる
- **thanks ページ**: `noindex` + 受付完了メッセージ（CV計測ポイント）
- GA4 を入れる時点で §5 の外部送信明示が必須（ポリシーと実装の整合）

### フォーム追加要件（土台に上乗せ）
- **honeypot**（隠しフィールド）を最低限入れる。必要なら Turnstile/reCAPTCHA
- 送信基盤: Google Forms（簡易）/ Formspree / Firebase Functions（自動返信・Slack通知）
- 送信失敗時のフォールバック（メール窓口併記）
- 物販・有料申込があれば **特定商取引法**・利用規約を追加

## 7. パフォーマンス / Core Web Vitals 【攻め】

- **画像**: Astro `<Image>` で WebP/AVIF、`width`/`height` 必須（CLS防止）。hero は `fetchpriority="high"`、他は `loading="lazy"`
- **LCP**: ファーストビュー画像/フォントを `preload`
- **フォント**: 過剰なウェイト読み込みを避ける
- 目安: LCP < 2.5s / INP < 200ms / CLS < 0.1。**Lighthouse（モバイル）計測**

## 8. コンバージョン設計（LP / CRO） 【攻め】

- ファーストビュー: **誰の何を解決するか** 1文 + 主要CTA1つ
- **社会的証明**（実績数値・ロゴ・声）+ **不安解消**（FAQ・料金・返信目安）
- CTA反復配置、フォーム項目は最小限
- 前回の良い型: 問い合わせサイドの信頼3点セット（§6）

## 9. 計測（GA4 イベント / CV） 【攻め】

- **CVイベント**: フォーム送信（thanks到達）・電話タップ・CTAクリック・スクロール到達
- thanks 到達を **キーイベント（コンバージョン）** に設定
- UTM運用ルール、**Google Search Console** 登録 + sitemap送信
- 同意が要る地域向け: **Consent Mode v2**、タグ増設時は GTM検討

## 10. セキュリティ・エラー・正規化 【堅牢】

- `firebase.json` headers: `HSTS` / `X-Content-Type-Options` / `Referrer-Policy` / `Permissions-Policy` /（可能なら）`CSP`
- **カスタム404**、旧URLは `redirects` でリダイレクトマップ
- **www ↔ apex 正規化**を決める（保留すると重複の元）
- `npm audit` を公開前に確認

## 6b. ファビコン 【守り】

Google検索で箱アイコンになる典型原因: 非正方形 / 48px未満 / favicon.ico 404。

- 正方形ソースから 16/32/48 の `.ico` を生成（`scripts/make-favicon.mjs`）
- `<head>`: `favicon.ico` + `favicon-32.png` + `favicon-48.png` + `icon-192.png` + `apple-touch-icon`
- 反映は再クロール後 **数日〜数週間**

## 7b. その他実装ディテール

- **メール難読化**: `data-u`/`data-d` + JS で `mailto:` 復元
- CTA/サービスカードは実在ページ・アンカーに統一

## 運用（公開後）

- アップタイム監視 / Sentry等
- 検証拡張: Lighthouse / axe / Rich Results Test / リンク切れ / 実機
- 独自ドメインメール: **SPF / DKIM / DMARC**

## 検証（デプロイ前）

```
- [ ] ビルド成功、dist に sitemap/rss/llms/favicon がある
- [ ] 390px 横スクロールなし
- [ ] 記事: 前後ナビ・関連記事・サービス導線
- [ ] Lighthouse(モバイル) LCP/INP/CLS 目安内
- [ ] フォーム: 同意必須・二重送信防止・honeypot・thanks遷移
- [ ] GA4 CVイベント発火、GSC sitemap送信
- [ ] プライバシーポリシー: 12章立て・外部送信明示・AI利用方針・制定改定日
- [ ] フッター/フォーム/問い合わせサイドにポリシー導線
- [ ] favicon正方形、セキュリティヘッダ、404、prefers-reduced-motion
```

390px はみ出しチェック:
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

## 依存の落とし穴

- **`@astrojs/sitemap`**: Astro 4 では `@3.2.1` に固定（3.7+ は Astro 5 専用でビルド落ち）
- GitHub Actions: `checkout@v5` / `setup-node@v5`、Node 22

## デプロイ（GitHub → Firebase）

- `main` push で本番、PR でプレビュー
- コミットメールは GitHub noreply（`GH007` 回避）
- サービスアカウント JSON は `.gitignore`

## Additional resources

- ファビコン生成: [scripts/make-favicon.mjs](scripts/make-favicon.mjs)
