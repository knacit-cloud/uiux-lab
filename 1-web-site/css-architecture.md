# CSS の書き方 — 詳細度と層

---

## 0. なぜこのファイルがあるか

[`LESSONS.md`](../LESSONS.md) L-001 / L-002 で、詳細度がらみの事故を2回踏んでいる。
どちらも `@layer` があれば起きなかった。
それなのに、この資料のどこにも `@layer` の説明がなかった
（`snippets/README.md` で「正しい解」と3回言及されているだけ）。

**このファイルの役目は「詳細度を数値でねじ伏せる」を終わらせること。**

---

## 1. `@layer` — 詳細度で殴らない

⚠️ 出典：[MDN — @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)（widely available・2022-03〜、2026-09確認）

層は**宣言した順が優先順**になる。同じ層の中では通常の詳細度が効く。
**後の層は、前の層より詳細度が低くても勝つ。**

```css
@layer reset, base, components, utilities;

@layer base {
  h2 { font-size: 2rem; }         /* 詳細度 0,0,1 */
}
@layer utilities {
  .text-6xl { font-size: 3.75rem; } /* 詳細度 0,1,0 だが、base より後の層なので必ず勝つ */
}
```

**Tailwind と併用するときの層構成**（[`snippets/README.md`](../snippets/README.md) の実測に基づく）：

```css
@layer reset, base, components, utilities;
```

`base` に日本語のタイポグラフィ設定（`line-height` / `font-family`）を入れれば、
Tailwind のユーティリティは常にそれより後に評価され、**詳細度を気にせず勝てる。**

> **注意：CDN 版 Tailwind（`<script src="https://cdn.tailwindcss.com">`）では `@layer` が実質使えない。**
> Tailwind CDN は自分の CSS を `<head>` 末尾に実行時注入するため（L-001）、
> `<link>` で読み込んだ `@layer` はその**手前**に来る。層の宣言順ではなく DOM 上の出現順が勝敗を決める。
> `@layer` の効果を出したいなら、この時点でビルド（[`tech-stack.md` §1](tech-stack.md)）に切り替える。

---

## 2. `:where()` / `:is()` — 詳細度を0にする／まとめる

⚠️ 出典：[MDN — :is()](https://developer.mozilla.org/en-US/docs/Web/CSS/:is)（widely available・2021-01〜、2026-09確認）

- **`:where()` は詳細度が常に0。** 何を書いても打ち消される側になる → **リセットCSS向き**
- **`:is()` は引数の中で最も詳細度が高いものを取る。** → まとめて書く用（打ち消されたくないとき）

```css
/* リセット：他の何にでも上書きされてよい */
:where(ul, ol) { margin: 0; padding: 0; list-style: none; }

/* まとめ書き：詳細度は維持したい */
:is(h1, h2, h3) { font-family: var(--font-serif); }
```

**既に使っている実例**：`snippets/css/focus-ring.css`、`snippets/css/themes/sumi.css` で
`:where()` によるフォーカスリセットに使用済み。**新規に書くコードもこれに揃える。**

---

## 3. `:has()` — 親と兄弟を選ぶ

⚠️ 出典：[MDN — :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)（widely available・2023-12〜、2026-09確認）

これまでJSでしかできなかった「子の状態で親を変える」がCSSだけでできる。
LPでの用途は3つに絞る（乱用すると再描画コストが上がる）。

```css
/* ① フォームの状態でボタンの見た目を変える */
form:has(:user-invalid) button[type="submit"] { opacity: 0.6; }

/* ② 画像の有無でレイアウトを分岐（画像なしなら1カラム） */
.card:has(img) { grid-template-columns: 1fr 1fr; }
.card:not(:has(img)) { grid-template-columns: 1fr; }

/* ③ ナビ展開中は背後のスクロールを止める */
body:has(#mobileNav:not([hidden])) { overflow: hidden; }
```

**注意：`body` や `html` に付けた `:has()` はページ全体を再評価する。** 使うのは開閉のような低頻度イベントに限る。

---

## 4. ネスト — 深さ2まで

⚠️ 出典：[MDN — CSS Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting)（主要ブラウザ対応済み。🔍 到達日未確認 — 人間確認キュー）

```css
.card {
  padding: 1.5rem;

  & h3 { font-weight: 500; }
  & .badge { color: var(--action-accent); }
}
```

**深さ2まで。** それ以上ネストすると、`css-architecture.md §1` で防いだはずの
「詳細度が読めなくなる」問題が別の形で再発する（ネストは暗黙的に詳細度を積み上げる）。

---

## 5. `@property` — 知っておくが、ほぼ使わない

⚠️ 出典：[MDN — @property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)（newly available・2024-07〜、2026-09確認）

CSSカスタムプロパティに型・初期値・継承可否を持たせ、**アニメーション可能にする**機能。

```css
@property --gradient-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
```

用途はグラデーションを回転させる等、**「かっこよくする」動き**にほぼ限られる。
[`motion.md`](motion.md) はそもそも装飾目的の動きを推奨していない。**このリポジトリでは実質不要。**
新しめの機能でもあるため段階B（[`tech-stack.md` §2](tech-stack.md)）。

---

## 6. `@supports` — 無い環境に何を見せるか

⚠️ 出典：[MDN — @supports](https://developer.mozilla.org/en-US/docs/Web/CSS/@supports)（widely available・2015-09〜、2026-09確認）

段階B機能（[`tech-stack.md`](tech-stack.md)）を使うときの書き方は**上乗せ方向**に限る。

```css
/* ○ 既定は素の形。対応環境だけ上乗せする */
.card { padding: 1.5rem; }
@supports (animation-timeline: view()) {
  .card { animation: fade-in linear; animation-timeline: view(); }
}

/* ✕ 打ち消す方向。書かない環境が「壊れて見える」原因になる */
.card { animation: fade-in linear; animation-timeline: view(); }
@supports not (animation-timeline: view()) {
  .card { animation: none; }
}
```

`prefers-reduced-motion` との組み合わせでは、**`prefers-reduced-motion` を後に書く。**
どちらも当てはまる環境では「動きを減らしたい」が優先されるべきだから。

```css
@supports (animation-timeline: view()) {
  .card { animation-timeline: view(); }
}
@media (prefers-reduced-motion: reduce) {
  .card { animation: none; }
}
```

---

## 7. トークン層との関係

色そのもの（`oklch()` / `color-mix()` / `light-dark()`）は
[`0-core/color-spacing.md`](../0-core/color-spacing.md) の担当。このファイルは「書き方」だけを扱う。

---

## チェックリスト

- [ ] 詳細度を上げて事故を止めようとしていない（`@layer` か `:where()` を先に検討した）
- [ ] CDN版Tailwindと `@layer` を併用していない
- [ ] `:has()` を `body`/`html` に使うなら、低頻度イベント限定であることを確認した
- [ ] ネストの深さが2以下
- [ ] 段階B機能は `@supports` の**上乗せ方向**でだけ書いている
