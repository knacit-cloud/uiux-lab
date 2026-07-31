# レイアウトパターン集

セクションごとの「型」。**毎回ゼロから考えない。型を選んで中身を入れる。**

型を持つ意味は、手を抜くためではなく、**判断を中身に集中させるため**。
並べ方で悩んでいる時間を、言葉と証拠を磨く時間に回す。

---

## コード例の前提

色は**意味トークン**で書く。Tailwind config で自プロジェクトの色に割り当てる。

| クラス | 役割 |
|---|---|
| `text-ink` | 本文・見出しの文字色（濃色） |
| `text-muted` | 補助テキスト |
| `bg-surface` | ページ背景 |
| `bg-surface-2` | 一段沈んだ背景（セクションの帯） |
| `border-line` | 罫線 |
| `accent` / `accent-deep` | ブランド色（CTA・強調） |

```js
// tailwind.config
theme: { extend: { colors: {
  ink: '#2E2A26', muted: '#736A60',
  surface: '#FFFFFF', 'surface-2': '#F7F3EE', line: '#E6DED4',
  accent: '#C99A93', 'accent-deep': '#A9786F',
}}}
```

---

## 0. セクションの共通骨格

**全セクションでこれを使い回す。** 余白とコンテナ幅が揃うだけで一気に整う。

```html
<section class="py-20 md:py-28">
  <div class="mx-auto max-w-6xl px-6">

    <!-- セクションヘッダー：左寄せが基本。中央寄せは特別なときだけ -->
    <header class="max-w-2xl mb-12 md:mb-16">
      <p class="mb-3 text-sm font-medium tracking-wider text-accent-deep">Problems</p>
      <h2 class="font-serif text-3xl md:text-4xl leading-snug text-ink"
          style="text-wrap: balance">
        こんな状態になっていませんか
      </h2>
      <p class="mt-4 leading-relaxed text-muted">
        当てはまるものが2つ以上あれば、仕組みの問題です。
      </p>
    </header>

    <!-- ここに型を入れる -->

  </div>
</section>
```

**決めごと：**
- コンテナ幅は `max-w-6xl`（1152px）を基本、読み物は `max-w-3xl`
- 左右パディングは `px-6`（モバイル24px）。**これを下回らない**
- セクション上下は `py-20 md:py-28`（80/112px）。**LPで余白をケチらない**
- セクションヘッダーの下は `mb-12 md:mb-16`
- 背景を交互に変えて区切る（`bg-surface` ↔ `bg-surface-2`）。**罫線より自然**

---

## 1. ヒーロー

### 1-A. 中央寄せ1カラム（テキスト主体）

**使いどころ：** 良い写真がない。言葉で勝負する。BtoBサービスの大半はこれで足りる。

```
┌────────────────────────────────┐
│                                │
│         [小さいラベル]           │
│      大きな見出し（2行まで）        │
│        サブコピー（1〜2行）         │
│                                │
│      [主要CTA]   副次リンク →      │
│                                │
│    ─── 実績数字 ─── 数字 ─── 数字   │
│                                │
│  ┈┈┈ 次セクションの見切れ ┈┈┈       │
└────────────────────────────────┘
```

```html
<section class="relative overflow-hidden bg-surface-2 pt-28 pb-20 md:pt-36 md:pb-28">
  <div class="mx-auto max-w-3xl px-6 text-center">
    <p class="mb-5 text-sm font-medium tracking-wider text-accent-deep">
      中小企業の業務改善
    </p>
    <h1 class="font-serif text-4xl leading-tight text-ink md:text-6xl"
        style="text-wrap: balance">
      何から手をつけるべきか、<br class="hidden sm:block">無料で診断します
    </h1>
    <p class="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
      現場の非効率を、外からの視点で言語化する。3分の入力から始められます。
    </p>

    <div class="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <a href="#diagnosis"
         class="inline-flex min-h-[52px] w-full items-center justify-center rounded-lg
                bg-accent-deep px-8 font-medium text-white transition-colors duration-200
                hover:bg-accent-deep/90 focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-accent-deep focus-visible:ring-offset-2 sm:w-auto">
        無料診断を申し込む
      </a>
      <a href="#flow"
         class="inline-flex min-h-[52px] items-center text-muted underline
                underline-offset-4 hover:text-ink">
        支援の流れを見る
      </a>
    </div>
    <p class="mt-4 text-sm text-muted">所要3分・費用はかかりません</p>
  </div>
</section>
```

**注意点：**
- `<h1>` に `<br>` を入れるなら `hidden sm:block` で**モバイルでは効かせない**（変な位置で折れる）
- CTA 下の一言（摩擦除去）を省かない
- `min-h-[100vh]` にしない → false floor になる

### 1-B. 左右2分割（テキスト＋ビジュアル）

**使いどころ：** 見せられる画面・成果物・図解がある。

```
┌──────────────────┬─────────────┐
│  見出し            │             │
│  サブコピー         │   ビジュアル   │
│  [CTA]            │             │
└──────────────────┴─────────────┘
        7 : 5 くらいの比率
```

```html
<section class="bg-surface-2 py-20 md:py-28">
  <div class="mx-auto grid max-w-6xl items-center gap-12 px-6
              md:grid-cols-12 md:gap-16">
    <div class="md:col-span-7">
      <h1 class="font-serif text-4xl leading-tight text-ink md:text-5xl"
          style="text-wrap: balance">…</h1>
      <p class="mt-6 text-lg leading-relaxed text-muted">…</p>
      <a href="#" class="mt-10 inline-flex …">無料診断を申し込む</a>
    </div>
    <div class="md:col-span-5">
      <img src="/images/report.webp" width="720" height="540"
           alt="診断レポートのサンプル"
           fetchpriority="high"
           class="w-full rounded-xl border border-line shadow-lg">
    </div>
  </div>
</section>
```

**注意点：**
- モバイルでは縦積み。**画像を上にしない**（テキストが fold から押し出される）
  → `grid` の DOM 順をテキスト先にしておけば自然にそうなる
- 画像は `width`/`height` 必須、`fetchpriority="high"`、`loading="lazy"` は付けない

### 1-C. 背景メディア＋オーバーレイ

**使いどころ：** 世界観で勝負する。**BtoBでは慎重に。** 抽象度が上がって伝わらなくなりやすい。

```html
<section class="relative isolate overflow-hidden">
  <img src="/images/hero.webp" width="2400" height="1200" alt=""
       class="absolute inset-0 -z-10 h-full w-full object-cover">
  <!-- オーバーレイ：コントラスト4.5:1 を確保するのが目的 -->
  <div class="absolute inset-0 -z-10 bg-ink/60"></div>
  <div class="mx-auto max-w-3xl px-6 py-32 text-center text-white">…</div>
</section>
```

**必須：** 背景画像は差し替わる。**オーバーレイなしで白文字を置かない。**

---

## 2. 課題への共感（Problems）

BtoBで最も効くセクション。「それ、うちだ」を作れれば以降が読まれる。

### 2-A. チェックリスト型 ★推奨

**なぜ強いか：** ユーザーが**心の中で自己診断する**。読むのではなく参加する。

```html
<ul class="grid gap-4 sm:grid-cols-2">
  <li class="flex gap-4 rounded-xl border border-line bg-surface p-6">
    <svg class="mt-0.5 h-5 w-5 shrink-0 text-accent-deep" aria-hidden="true" …>…</svg>
    <div>
      <p class="font-medium text-ink">FAXと電話で受発注をしている</p>
      <p class="mt-1.5 text-sm leading-relaxed text-muted">
        転記のたびにミスが起き、確認の電話が増える。
      </p>
    </div>
  </li>
  …
</ul>
```

- **4〜6項目。** 3つでは刺さらず、8つでは読まれない
- 各項目は「状態」を書く。解決策はここでは書かない
- 見出しは「こんな状態になっていませんか」「心当たりはありませんか」

### 2-B. 3カラムカード

```html
<div class="grid gap-6 md:grid-cols-3">
  <div class="rounded-xl bg-surface p-8 shadow-sm ring-1 ring-line">…</div>
</div>
```

汎用だが弱い。**チェックリスト型の方がBtoBでは効く。**

---

## 3. 解決策・特徴（Solution / Features）

### 3-A. 交互配置（zigzag）★推奨

**使いどころ：** 打ち手が2〜4個あり、それぞれ図解できる。

```
┌───────────┬───────────┐
│  テキスト    │  ビジュアル  │   ①
├───────────┼───────────┤
│  ビジュアル  │  テキスト    │   ②  ← 左右反転
├───────────┼───────────┤
│  テキスト    │  ビジュアル  │   ③
└───────────┴───────────┘
```

```html
<div class="space-y-20 md:space-y-28">
  <!-- 奇数：テキスト左 / 偶数：md:order-2 でテキストを右へ -->
  <div class="grid items-center gap-10 md:grid-cols-2 md:gap-16">
    <div>
      <h3 class="font-serif text-2xl text-ink md:text-3xl">仕組みの再設計</h3>
      <p class="mt-4 leading-relaxed text-muted">…</p>
    </div>
    <img src="…" width="800" height="600" alt="…" loading="lazy"
         class="w-full rounded-xl border border-line">
  </div>

  <div class="grid items-center gap-10 md:grid-cols-2 md:gap-16">
    <div class="md:order-2">…テキスト…</div>
    <img class="md:order-1 …" …>
  </div>
</div>
```

**注意点：** モバイルでは必ず「テキスト → 画像」の順に落とす。
`md:order-*` は `md` 以上だけに効かせる（上のコードはそうなっている）。

### 3-B. Bento グリッド

**使いどころ：** 要素の重要度に差があり、それを面積で表現したい。

```
┌───────────────┬───────┐
│               │       │
│    主要な訴求    │  補足  │
│               ├───────┤
│               │  補足  │
├───────┬───────┴───────┤
│  補足  │      補足       │
└───────┴───────────────┘
```

```html
<div class="grid gap-4 md:grid-cols-3 md:grid-rows-2">
  <div class="rounded-2xl bg-surface-2 p-8 md:col-span-2 md:row-span-2">…</div>
  <div class="rounded-2xl bg-surface-2 p-8">…</div>
  <div class="rounded-2xl bg-surface-2 p-8">…</div>
</div>
```

**注意点：** かっこいいが**中身の重要度が実際に違うときだけ**。
同格のものを無理にBentoにすると、意味のない大小差ができて逆に読みにくい。

### 3-C. 均等3カラム

同格の特徴が3つ（または6つ）。最も無難。

```html
<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
  <div>
    <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-surface-2">
      <svg class="h-5 w-5 text-accent-deep" aria-hidden="true">…</svg>
    </div>
    <h3 class="font-medium text-ink">見出し</h3>
    <p class="mt-2 text-sm leading-relaxed text-muted">説明</p>
  </div>
</div>
```

**注意点：** 4カラムは狭くなりすぎる。**3が上限**（`lg:grid-cols-3`）。

---

## 4. 流れ・プロセス（Flow）

**高単価な無形サービスでは必須。** 「申し込んだ後どうなるか」の不安が最大の障壁。

### 4-A. 横ステップ → 縦タイムライン ★推奨

デスクトップは横並び、モバイルは縦。**同じHTMLで組み替える。**

```html
<ol class="relative grid gap-8 md:grid-cols-4 md:gap-6">
  <!-- デスクトップのみ：ステップを繋ぐ横線 -->
  <div class="absolute left-0 right-0 top-5 hidden h-px bg-line md:block" aria-hidden="true"></div>

  <li class="relative">
    <div class="relative z-10 mb-4 flex h-10 w-10 items-center justify-center
                rounded-full bg-accent-deep text-sm font-medium text-white">1</div>
    <h3 class="font-medium text-ink">無料診断</h3>
    <p class="mt-2 text-sm leading-relaxed text-muted">3分の入力。費用はかかりません。</p>
  </li>
  …
</ol>
```

- **`<ol>` を使う。** 順序に意味があるのでセマンティクスも順序リスト
- 線は `aria-hidden="true"`（装飾）
- ステップは**3〜5個**。それ以上は複雑に見えて逆効果
- 各ステップに「所要期間」を添えると不安が減る

### 4-B. 縦タイムライン（全幅で縦）

ステップが多い、各ステップの説明が長いとき。

```html
<ol class="relative border-l border-line pl-8">
  <li class="relative pb-10">
    <span class="absolute -left-[37px] flex h-4 w-4 rounded-full bg-accent-deep
                 ring-4 ring-surface"></span>
    …
  </li>
</ol>
```

---

## 5. 料金（Pricing）

### 5-A. 3プラン横並び・中央強調 ★推奨

```html
<div class="grid gap-6 lg:grid-cols-3 lg:items-start">
  <!-- 標準プラン -->
  <div class="rounded-2xl border border-line bg-surface p-8">
    <h3 class="font-medium text-ink">相談パック</h3>
    <p class="mt-4">
      <span class="font-serif text-4xl text-ink">2万円</span>
      <span class="text-muted">/ 月〜</span>
    </p>
    <p class="mt-3 text-sm leading-relaxed text-muted">…</p>
    <ul class="mt-6 space-y-3 text-sm text-ink">
      <li class="flex gap-3"><svg aria-hidden="true" class="…">…</svg>月1回のミーティング</li>
    </ul>
    <a href="#" class="mt-8 block min-h-[48px] rounded-lg border border-accent-deep
                       text-center leading-[48px] text-accent-deep …">相談する</a>
  </div>

  <!-- 推しプラン：ring と scale で持ち上げる -->
  <div class="relative rounded-2xl bg-surface p-8 ring-2 ring-accent-deep
              lg:-mt-4 lg:pb-12">
    <span class="absolute -top-3 left-8 rounded-full bg-accent-deep px-3 py-1
                 text-xs font-medium text-white">おすすめ</span>
    …
    <a href="#" class="… bg-accent-deep text-white">申し込む</a>
  </div>

  <div class="rounded-2xl border border-line bg-surface p-8">…</div>
</div>
```

**設計の要点：**
- **推しは1つだけ、視覚的に明確に持ち上げる**（`ring-2` + `-mt-4`）
- 価格は**一番大きい数字**にする。単位（`/月`）は小さく添える
- 「〜」で下限を示すなら、**何で変動するかを必ず書く**
- カード内のCTAは、推しプランだけ塗りつぶし。他は輪郭線

**モバイル：** `lg:` 未満では縦積み。**推しプランを一番上に持ってこない。**
順序が変わると比較しづらい。`lg:-mt-4` はデスクトップのみ効かせる（上のコードはそう）。

### 5-B. 比較表

プランが4つ以上、または機能差が細かいとき。
モバイルでは横スクロールさせる。**表を縦積みに崩さない**（比較できなくなる）。

```html
<div class="-mx-6 overflow-x-auto px-6">
  <table class="w-full min-w-[640px] border-collapse text-sm">
    <thead>
      <tr><th scope="col" class="…">…</th></tr>
    </thead>
    …
  </table>
</div>
```

- `<th scope="col">` / `<th scope="row">` を正しく付ける
- 数値列に `tabular-nums`
- `-mx-6 px-6` で**画面端までスクロールさせる**（見切れが横スクロールの合図になる）

---

## 6. 実績・お客様の声

### 6-A. 引用カード（顔写真つき）★最強

```html
<figure class="rounded-2xl bg-surface-2 p-8">
  <blockquote class="text-lg leading-relaxed text-ink">
    「受発注の確認電話が、月に40件から5件になりました。」
  </blockquote>
  <figcaption class="mt-6 flex items-center gap-4">
    <img src="/images/customer.webp" width="48" height="48" alt=""
         loading="lazy" class="h-12 w-12 rounded-full object-cover">
    <div class="text-sm">
      <p class="font-medium text-ink">田中 太郎 さん</p>
      <p class="text-muted">株式会社◯◯ 業務部長</p>
    </div>
  </figcaption>
</figure>
```

- `<blockquote>` + `<figcaption>` でセマンティクスを正しく
- 顔写真は装飾扱いで `alt=""`（名前が隣にテキストである）
- **匿名（A社様）は効果が大きく落ちる。** 出せないなら数字で勝負する

### 6-B. ロゴウォール

```html
<ul class="flex flex-wrap items-center justify-center gap-x-12 gap-y-8
           opacity-70 grayscale">
  <li><img src="…" width="120" height="40" alt="株式会社◯◯" loading="lazy"></li>
</ul>
```

- **グレースケール＋透明度**で、ロゴの色バラつきを吸収する
- ロゴは**高さを揃える**（幅ではない）。視覚的な大きさが揃う
- 5社未満なら並べない。**少なさが露呈する**

---

## 7. FAQ

```html
<div class="mx-auto max-w-3xl divide-y divide-line">
  <details class="group py-5">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-4
                    font-medium text-ink
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-accent-deep focus-visible:ring-offset-4">
      <span>途中でやめることはできますか？</span>
      <svg class="h-5 w-5 shrink-0 text-muted transition-transform duration-200
                  group-open:rotate-45" aria-hidden="true" viewBox="0 0 20 20">
        <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </summary>
    <div class="pt-4 leading-relaxed text-muted">
      いつでも解約できます。前払いいただいた分の未消化期間は…
    </div>
  </details>
</div>
```

**なぜ `<details>` か：** JS不要、キーボード操作が標準で効く、
閉じていてもDOMに存在するので**検索エンジンに読まれる**。

- `list-none` で ▶ マーカーを消す（Safari は `summary::-webkit-details-marker` も必要な場合あり）
- アイコンは `group-open:rotate-45` で + → × に変える
- 開閉アニメーションは無理にやらない（`height:auto` は遷移できない）。
  どうしてもなら `grid-template-rows: 0fr → 1fr` を使う

---

## 8. CTA セクション

### 8-A. 全幅バンド ★推奨

```html
<section class="bg-accent-deep py-20 text-center md:py-24">
  <div class="mx-auto max-w-2xl px-6">
    <h2 class="font-serif text-3xl text-white md:text-4xl" style="text-wrap: balance">
      まず、現状を言葉にするところから
    </h2>
    <p class="mt-4 leading-relaxed text-white/80">
      3分の入力で、優先すべきボトルネックをお返しします。
    </p>
    <a href="#diagnosis"
       class="mt-10 inline-flex min-h-[52px] items-center justify-center rounded-lg
              bg-white px-8 font-medium text-accent-deep transition-colors duration-200
              hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-white focus-visible:ring-offset-2
              focus-visible:ring-offset-accent-deep">
      無料診断を申し込む
    </a>
    <p class="mt-4 text-sm text-white/70">費用はかかりません・営業のご連絡はしません</p>
  </div>
</section>
```

**注意点：** 濃い背景の上では `ring-offset-*` を**背景色に合わせる**。
デフォルトの白オフセットだと、フォーカスリングが浮いて見える。

---

## パターン選択の早見表

| 状況 | 選ぶ型 |
|---|---|
| 良い写真・図解がない | ヒーロー1-A ＋ チェックリスト2-A ＋ 3カラム3-C |
| 画面や成果物を見せられる | ヒーロー1-B ＋ zigzag 3-A |
| 打ち手が3つあり重要度が違う | Bento 3-B |
| 高単価・無形サービス | 流れ4-A を**必ず**入れる |
| 実績が出せる | 引用カード6-A を中盤に |
| 実績が出せない | 6は省く。数字と流れの透明性で代替する |

---

## やってはいけない組み合わせ

- **`100vh` ヒーロー ＋ 直後にセクション区切り** → false floor
- **同じ見た目のCTAを2つ並べる** → 選べない（Hickの法則）
- **全セクションが3カラムカード** → リズムがなく、全部同じ重みに見える
- **交互配置を6回以上** → 単調。3〜4回まで
- **料金表をモバイルで縦積みに崩す** → 比較できない。横スクロールにする
- **管理画面の情報密度をLPに持ち込む** → 詰まったLPは安く見える（`SCOPE.md` 参照）
