# パフォーマンス

LP とコーポレートサイトでは、**表示速度は UX であると同時に集客そのもの**。
遅いページは検索順位が下がり、広告からの流入も離脱する。

---

## Core Web Vitals

⚠️ 出典：[web.dev — Web Vitals](https://web.dev/articles/vitals)（本文照合済・2026-07時点）

| 指標 | 意味 | Good |
|---|---|---|
| **LCP** (Largest Contentful Paint) | 主要コンテンツが表示されるまで | **2.5秒以内** |
| **INP** (Interaction to Next Paint) | 操作への反応 | **200ms以内** |
| **CLS** (Cumulative Layout Shift) | レイアウトのズレ | **0.1以下** |

判定は **75パーセンタイル**、モバイル／デスクトップ別。
「自分の環境では速い」は意味がない。**遅い回線・遅い端末での75%が基準。**

補助指標：**TTFB**（サーバー応答）、**FCP**（最初の描画）。
これらは Good 閾値が定義されていないが、LCP 悪化の原因切り分けに使う。

---

## CLS を防ぐ（最も安く効く）

レイアウトのズレは、**読んでいる最中に文章が飛ぶ**という直接的な不快感。

- **`<img>` に `width` と `height` を必ず書く**（CSS で可変にしても、比率確保のために属性は書く）
- 埋め込み（iframe、広告、SNS）に**あらかじめ領域を確保**する
- **Web フォントの読み込みで文字がズレるのを防ぐ**
  → `font-display: swap` ＋ `size-adjust` / `ascent-override` でフォールバックの寸法を合わせる
- 既存コンテンツの**上**に要素を挿入しない（お知らせバー、Cookie バナー）
  → 出すなら最初から領域を取るか、`position: fixed` で重ねる

```html
<img src="hero.webp" width="1200" height="630" alt="…"
     class="w-full h-auto" fetchpriority="high">
```

---

## LCP を速くする

LCP 要素はたいていヒーローの画像かテキスト。

- **ヒーロー画像に `fetchpriority="high"`。`loading="lazy"` を付けない**
  （ファーストビューの画像を lazy にするのは典型的な事故）
- fold より下の画像には `loading="lazy"`
- 画像は **WebP / AVIF**。適切なサイズにリサイズしてから配信する
  （4000px の写真をそのまま置かない）
- `<picture>` と `srcset` で画面幅ごとに出し分ける
- 外部ドメインに `preconnect`

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="font" type="font/woff2"
      href="/fonts/inter.woff2" crossorigin>
```

- **重要なフォントだけ preload**。全部やると逆に遅くなる
- 日本語 Web フォントは重い（数MB）。**サブセット化する**か、
  見出しだけに使い、本文はシステムフォントにする

```css
/* 日本語のシステムフォントスタック（読み込みゼロ） */
font-family: "Inter", -apple-system, BlinkMacSystemFont,
             "Hiragino Sans", "Noto Sans JP", "Yu Gothic", sans-serif;
```

---

## INP を良くする

- 重い JS をメインスレッドで長時間走らせない
- 入力ハンドラの中で**レイアウト値を読まない**（強制同期レイアウト）
- DOM の読み書きをまとめる
- スクロールイベントは間引く（`requestAnimationFrame` / `IntersectionObserver` を使う）
  → **スクロール連動アニメーションは `IntersectionObserver` で実装する。**
    `scroll` イベントで毎フレーム計算しない

---

## 静的サイトでの実務

Tailwind CDN（`<script src="https://cdn.tailwindcss.com">`）は
**ブラウザ上でCSSを生成するため、初期表示が遅くなる。**

| 段階 | 判断 |
|---|---|
| プロトタイプ・小規模 | CDN で十分。開発速度を優先 |
| 本番・集客が重要 | **ビルドして CSS を静的ファイルにする**（`tailwindcss` CLI で十分。フレームワーク不要） |

CDN のまま本番運用する場合、少なくとも：
- ファーストビューに必要な最低限のCSSを `<style>` でインラインに置く
- `<script>` は `<head>` の最後に置く

---

## 測り方

1. **Chrome DevTools → Lighthouse**（ローカルの目安。実環境とは違う）
2. **PageSpeed Insights**（実ユーザーデータ CrUX が見られる。**こちらが本番の評価**）
3. **Search Console → ウェブに関する主な指標**（実際の75パーセンタイル）

**開発機の高速回線・高速CPUで測った数値を信じない。**
DevTools の Network で「Slow 4G」、CPU で「4x slowdown」をかけて確認する。

---

## チェックリスト

- [ ] すべての `<img>` に `width` / `height`
- [ ] ヒーロー画像に `fetchpriority="high"`、`loading="lazy"` なし
- [ ] fold 下の画像に `loading="lazy"`
- [ ] 画像が WebP/AVIF で、適切なサイズにリサイズ済み
- [ ] 日本語フォントをサブセット化、または本文はシステムフォント
- [ ] 外部ドメインに `preconnect`
- [ ] 自動再生カルーセル・巨大動画がない
- [ ] PageSpeed Insights のモバイルで LCP 2.5秒以内
- [ ] CLS 0.1 以下
