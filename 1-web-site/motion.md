# モーション — どこまで動かすか

NN/g は「ホームページはモーションを最小に」と明記している（認知負荷とアクセシビリティ）。
一方、動きがゼロだと素っ気ない。**その線引きをここで決めておく。**

原則：**動きは「気づかせる」ためのもので、「魅せる」ためのものではない。**

---

## 判断基準

動きを足す前に自問する。

> **この動きを消したら、ユーザーは何か失うか？**

失わないなら**消す**。

| 目的 | 動かす価値 |
|---|---|
| 状態が変わったことを伝える（開いた・選ばれた・送信中） | **★★★ 必須** |
| 要素同士の関係を示す（ここから開いた、ここへ移動した） | ★★ 有効 |
| 視線を誘導する（次を読ませる） | ★ 控えめに |
| かっこよくする | **✕ やらない** |

---

## 既定値

**迷ったらこれ。** プロジェクト内で統一する。

| 用途 | 時間 | イージング |
|---|---|---|
| 色・不透明度の変化（hover等） | **150ms** | `ease-out` |
| 小さい要素の出現・移動 | **200ms** | `ease-out` |
| モーダル・ドロワーの開閉 | **250ms** | `ease-out`（開）/ `ease-in`（閉） |
| スクロール連動の出現 | **400–600ms** | `ease-out` |
| 300ms 超 | — | **理由がなければ使わない。遅く感じる** |

```js
// tailwind.config
theme: { extend: {
  transitionDuration: { DEFAULT: '200ms' },
  transitionTimingFunction: {
    DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)',  // ease-out 強め。上品に見える
  },
}}
```

### イージングの考え方

- **出現・入場は `ease-out`**（速く始まり、ゆっくり止まる）。自然で機敏に感じる
- **退場は `ease-in`**（ゆっくり始まり、速く消える）。待たされない
- **`linear` は使わない**（機械的。ローディングの回転だけ例外）
- `ease-in-out` は移動距離が長いときだけ

---

## 必ず守ること

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**これを入れないアニメーションは実装しない。** 前庭障害のある人には実害がある。

### アニメーションできるプロパティ

**`transform` と `opacity` だけ。**

| ✕ アニメーションしない | ○ 代替 |
|---|---|
| `width` / `height` | `transform: scale()` |
| `top` / `left` / `margin` | `transform: translate()` |
| `box-shadow` | 影を重ねた要素の `opacity` |
| `background-color` | 色は例外的にOK（レイアウトを再計算しない） |

`width`/`height`/`top`/`left` はレイアウト再計算を毎フレーム起こす。**カクつきの原因。**

```css
/* ✕ */ transition: all 0.3s;
/* ○ */ transition: opacity 200ms ease-out, transform 200ms ease-out;
```

**`transition: all` は書かない。** 意図しないプロパティまで遷移して、事故が起きる。

---

## LPで使っていい動き

### 1. ホバー・フォーカス ★必須

```html
<a class="rounded-lg bg-accent-deep px-6 py-3 text-white
          transition-colors duration-150 ease-out
          hover:bg-accent-deep/90
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep
          focus-visible:ring-offset-2">
```

**ホバーはコントラストを上げる方向に。** 薄くしない。

カードのホバーは控えめに。**持ち上げるなら 2px まで。**

```html
<article class="rounded-xl border border-line transition-transform duration-200
                hover:-translate-y-0.5">
```

`hover:scale-105` は**大きく動きすぎて安っぽい。** 使わない。

### 2. スクロール連動の出現 ★1〜2箇所まで

**全セクションに付けない。** 全部が動くと、動きが情報を持たなくなる。
それに、**スクロールが速い人には「まだ表示されていない」だけに見える。**

```css
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}
.reveal.is-visible { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

```js
// scroll イベントで毎フレーム計算しない。IntersectionObserver を使う
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('is-visible');
    io.unobserve(e.target);          // 一度出したら監視をやめる
  }
}, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
```

**ルール：**
- **移動距離は 16px まで。** 大きく動かすと読みづらい
- **一度出したら戻さない**（`unobserve`）。スクロールで点滅するのは最悪
- **JS が動かなくても読める状態にする**
  → CSS で `opacity: 0` にするなら、`<html class="js">` を JS で付けてから効かせる

```html
<script>document.documentElement.classList.add('js')</script>
<style>.js .reveal { opacity: 0; transform: translateY(16px); }</style>
```

これをやらないと、**JSエラー時にページが真っ白になる。**

### 3. 状態のフィードバック ★必須

送信中、読み込み中、開閉。**これは動きというより機能。**

```html
<button type="submit" data-submit
        class="inline-flex min-h-[48px] items-center justify-center gap-2 …">
  <svg data-spinner hidden class="h-4 w-4 animate-spin" aria-hidden="true"
       viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25"/>
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="3"
          stroke-linecap="round"/>
  </svg>
  <span data-label>無料診断を申し込む</span>
</button>
```

```js
form.addEventListener('submit', () => {
  // リクエスト開始後に無効化する（開始前に押せなくしない）
  btn.disabled = true;
  btn.querySelector('[data-spinner]').hidden = false;
  btn.querySelector('[data-label]').textContent = '送信中…';
});
```

- ラベルは `…` で終える
- `aria-live="polite"` の領域で結果を読み上げさせる

### 4. アコーディオンの開閉 △控えめに

`height: auto` は遷移できない。素直にやるなら**アイコンの回転だけ**にする。

```html
<summary class="…">
  <span>質問</span>
  <svg class="transition-transform duration-200 group-open:rotate-45">…</svg>
</summary>
```

高さも動かしたいなら `grid-template-rows` を使う（`0fr → 1fr`）。

```css
details .content { display: grid; grid-template-rows: 0fr;
                   transition: grid-template-rows 250ms ease-out; }
details[open] .content { grid-template-rows: 1fr; }
details .content > div { overflow: hidden; }
```

---

## LPで使わない動き

| ✕ | 理由 |
|---|---|
| **自動再生カルーセル** | 見られない・操作されない・CLSを生む・読む時間を奪う |
| **パララックス** | 酔う人がいる。スクロール性能を落とす |
| **カーソル追従の装飾** | タッチデバイスで無意味。CPUを食う |
| **タイプライター風の文字送り** | 読み終わるまで待たされる。LCPを悪化させる |
| **数値のカウントアップ** | 一瞬なら無害だが、遅いと読めない。**1秒以内に確定させる** |
| **ページ遷移のフルスクリーン演出** | 体感速度が確実に落ちる |
| **`scale(1.05)` 以上のホバー** | 大きすぎて安っぽい |
| **全セクションのフェードイン** | 動きが情報を持たなくなる |

**「動きで質感を出す」より、「余白とタイポで質感を出す」方が確実で速い。**

---

## パフォーマンスへの影響

- スクロールイベントで毎フレーム計算しない → **`IntersectionObserver`**
- アニメーションする要素に `will-change` を**乱発しない**（メモリを食う）。
  必要なら開始直前に付けて、終了後に外す
- `animate-spin` などの無限アニメーションは、画面外では止める
- 重い動きは INP（200ms以内）を悪化させる（`performance.md`）

---

## チェックリスト

- [ ] `prefers-reduced-motion` に対応している
- [ ] `transition: all` を書いていない
- [ ] `transform` / `opacity` 以外をアニメーションしていない
- [ ] 遷移時間が 300ms 以下（スクロール出現を除く）
- [ ] スクロール出現は 1〜2箇所まで、移動距離 16px 以下、一度出したら戻さない
- [ ] JS が失敗してもコンテンツが読める
- [ ] 自動再生カルーセル・パララックスがない
- [ ] 送信中・読み込み中のフィードバックがある
- [ ] アニメーション中でもユーザー入力で中断できる
