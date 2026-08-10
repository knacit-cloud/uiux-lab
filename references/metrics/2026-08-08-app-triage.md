# `2-web-app` 観察候補の実測可否判定（2026-08-08）

- 実施日: 2026-08-08
- 目的: `2-web-app/SCOPE.md` に挙げた候補7本が **実在するか / 実測できるか** を1本ずつ確かめる
- 条件: **1280×900 / デスクトップ**。テーマは対象の既定（Grafana はダーク、他はライト）
- **読み取りのみ。数値だけを抽出。文章・画像・デザインは複製していない**

> ⚠️ **すべて AI（Claude）が測定した値。人間未確認。**
> `AGENTS.md` の検証記号ルールにより `✅` は付けない。

> 🔴 **この測定で `metrics.js` がアプリでは半分しか使えないことが判明した。**
> 詳細は `LESSONS.md` L-016 / L-017 / L-018。

---

## 結論：7本中4本を実測対象として採用

| 候補 | 判定 | 理由 |
|---|---|---|
| **Grafana Play** | ✅ 採用 | ログイン不要で**本物の業務ダッシュボード**が動いている。唯一の「実アプリ」 |
| **Atlassian Design System** | ✅ 採用 | 実コンポーネントが**ページ内に直接**描画される（iframe なし）。サイト自体がアプリ実装 |
| **IBM Carbon** | ✅ 採用 | Storybook が **`react.carbondesignsystem.com` の固定ホスト**。URLが安定していて台帳に残せる |
| **SmartHR Design System** | 🟡 条件付き採用 | 実測可。**唯一の日本語**なので残す。ただし Storybook URL がビルドハッシュ付きで不安定（下記） |
| **Shopify Polaris** | ❌ 不採用 | `polaris.shopify.com` は **`shopify.dev` にリダイレクト**。開発者ドキュメントに統合され、実測できるコンポーネント集がない |
| **デジタル庁 デザインシステム** | 📖 一次資料のみ | コンポーネントは **Figma 配布**。ライブ実装が存在せず実測不可（iframe 0件） |
| **Material Design 3** | 📖 一次資料のみ | **未検証。** 上記と同型と推測しているだけ。実測対象に数えない |

**採用4本 = SCOPE で決めた「3〜5本」に収まる。**

### 残った穴（宿題）

**日本の「実アプリ」が1つもない。**
Grafana は海外製、SmartHR はコンポーネント単体。
`1-web-site` で出た海外偏り（`STATE.md` 宿題 #2）と**同じ穴が開いている**。

---

## ページレベルの測定

| 対象 | 種別 | window がスクロールする | ページ画面数 | 本文px | 本文行間 | `p`/`li` の数 |
|---|---|---|---|---|---|---|
| play.grafana.org | **実アプリ** | **✗** | 1 | **14** | 1.5 | **6** |
| atlassian.design | docs（アプリ実装） | **✗** | 1 | **14** | — | 27 |
| shopify.dev（旧Polaris） | docs | ✓ | 1.5 | 16 | — | 15 |
| smarthr.design | docs | ✓ | 12.2 | 16 | — | 36 |
| carbondesignsystem.com | docs | ✓ | **30.1** | 16 | — | 90 |
| design.digital.go.jp | docs | ✓ | 4.3 | **17** | **1.7** | 22 |

### ここから分かること

**① `window` がスクロールするかどうかが、「サイト」と「アプリ」を機械的に分ける。**
実アプリ（Grafana）と、自社デザインシステムで組まれた Atlassian は
`document.body.scrollHeight === innerHeight`。**内側の div が独立にスクロールする。**
Grafana では入れ子のスクロールコンテナが **5つ**あった。

これは判定に使える：`document.body.scrollHeight <= innerHeight` ならアプリ的な画面。

**② デジタル庁は自分のサイトで行間 1.7 を実践している。**
`STATE.md` 宿題 #1（資料 1.7 / デジタル庁 1.5+ / 実例 1.4〜1.5）の材料。
ただし**これはドキュメントサイトの数値**であって、業務画面の数値ではない。混同しない。

**③ ドキュメントサイトを「アプリの実例」として測ると、逆の結論が出る。**
shopify.dev を実例に入れていたら「アプリの本文は16px・ページは1.5画面」と記録するところだった。
実アプリ（Grafana 14px・スクロールしない）と正反対。

---

## テーブルの測定（実物のコンポーネント）

**ドキュメントページではなく、コンポーネントが実際に描画されている場所で測った値。**

| | SmartHR Table（**ja**） | Carbon DataTable | Atlassian DynamicTable |
|---|---|---|---|
| 可視行数 | **1** | 7 | 5 |
| **セルの文字サイズ** | **16** | **14** | **14** |
| **セルの行間** | **1.5** | **1.29** | **1.43** |
| **行の高さ** | **41px** | **48px** | **48px** |
| セル padding（上/左） | 8 / 16 | 0 / 16 | 4 / 8 |
| ヘッダーの文字サイズ | 13.7 | 14 | 12 |
| ヘッダーの高さ | 42px | 48px | — |
| テーブルの角丸 | — | **0** | — |

測定場所：
- SmartHR … `smarthr.design/products/components/table/` 内の Storybook iframe
  （🔍 `bddb468--63d0ccabb5d2dd29825524ab.chromatic.com` — **ビルドハッシュ付き。いずれ切れる**）
- Carbon … `react.carbondesignsystem.com/iframe.html?id=components-datatable-basic--default`
- Atlassian … `atlassian.design/components/dynamic-table/examples`（ページ内に直接描画）

### ここから分かること

**① 行の高さは 48px が2件で一致。** SmartHR だけ 41px と低い。
`0-core/accessibility.md` のタップ領域 44×44 を、SmartHR の行高は**下回っている**。
（テーブル行そのものはタップ対象でないので即違反ではないが、行内に操作を置くなら問題になる）

**② セルの行間が `AGENTS.md` の「本文は 1.5 倍以上」を割っている。**
Carbon **1.29** / Atlassian **1.43**。3件中2件が基準未満。

これは違反として直させるべきものではなく、**区別が足りていない**と読むべき。
テーブルのセルは1行で完結するデータであって、読み下す本文ではない。
1.5 を与えると行が間延びし、1画面に入る行数が減る＝密度が価値の画面では逆効果になる。

→ **`density.md` で「本文」と「データ」を分けて基準を書く。** これが最初の論点。

**③ ヘッダーは本文より小さい**（12〜14px vs 14〜16px）。3件とも同じ方向。

### この測定の限界

- **SmartHR は可視行が1行しかない**（Storybook の playground が1行しか出さない）。
  行の高さ41px は n=1。他2件と同列に扱えない
- Grafana のダッシュボードには `table` 要素が **0件**だった（パネル＝チャート主体）。
  テーブルのある Grafana 画面はまだ測っていない
- 3件とも**サンプルデータが入った理想状態**。実データで文字が溢れた行、
  権限で列が消えた状態、100行スクロールした状態は測れていない

---

## Grafana Play に `metrics.js` を通した結果（全項目）

**通ったが、半分は無意味な値だった。**

| 項目 | 出力 | 判定 |
|---|---|---|
| `typography.bodySize` | 14（median/mode、**n=6**） | 🟡 動くがサンプル不足 |
| `typography.bodyLineHeight` | 1.5 | 🟡 同上 |
| `typography.familyCount` | 2（Inter, Segoe UI） | ✅ 有効 |
| `typography.h1 / h2 / h3` | 28 / 17 / 18 | ✅ 有効 |
| `typography.lineChars` | 13 | ❌ パネル内の断片を拾っている |
| `color.textColorCount` / `bgColorCount` | 6 / 10 | ✅ 有効（※ダークテーマでの値） |
| `shape.radiusMode` / `radiusVariety` | 6 / 6種 | ✅ 有効 |
| `shape.shadowVariety` | 3 | ✅ 有効 |
| `spacing.sectionPaddingTop` / `Bottom` | **null（n=0）** | ❌ 全滅 |
| `spacing.containerMaxWidth` | **null（n=0）** | ❌ アプリは全幅で使う |
| `structure.pageHeightScreens` | **1** | ❌ 常に1 |
| `structure.buttonLikeInFold` / 全体 | **8 / 9** | ❌ fold 概念が無効 |
| `structure.h1InFold` | true | ❌ 常に true |
| `structure.sectionCount` | 7 | ❌ `<section>` がなくフォールバック判定 |
| `density.charsPerScreen` | **4323** | ❌ 密度でなく総文字数（除数が1のため） |

`SCOPE.md` で「❌ 使わない / △ 読み替え」と仕分けた項目が、**実測でそのまま裏付けられた。**
ただし理由は SCOPE に書いた「fold は LP 固有の概念だから」より深く、
**「アプリでは `window` がスクロールしないから」**という機械的な原因だった。

---

## `metrics.js` に必要な改修（次の作業）

1. **スクロール前提の修正**（L-016）：`window` が動かない場合、
   内側のスクロールコンテナを探して、そこをスクロールしてから測る
2. **本文の拾い方**：`p` / `li` だけでは足りない。
   アプリは `div` / `span` で組む。テキストノードを持つ要素まで広げる
3. **アプリ用の指標を追加**：可視行数 / 行の高さ / セル padding /
   余白の最小単位 / サイドバー項目数 / 同時に見えるアクション数
4. **LP専用項目をアプリモードで無効化**：fold・ページ画面数・字/画面
