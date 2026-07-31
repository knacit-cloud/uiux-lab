# 出典台帳

この資料の主張がどこから来ているかの記録。

## 検証記号

| 記号 | 意味 |
|---|---|
| ✅ | **人間が確認済み。** これを付けられるのは人間だけ |
| ⚠️ | **AI が本文を照合済み・人間未確認。** AI の照合はここ止まり |
| 🔍 | リンクのみ。本文未照合。**根拠として引用しない** |

初回作成（2026-07-31）時点では、AI が WebFetch で本文を取得したものが `⚠️`、
未取得のものが `🔍`。人間が読んで確認したら `✅` に上げる。

---

## 一次資料（本文照合済 ⚠️）

| # | 資料 | URL | 使っている箇所 | 状態 |
|---|---|---|---|---|
| 1 | Vercel Web Interface Guidelines | https://github.com/vercel-labs/web-interface-guidelines | `0-core/implementation-checklist.md`、`0-core/typography.md`（記号の作法） | ⚠️ |
| 2 | NN/g — 10 Usability Heuristics | https://www.nngroup.com/articles/ten-usability-heuristics/ | `0-core/principles.md` | ⚠️ |
| 3 | NN/g — Homepage Design: 5 Fundamental Principles | https://www.nngroup.com/articles/homepage-design-principles/ | `1-web-site/hero-cta.md`、`structure.md` | ⚠️ |
| 4 | NN/g — The Fold Manifesto | https://www.nngroup.com/articles/page-fold-manifesto/ | `1-web-site/structure.md`（102% / 84% の数値） | ⚠️ |
| 5 | W3C WCAG 2.2 Quick Reference | https://www.w3.org/WAI/WCAG22/quickref/ | `0-core/accessibility.md` | ⚠️ |
| 6 | W3C — Understanding SC 2.5.8 Target Size | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | `0-core/accessibility.md`（24×24px と5つの例外） | ⚠️ |
| 7 | デジタル庁デザインシステム β — Typography | https://design.digital.go.jp/dads/foundations/typography/ | `0-core/typography.md`（16px下限、行間150%、字間、400/700） | ⚠️ |
| 8 | デジタル庁デザインシステム β — Spacing | https://design.digital.go.jp/dads/foundations/spacing/ | `0-core/color-spacing.md`（基準単位 8px） | ⚠️ |
| 9 | web.dev — Web Vitals | https://web.dev/articles/vitals | `1-web-site/performance.md`（LCP 2.5s / INP 200ms / CLS 0.1） | ⚠️ |

---

## 未照合（🔍）— 引用する前に本文を確認すること

| # | 資料 | URL | 何のために |
|---|---|---|---|
| 10 | デジタル庁デザインシステム β（トップ） | https://design.digital.go.jp/dads/ | Foundations の残り（色・レイアウト・エレベーション）、コンポーネント |
| 11 | Apple Human Interface Guidelines | https://developer.apple.com/design/human-interface-guidelines/ | `3-mobile/` 着手時 |
| 12 | Material Design 3 | https://m3.material.io/ | `2-web-app/`・`3-mobile/` 着手時 |
| 13 | W3C WAI-ARIA Authoring Practices Guide | https://www.w3.org/WAI/ARIA/apg/ | コンポーネント別のARIA実装パターン |
| 14 | Laws of UX | https://lawsofux.com/ | `0-core/principles.md` の法則群。**個別の一次文献に当たり直すべき** |
| 15 | Baymard Institute | https://baymard.com/research | フォーム・チェックアウトのUX調査 |
| 16 | Refactoring UI（書籍） | https://refactoringui.com/ | 実務的な視覚設計 |
| 17 | Inclusive Components | https://inclusive-components.design/ | アクセシブルなコンポーネント実装 |
| 18 | SmartHR Design System | https://smarthr.design/ | 日本語BtoB SaaS の実例 |
| 19 | Ameba Spindle | https://spindle.ameba.design/ | 日本語デザインシステムの実例 |
| 20 | デジタル庁「ダッシュボードデザインの実践ガイドブック」 | https://digital-agency-news.digital.go.jp/articles/2026-04-22-2 | `2-web-app/` 着手時。日本語のダッシュボード指針は貴重 |
| 21 | Shopify Polaris | https://polaris.shopify.com/ | `2-web-app/` 管理画面の実例 |
| 22 | Atlassian Design System | https://atlassian.design/ | `2-web-app/` 管理画面の実例 |
| 23 | IBM Carbon Design System | https://carbondesignsystem.com/ | `2-web-app/` データ密度の高い画面 |

---

## 人間確認キュー

読んで確認したら `⚠️` → `✅` に上げる。

- [ ] #4 NN/g Fold Manifesto — 「84%」の算出根拠（2調査の中間値という説明が妥当か）
- [ ] #7 デジタル庁 Typography — 字間の値がバージョンで変わっていないか（v2系・2026-07時点で取得）
- [ ] #8 デジタル庁 Spacing — 「8pxが基準単位」の記述の位置づけ（推奨か、規定か）
- [ ] #9 web.dev Web Vitals — INP が FID を置き換えた後の最新閾値であることの確認
- [ ] #1 Vercel WIG — リポジトリの更新頻度が高い。定期的に取り直す

---

## 出典なしで書いている箇所（自覚しておくこと）

以下は一次資料ではなく、実務慣行・一般的な合意に基づく。**根拠を聞かれたら「慣行」と答える。**

- タイプスケールの比率 1.25（Major Third）
- 余白スケール `4/8/12/16/24/32/48/64/96/128`（Tailwind 既定に準拠）
- 日本語の適正行長 35–45字
- 遷移時間 150–250ms
- ナビゲーション項目数 5–7
- `1-web-site/structure.md` のセクション順序
- `1-web-site/trust-btob.md` の信頼要素の強さの順序
- `1-web-site/forms.md` の項目数と分割形式の対応表

これらは**間違っているわけではないが、数字を根拠として振りかざさない。**
確度を上げたい項目が出てきたら、Baymard や NN/g の該当調査を探す。

### 2026-07-31 追加分（作り込み6ファイル）

以下は**Webデザインの実務慣行**に基づく。一次調査ではない。

- `layout-patterns.md` — セクション別レイアウト型の全体。
  「チェックリスト型が3カラムカードより効く」「交互配置は3〜4回まで」「3カラムが上限」等は
  **経験則であって計測値ではない**
- `visual-design.md` — 種類の上限（書体2・角丸3・影3等）、色の面積配分（90/8/2）、
  影の重ね方、目を細める/グレースケール等の確認手順
- `responsive.md` — ブレークポイントの実務判断（`md`と`lg`だけ使う）、確認幅のリスト。
  ※ 320px・44×44px・16px（iOS自動ズーム）は WCAG / プラットフォーム由来で根拠あり
- `motion.md` — 遷移時間の既定値（150/200/250ms）、移動距離16px、
  スクロール出現は1〜2箇所まで。**「NN/gがモーション最小化を推奨」の部分のみ #3 が根拠**
- `ux-writing.md` — 冗長表現の対応表、一文60字、見出し20〜35字。
  日本語の書き方の慣行。**表記ルールはプロジェクトごとに決めるもので、絶対の正解はない**
- `launch-checklist.md` — 項目の大半は他ファイルの再掲（根拠はそちら）。
  法務項目（プライバシーポリシー・特商法）は**一般論であり、法的助言ではない**

### 意図的に採用しなかった情報源

| 情報源 | 判断 |
|---|---|
| YouTube「Build and Deploy 3 Full-Stack React Native Apps…（10時間講座）」 | **不採用。** React Native の実装チュートリアルであり、①対象が `3-mobile` 側 ②内容が「どう実装するか」で「なぜそう設計するか」ではない。`3-mobile` 着手時に参考実装として見る余地はあるが、資料本体の主張の根拠にはしない |

**方針：実装チュートリアル（YouTube等）は snippets や実装の参考にとどめ、
資料本体の主張の根拠にはしない。** 混ぜると台帳の意味がなくなる。
