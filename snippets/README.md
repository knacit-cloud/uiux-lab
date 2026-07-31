# snippets

**そのままコピーして動く実装。** 資料（`0-core/` `1-web-site/`）の内容を、実際に動く形に落としたもの。

> ⚠️ **`index.html` は「見本帳」であって、公開用のサイトではありません。**
> 中身はすべてダミーです。どこにも公開しません。何かの事業サイトでもありません。
>
> 存在する理由は3つ:
> 1. **検証** — 資料に書いたコードが本当に動くか確かめる。実際にこれで
>    5件の不具合が見つかりました（[../LESSONS.md](../LESSONS.md)）
> 2. **見て選ぶ** — レイアウト型が実際どう見えるかは、開いた方が早い
> 3. **コピー元** — 動いている状態からコピーする方が安全

---

## まず開く

```bash
node .claude/server.js
```

→ http://localhost:4322/snippets/

`snippets/index.html` が**ライブカタログ**。`1-web-site/layout-patterns.md` の
セクション型（ヒーロー / 課題 / 解決策 / 流れ / 料金 / 声 / FAQ / CTA）が
実際に動く状態で並んでいる。各セクションの左上に型番のラベルが出る。

このページで確認できること：
- Tab キーでのフォーカス移動とフォーカスリング
- 右上の **EN** で日英切り替え（`localStorage` に保存される）
- ハンバーガーメニュー（幅を 768px 未満にする）
- スクロールでの出現アニメーション
- 幅 320px で横スクロールが出ないこと
- OS の「視差効果を減らす」で動きが止まること

---

## ファイル一覧

### `css/` — 読み込むだけで効く

| ファイル | 内容 |
|---|---|
| `tokens.css` | 色・余白・角丸・影の意味トークン。ダークモード込み。**ここの原子トークンだけ差し替えて使う** |
| `japanese-text.css` | 日本語本文の基本設定。行間1.7・和欧混植・禁則・等幅数字・iOS自動ズーム対策 |
| `focus-ring.css` | `:focus-visible` の共通スタイル、スキップリンク、`scroll-margin-top` |
| `reduced-motion.css` | `prefers-reduced-motion` 一括対応、出現アニメの定義、遷移プリセット |

読み込み順：`tokens` → `japanese-text` → `focus-ring` → `reduced-motion`

### `js/` — バニラJS。依存なし

| ファイル | トリガー | 内容 |
|---|---|---|
| `scroll-reveal.js` | `data-reveal` | `IntersectionObserver` で出現。一度出したら戻さない。3秒の保険つき |
| `nav-toggle.js` | `data-nav-toggle="パネルID"` | モバイルナビ。`aria-expanded` 同期・Esc で閉じてフォーカス復帰 |
| `lang-toggle.js` | `data-lang-toggle` / `.ja` `.en` | 日英切替。`<html lang>` も書き換える |
| `form-validate.js` | `form[data-validate]` | 検証・全角正規化・最初のエラーへフォーカス・送信中表示 |

### `html/` — 開いて確認できる

| ファイル | 内容 |
|---|---|
| `button.html` | ボタン各種（主要/副次/テキスト/送信中/アイコンのみ/濃い背景の上） |
| `faq-details.html` | `<details>` ベースのFAQ。JS不要 |
| `form-contact.html` | 問い合わせフォーム。項目5つ・インライン検証つき |
| `meta-head.html` | `<head>` テンプレート（OGP・構造化データ・preload） |

`<!-- COPY FROM HERE -->` 〜 `<!-- COPY TO HERE -->` の間がコピーする範囲。
その外側はデモと設計メモ。

---

## Tailwind と併用するときの注意（実測済み）

**Tailwind CDN は preflight を実行時に `<head>` の末尾へ注入する。**
`<link>` で読み込んだ CSS は常にその手前に来るので、
同じ詳細度（要素セレクタ）だと**必ず負ける**。

対処：

| 項目 | 対処 |
|---|---|
| `line-height` / `font-family` | `japanese-text.css` で `:root`（詳細度 0,1,0）に指定済み。preflight に勝つ |
| 見出しの `font-size` | **preflight が `inherit` にリセットする。** Tailwind を使うなら見出しサイズは `text-4xl` 等のユーティリティで指定する |
| ビルドして使う場合 | `@layer base` に入れれば詳細度を上げる必要はない |

詳細度を上げすぎると今度は**ユーティリティ側を打ち消す**ので、
`:root body` のような書き方はしない（`.bg-*` が効かなくなる）。

---

## 色のコントラストについて（実測値）

`tokens.css` の注記も参照。

| 組み合わせ | 比 | 判定 |
|---|---|---|
| `#A9786F` ＋ 白文字 | 約 **3.75:1** | 大きい文字は可（3:1）／**通常テキストは不足**（4.5:1 必要） |
| `#96685F` ＋ 白文字 | 約 **4.7:1** | AA 合格 |

そのため塗りつぶしボタンには `#96685F`（`--action-primary`）を使い、
`#A9786F` は大きい見出しや装飾（`--action-accent`）に回している。

---

## これから足すもの

- [ ] Bento グリッド（`layout-patterns.md` 3-B）
- [ ] 料金の比較表（横スクロール版・5-B）
- [ ] モバイル追従CTA（`responsive.md`）
- [ ] ロゴウォール
- [ ] SVG 図解のテンプレート
- [ ] `2-web-app` / `3-mobile` 用（着手時に決める）
