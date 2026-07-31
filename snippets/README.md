# snippets

> 🔲 **これから。** コピペして使える実装を貯める場所。

## 方針

- **Tailwind CSS ＋ バニラ JS** を基本にする（今の作り方に合わせる）
- 1ファイル1パターン。**そのままコピーして動く**こと
- `0-core/implementation-checklist.md` を全部通過していること
- コメントで「なぜそう書いているか」を残す（後から自分が読む）

## 貯める予定のもの

### 0-core 由来（全対象共通）
- [ ] `reduced-motion.css` — `prefers-reduced-motion` の一括対応
- [ ] `tokens.css` — 色・余白・タイポの CSS 変数テンプレート（意味トークン込み）
- [ ] `focus-ring.css` — `:focus-visible` の共通スタイル
- [ ] `japanese-text.css` — 日本語本文の基本設定（行間・禁則・折り返し）

### 1-web-site 由来
- [ ] `button.html` — hover / focus-visible / 送信中スピナー付き
- [ ] `faq-details.html` — `<details>` ベースのアクセシブルなFAQ
- [ ] `form-contact.html` — バリデーション込みの問い合わせフォーム
- [ ] `scroll-reveal.js` — `IntersectionObserver` によるスクロール表示
- [ ] `meta-head.html` — OGP / canonical / 構造化データのテンプレート
- [ ] `lang-toggle.js` — 日英切り替え（`localStorage` 保存）

### 2-web-app / 3-mobile
着手時に決める。
