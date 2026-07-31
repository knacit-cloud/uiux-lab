# レスポンシブ設計

**LP への流入の大半はスマートフォン。** それなのに多くの制作は
デスクトップで作ってから縮める。順序が逆で、必ず破綻する。

---

## 原則：モバイルファースト

「モバイルでも見られるようにする」ではなく、**モバイルの制約で設計を決める**。

小さい画面で成立する情報量・優先順位は、大きい画面でも成立する。逆は成立しない。

```html
<!-- ✕ デスクトップ基準で書いて、モバイルで打ち消す -->
<div class="grid grid-cols-3 max-md:grid-cols-1">

<!-- ○ モバイル基準で書いて、大きい画面で足す -->
<div class="grid grid-cols-1 md:grid-cols-3">
```

Tailwind の `sm: md: lg:` は**min-width（それ以上）**。
プレフィックスなしがモバイル、と覚える。

---

## ブレークポイント

Tailwind 既定をそのまま使う。**独自の値を作らない。**

| 名前 | 幅 | 想定 |
|---|---|---|
| （なし） | 0〜 | スマートフォン縦 |
| `sm` | 640px〜 | スマートフォン横・小型タブレット |
| `md` | 768px〜 | タブレット |
| `lg` | 1024px〜 | ノートPC |
| `xl` | 1280px〜 | デスクトップ |
| `2xl` | 1536px〜 | 大型ディスプレイ |

**実務で使うのはほぼ `md` と `lg` の2つ。**
全部のブレークポイントで値を変えると、管理不能になる。

### 下限の確認幅

**320px で横スクロールが出ないこと**（WCAG 1.4.10 リフロー）。
iPhone SE や、ブラウザを縮めた状態がこれに当たる。

```
DevTools → デバイスツールバー → Responsive → 320 × 568
```

---

## セクション別の組み替え

### ヒーロー

| デスクトップ | モバイル |
|---|---|
| 見出し 3.75rem | **2.25rem 前後**（`clamp` で連続的に） |
| 左右2分割 | **縦積み。テキストが先、画像が後** |
| CTA 横並び | **縦積み、全幅**（`w-full sm:w-auto`） |
| `<br>` で改行制御 | **`<br>` を効かせない**（`hidden sm:block`） |

```html
<h1 class="text-[clamp(1.875rem,6vw,3.75rem)] leading-tight">
  何から手をつけるべきか、<br class="hidden sm:block">無料で診断します
</h1>
```

`clamp(最小, 可変, 最大)` で連続的に変える。ブレークポイントで飛ぶより滑らか。
**本文サイズには使わない。16px を下回らせない。**

### グリッド

```html
<!-- 3カラム：1 → 2 → 3 と段階的に -->
<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

<!-- 2カラム（zigzag）：モバイルは縦積み -->
<div class="grid gap-10 md:grid-cols-2 md:gap-16">
```

**`md:order-*` は `md` 以上だけに効かせる。** モバイルで順序が入れ替わると、
テキストより先に画像が来て fold を食う。

### 料金表

- **3プラン程度：縦積みでOK。** ただし推しプランの `-mt-4` は `lg:` 限定
- **4プラン以上・比較表：横スクロール。** 縦積みに崩さない（比較できなくなる）

```html
<div class="-mx-6 overflow-x-auto px-6">
  <table class="w-full min-w-[640px]">…</table>
</div>
```

`-mx-6 px-6` で画面端までスクロール領域を広げる。**見切れが「まだ続く」の合図。**

### フロー・ステップ

デスクトップ横並び → モバイル縦タイムライン。
繋ぎ線は `hidden md:block` でデスクトップのみ。

### テーブル全般

崩し方は2択。**中途半端にしない。**

1. **横スクロール**（比較が目的。料金表・仕様表）
2. **カードに変換**（1件ずつ見るのが目的。事例一覧）

---

## ナビゲーション

### ハンバーガーの罠

**ハンバーガーメニューの中身は発見率が落ちる。**
だから**主要CTAはハンバーガーの外に出す。**

```html
<header class="fixed inset-x-0 top-0 z-50 bg-surface/90 backdrop-blur">
  <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
    <a href="/" class="…"><img src="/logo.png" width="120" height="32" alt="Knacit"></a>

    <!-- デスクトップナビ -->
    <nav class="hidden items-center gap-8 md:flex">
      <a href="#problems" class="text-sm text-muted hover:text-ink">課題</a>
      …
    </nav>

    <div class="flex items-center gap-3">
      <!-- CTAは常に見せる（モバイルでも） -->
      <a href="#diagnosis"
         class="inline-flex min-h-[40px] items-center rounded-lg bg-accent-deep
                px-4 text-sm font-medium text-white">無料診断</a>

      <!-- ハンバーガーはモバイルのみ -->
      <button type="button" id="navToggle"
              aria-label="メニューを開く" aria-expanded="false" aria-controls="mobileNav"
              class="flex h-11 w-11 items-center justify-center md:hidden">
        <svg class="h-6 w-6" aria-hidden="true">…</svg>
      </button>
    </div>
  </div>

  <nav id="mobileNav" hidden class="border-t border-line bg-surface md:hidden">
    <ul class="space-y-1 px-6 py-4">
      <li><a href="#problems" class="block min-h-[44px] leading-[44px]">課題</a></li>
    </ul>
  </nav>
</header>
```

```js
const btn = document.getElementById('navToggle');
const nav = document.getElementById('mobileNav');
btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!open));
  btn.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
  nav.hidden = open;
});
// Escで閉じる
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
    btn.click(); btn.focus();
  }
});
```

**必須：** `aria-expanded` / `aria-controls` / `aria-label` の更新、Escで閉じる、
閉じたらトグルにフォーカスを戻す。

### 固定ヘッダーとアンカーリンク

固定ヘッダーがあると、アンカーで飛んだ先の見出しがヘッダーの下に隠れる。

```css
:target, [id] { scroll-margin-top: 5rem; }  /* ヘッダー高さ + 余白 */
html { scroll-behavior: smooth; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

**`scroll-margin-top` は WCAG 2.4.11（フォーカスが隠れない）にも効く。** 必ず入れる。

---

## タッチ前提の寸法

| 対象 | 最小 | 推奨 |
|---|---|---|
| タップ領域 | 24×24px（WCAG 2.5.8） | **44×44px** |
| 隣接要素の間隔 | — | 8px 以上 |
| フォーム入力欄の高さ | — | **48px** |
| 入力欄の文字サイズ | — | **16px 以上**（iOS の自動ズーム防止） |

```html
<!-- テキストリンクでもタップ領域を確保する -->
<a href="#" class="inline-flex min-h-[44px] items-center">リンク</a>
```

**iOS Safari は 16px 未満の入力欄でページを自動ズームする。**
`user-scalable=no` で殺すのは禁止（WCAG違反）。**入力欄の font-size を 16px 以上にする。**

```css
input, select, textarea { font-size: 16px; }
```

---

## セーフエリア

ノッチ、ダイナミックアイランド、ホームインジケータを避ける。

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

```css
.sticky-cta {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}
.full-bleed {
  padding-left: max(1.5rem, env(safe-area-inset-left));
  padding-right: max(1.5rem, env(safe-area-inset-right));
}
```

`viewport-fit=cover` を書かないと `env()` が 0 になる。**セットで書く。**

---

## モバイル追従CTA

スマホで有効。ただし条件つき。

```html
<div class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95
            px-4 pt-3 backdrop-blur md:hidden"
     style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom))"
     id="stickyCta" hidden>
  <a href="#diagnosis"
     class="flex min-h-[48px] items-center justify-center rounded-lg
            bg-accent-deep font-medium text-white">無料診断を申し込む</a>
</div>
```

```js
// ヒーローを抜けたら表示（fold内では出さない）
const hero = document.querySelector('#hero');
const cta  = document.getElementById('stickyCta');
new IntersectionObserver(([e]) => { cta.hidden = e.isIntersecting; })
  .observe(hero);
```

**ルール：**
- fold 内（ヒーロー表示中）は出さない。ヒーローのCTAと重複する
- 高さを抑える。画面を食う
- `env(safe-area-inset-bottom)` 必須
- **フッターのCTAと重なる**ときは、フッター到達で隠す
- `md:hidden` でデスクトップには出さない

---

## 画像のレスポンシブ

```html
<picture>
  <source media="(min-width: 768px)" srcset="/hero-lg.webp" width="1600" height="900">
  <img src="/hero-sm.webp" width="800" height="1000"
       alt="…" fetchpriority="high"
       class="w-full object-cover">
</picture>
```

- **モバイルに 2400px の画像を送らない。** 通信量が離脱に直結する
- アスペクト比が変わるなら `<picture>` で出し分ける（アートディレクション）
- 単に解像度が違うだけなら `srcset` + `sizes` で足りる

```html
<img src="/photo-800.webp"
     srcset="/photo-400.webp 400w, /photo-800.webp 800w, /photo-1600.webp 1600w"
     sizes="(min-width: 1024px) 33vw, 100vw"
     width="800" height="600" alt="…" loading="lazy">
```

---

## 確認手順

作り終えたら**この幅を全部通す。**

| 幅 | 確認すること |
|---|---|
| **320px** | 横スクロールが出ないか（WCAG 1.4.10）。最も壊れやすい |
| 375px | iPhone 標準。実使用で最も多い |
| 768px | タブレット。**2カラムが崩れる境目** |
| 1024px | ノートPC |
| 1440px | 余白が間延びしていないか（`max-w-*` が効いているか） |

加えて：
- [ ] **ブラウザ幅を連続的に伸縮させる**（飛び飛びの確認では見つからない崩れがある）
- [ ] 200% ズームで破綻しないか（WCAG 1.4.4）
- [ ] 横向き（landscape）で固定ヘッダーが画面を食いつぶさないか
- [ ] 実機で1回は見る。**エミュレータではタップ感とフォントレンダリングが分からない**
