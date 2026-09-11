# 技術選定 — 何で作るか、どの機能まで使うか

**「新しい機能を使ったから、モダン」ではない。**
モダンさを決めるのは ①実機で速いか ②壊れないか ③中身が具体的か。
新機能は「同じ結果を、より少ないコードで、より壊れにくく出す」ときだけ採る。

これは [`visual-design.md` §0](visual-design.md) の罠（既定値に流れる）が、
**機能選びでも起きる**という話。「Bento＋ガラス風＋スクロール演出の全部乗せ」も、
新しいAPIを手当たり次第使うのも、根は同じ「選んでいない」状態。

---

## 0. 言語の範囲

**HTML / CSS / バニラJS。** ビルドステップなしで動く状態を既定にする（`snippets/` と同じ方針）。

- **TypeScript は使わない。** このリポジトリの検証環境・snippetsはバニラJS前提で、
  型を足しても検証できる範囲が変わらない
- 例外：フォーム処理・状態管理が数百行を超える、または複数人での実装になったとき。
  そのときは案件側で判断する（この資料は既定値であって強制ではない、`AGENTS.md` §3）
- フレームワーク（React等）は対象外。**LPでフレームワークが要る場面はほぼない。**
  必要になったら `2-web-app/` 側の話

---

## 1. ビルドするか

詳細な判断表は [`performance.md`「静的サイトでの実務」](performance.md) にある。ここでは結論だけ引く。

| 段階 | 判断 |
|---|---|
| プロトタイプ・小規模 | Tailwind CDN で十分 |
| 本番・集客が重要 | ビルドして CSS を静的ファイルにする |

CDN 版では `@layer`（後述）が実質使えない。**本番でCSS設計を活かすなら、この時点でビルドに切り替える判断が要る。**

---

## 2. 使ってよい機能の段階表

**このリポジトリでの新機能の扱いは、ここでしか定義しない。** 他のファイルはこの表を参照する。

段階の定義：

| 段階 | 意味 |
|---|---|
| **A 使ってよい** | 3ブラウザで出荷済み。フォールバックなしで書いてよい |
| **B 上乗せのみ** | 無くてもページが成立する形でだけ書く（`@supports` の上乗せ方向、後述） |
| **C まだ使わない** | 書かない。半年後に取り直す |

⚠️ サポート状況は MDN（[developer.mozilla.org](https://developer.mozilla.org/)）の Baseline 表示を **2026-09 に取得**。
Baseline は「主要ブラウザで広く使えるか」を示す指標であり、**個々のブラウザバージョンの詳細は別途確認する**。
日付は Baseline 到達日。**この表の賞味期限は §5 を見ること。**

| 機能 | 段階 | Baseline | 実体を書く場所 |
|---|---|---|---|
| `:has()` | **A** | widely available（2023-12〜） | [css-architecture §3](css-architecture.md) |
| `@layer` | **A** | widely available（2022-03〜） | [css-architecture §1](css-architecture.md) |
| `:is()` / `:where()` | **A** | widely available（2021-01〜） | [css-architecture §2](css-architecture.md) |
| CSS ネスト（`&`） | **A** | 主要ブラウザ対応済み。⚠️ 到達日は🔍未確認、人間確認キュー参照 | [css-architecture §4](css-architecture.md) |
| `@supports` | **A** | widely available（2015-09〜） | [css-architecture §6](css-architecture.md) |
| コンテナクエリ（`@container`） | **A** | 主要ブラウザ対応済み。⚠️ 到達日は🔍未確認、人間確認キュー参照 | [responsive.md](responsive.md) |
| Subgrid | **A** | widely available（2023-09〜） | [layout-patterns.md §3-C](layout-patterns.md) |
| `oklch()` | **A** | widely available（2023-05〜） | [0-core/color-spacing.md](../0-core/color-spacing.md) |
| `color-mix()` | **A** | widely available（2023-05〜） | [0-core/color-spacing.md](../0-core/color-spacing.md) |
| `svh` / `dvh` / `lvh` | **A** | Chrome 108・Firefox 101・Safari 15.4 以降（caniuse, 2026-09確認） | [responsive.md](responsive.md) |
| `<details name>` | **A**（機能自体は新しめ） | ⚠️ 正確な到達日🔍未確認。3ブラウザとも実装済みと確認 | [layout-patterns.md §7](layout-patterns.md) |
| `inert` | **A** | widely available（2023-04〜） | [responsive.md](responsive.md) |
| `<dialog>` | **A**（用途は限定） | widely available（2022-03〜） | [responsive.md](responsive.md) |
| Popover API | **A**（用途は限定） | Baseline 2025 newly available | [responsive.md](responsive.md) |
| `:user-invalid` | **A** | widely available（2023-11〜） | [forms.md](forms.md) |
| `light-dark()` | **B** | newly available（2024-05〜）。新しめなので上乗せ方向に限定 | [0-core/color-spacing.md](../0-core/color-spacing.md) |
| ビュートランジション（同一文書） | **B** | Chrome/Safari 対応、**Firefox 未対応**（⚠️ 要再確認） | [motion.md](motion.md) |
| `@property` | **B** | newly available（2024-07〜）。用途はグラデーションのアニメーションのみ＝実質不要 | [css-architecture §5](css-architecture.md) |
| `field-sizing` | **B**（採用は時期尚早に近い） | newly available（**2026-06〜**。この表の作成時点で3ヶ月）。textarea自動伸長。無くても困らない | [forms.md](forms.md) |
| スクロール駆動アニメーション（`animation-timeline`） | **C** | **Limited availability。MDNが「Baselineでない」と明記**（主要ブラウザの一部が未対応） | 使わない。`motion.md` に不使用の理由を明記 |
| Anchor Positioning | **C** | Chrome 151+/Safari 27+ で完全対応だが **Firefox は147〜158で部分対応止まり**（caniuse, 2026-09確認） | 使わない |
| 文書間（cross-document）ビュートランジション | **C** | Firefox 未対応 | 使わない |

> **意図的に削ったもの**: Anchor Positioning・`@scope`・`content-visibility` は「尚早または過剰」として不採用。
> `content-visibility` は LP の規模（5〜15画面）では効果よりCLS事故のリスクが大きいため、機能の成熟度に関わらず不採用。

---

## 3. 「使わない」と決めたものの記録

`references/sources.md`「意図的に採用しなかった情報源」と同じ作法。**削ったこと自体を残す。**

| 機能 | 削った理由 |
|---|---|
| スクロール駆動アニメーション | MDN 自身が Baseline でないと明記。`IntersectionObserver` 版で必要十分（`motion.md`） |
| Anchor Positioning | Firefox が部分対応止まり。LP でツールチップ的な用途は薄い |
| 文書間ビュートランジション | Firefox 未対応。LP は基本1ドメイン内の遷移が少ない |
| `@scope` | この規模のLP（セクション数6〜9）で詳細度スコープを切る必要が出ない |
| `content-visibility` | 効果（描画コスト削減）よりリスク（検索・CLS）が上回る規模 |

---

## 4. 依存を増やすときの判断

新しいライブラリ・APIを増やす前に、この順で自問する。

1. **素のCSS/JSで何行かかるか。** 数行で足りるなら依存を増やさない
2. **Baseline widely available にあるか。** あるならライブラリ不要（ポリフィル不要）
3. **それでも要るか。** ここまで通ってなお必要なら、`snippets/` で検証してから導入する

---

## 5. この表の賞味期限

**サポート状況は腐る。** この表は **2026-09 時点の MDN / caniuse** に基づく。

- 半年後（目安：2027-03）に取り直す
- 🔍 マークの項目（CSSネスト・コンテナクエリの到達日、`<details name>` の到達日、
  ビュートランジションのFirefox対応）は人間確認キュー（`references/sources.md`）に登録済み
- 段階Cの項目は、特に確認せず「まだ使わない」を維持してよい期間が半年
