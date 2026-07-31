# 実装チェックリスト（Web共通）

コードを書いた後・レビューするときに上から当てる。
サイトでもアプリでも、**Webで作るなら共通**。

⚠️ 出典：[Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)（`command.md` 本文照合済・2026-07時点）
一部に補足と日本語向けの注記を加えている。

---

## アクセシビリティ

- [ ] アイコンのみのボタンに `aria-label` がある
- [ ] フォーム部品に `<label>` か `aria-label` がある
- [ ] 対話要素にキーボードハンドラがある
- [ ] アクションは `<button>`、遷移は `<a>`。`<div onClick>` がない
- [ ] `<img>` に `alt`（装飾なら `alt=""`）
- [ ] 装飾アイコンに `aria-hidden="true"`
- [ ] 非同期更新に `aria-live="polite"`
- [ ] ARIA より先にセマンティックHTMLを使っている
- [ ] 見出しが `<h1>`〜`<h6>` で階層的。スキップリンクがある
- [ ] 見出しアンカーに `scroll-margin-top`（固定ヘッダーに隠れない）

## フォーカス

- [ ] 対話要素に見えるフォーカスがある（`focus-visible:ring-*`）
- [ ] `outline-none` を書いた箇所に代替の見た目がある
- [ ] `:focus` ではなく `:focus-visible` を使っている
- [ ] 複合部品には `:focus-within`

## フォーム

- [ ] `autocomplete` と意味のある `name` がある
- [ ] `type` と `inputmode` が正しい（数字入力でテンキーが出るか）
- [ ] **`onPaste` + `preventDefault` でペーストを妨害していない**
- [ ] ラベルがクリック可能（`for` かラップ）
- [ ] メール・コード・ユーザー名は `spellcheck="false"`
- [ ] チェックボックス／ラジオはラベルと本体が単一のヒット領域
- [ ] 送信ボタンはリクエスト開始まで有効。開始後スピナー表示
- [ ] エラーは該当フィールドの隣にインライン表示。送信時に最初のエラーへフォーカス
- [ ] プレースホルダは `…` で終わり、記入例を示す
- [ ] 未保存のまま離脱しようとしたら警告

## アニメーション

- [ ] `prefers-reduced-motion` を尊重している
- [ ] `transform` / `opacity` のみアニメーションしている
- [ ] `transition: all` を使っていない（プロパティを列挙）
- [ ] `transform-origin` が意図通り
- [ ] ユーザー入力でアニメーションを中断できる

## テキスト・文字

- [ ] `…` を使っている（`...` ではない）
- [ ] 引用符が `“ ”`
- [ ] 数字と単位の間がノーブレークスペース（`10&nbsp;MB`）
- [ ] 数値の列に `font-variant-numeric: tabular-nums`
- [ ] 見出しに `text-wrap: balance`、本文に `text-pretty`
- [ ] **日本語で `word-break: break-all` を使っていない**（追記）
- [ ] **本文 16px 以上、行間 1.5 以上**（追記）

## 中身の可変性

- [ ] 長いテキストを `truncate` / `line-clamp-*` / `break-words` で処理している
- [ ] 省略表示する flex の子に `min-w-0` がある
- [ ] **空状態を用意している**（0件のときに壊れた見た目にしない）
- [ ] 短い入力・普通の入力・極端に長い入力の3つで確認した

## 画像

- [ ] `<img>` に `width` と `height` を明示（CLS防止）
- [ ] ファーストビュー外の画像に `loading="lazy"`
- [ ] 重要な画像に `fetchpriority="high"`

## パフォーマンス

- [ ] 50件を超えるリストを仮想化している
- [ ] レンダー中にレイアウト値を読んでいない
- [ ] DOM の読み書きをまとめている
- [ ] 外部ドメインに `<link rel="preconnect">`
- [ ] 重要フォントに `<link rel="preload" as="font">` ＋ `font-display: swap`

## ナビゲーションと状態

- [ ] **URL が状態を反映している**（フィルタ・タブ・ページ番号・パネル開閉）
- [ ] 遷移に `<a>` / `<Link>` を使っている（中クリックで新規タブが開く）
- [ ] 状態を持つUIにディープリンクできる
- [ ] 破壊的操作に確認、または取り消し猶予がある

## タッチと操作

- [ ] `touch-action: manipulation`（ダブルタップズームの遅延を消す）
- [ ] `-webkit-tap-highlight-color` を意図的に設定
- [ ] モーダル／ドロワーに `overscroll-behavior: contain`
- [ ] ドラッグ中にテキスト選択を無効化
- [ ] `autoFocus` は控えめに（デスクトップの主要入力1つのみ）

## レイアウト

- [ ] 全画面レイアウトで `env(safe-area-inset-*)` を考慮
- [ ] 意図しないスクロールバーが出ていない
- [ ] JS計測ではなく Flex / Grid で組んでいる

## ダーク／テーマ

- [ ] `<html>` に `color-scheme`
- [ ] `<meta name="theme-color">` が背景色と一致
- [ ] ネイティブ `<select>` に `background-color` と `color` を明示

## 国際化

- [ ] 日時は `Intl.DateTimeFormat`
- [ ] 数値・通貨は `Intl.NumberFormat`
- [ ] 言語判定は HTTPヘッダ／API。**IPアドレスで判定しない**
- [ ] ブランド名・識別子に `translate="no"`

## 文言

- [ ] 能動態。二人称で書く
- [ ] エラーメッセージに**直し方と次の一手**が含まれる
- [ ] ボタンのラベルが具体的（「送信」より「無料診断を申し込む」）

---

## 即座に指摘すべきアンチパターン

見つけたら理由を問わず報告する。

- `user-scalable=no` / `maximum-scale=1`
- `onPaste` + `preventDefault`
- `transition: all`
- `focus-visible` の代替なしの `outline-none`
- `<a>` を使わない `onClick` 遷移
- クリックハンドラ付きの `<div>` / `<span>`
- `width` / `height` のない画像
- 仮想化のない大量リスト
- ラベルのないフォーム入力
- `aria-label` のないアイコンボタン
- 日時・数値のハードコード整形
- 理由のない `autoFocus`
- **14px 未満の本文**（追記）
- **日本語本文の `line-height` が 1.5 未満**（追記）
