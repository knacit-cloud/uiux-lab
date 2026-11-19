---
version: alpha
name: "<ブランド名>"
description: "<1行で：誰のための何か>"
colors:
  primary: "#1F3A5F"        # 主要ボタン・リンク。1色だけ
  primary-hover: "#16304F"
  on-primary: "#FFFFFF"     # primary の上の文字
  neutral-0: "#FFFFFF"      # 背景
  neutral-50: "#F6F7F9"     # 面（カード・セクション背景）
  neutral-200: "#DDE1E6"    # 線
  neutral-600: "#5A6472"    # 補助テキスト（4.5:1 を確認すること）
  neutral-900: "#1A1D21"    # 本文
  danger: "#B42318"
  success: "#067647"
typography:
  display:
    fontFamily: "Noto Sans JP"
    fontSize: 2.5rem
    fontWeight: 700
    lineHeight: 1.3
  heading:
    fontFamily: "Noto Sans JP"
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans JP"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.7
  caption:
    fontFamily: "Noto Sans JP"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: 4px
  md: 8px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  section: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 12px
    height: 48px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  card:
    backgroundColor: "{colors.neutral-0}"
    rounded: "{rounded.md}"
    padding: 24px
---

<!--
使い方：
1. このファイルをプロダクトのリポジトリ直下に DESIGN.md としてコピー
2. 上の値と下の文章を埋める（値はすべて仮。必ず差し替える）
3. npx @google/design.md lint DESIGN.md
4. CLAUDE.md / AGENTS.md に「UIを作る前に DESIGN.md を読む。ここにない値を発明しない」と1行足す
手順の詳細：uiux-lab/4-brand/brand-definition.md
-->

## Overview

<性格を3語で。各語に「だから何をしない」を1つ>

- 誠実 — 誇張した数字を使わない
- 静か — 彩度の高い色を広い面積に使わない
- 精密 — 角丸を大きくしない

## Colors

- `primary` は操作できる要素だけに使う。装飾に使わない
- 本文は `neutral-900`、補助は `neutral-600`。それ以外のグレーを足さない

## Typography

- 書体は1つ。ウェイトは 400 / 700 のみ
- 本文 16px 未満にしない（`uiux-lab/0-core` の線）

## Layout

### サイト
- セクション間 `spacing.section`、コンテナ最大幅 1120px

### アプリ
- 余白は `spacing.md` 以下を基本に詰める。セクション余白は使わない

## Elevation & Depth

- 影は使わない。面の区別は `neutral-50` の背景と `neutral-200` の線で行う

## Shapes

- 角丸は `sm`（ボタン・入力）と `md`（カード）の2種類だけ

## Components

- 主要ボタンは1画面に1つ
- ホバーは背景色の変化のみ。拡大・影を足さない
- フォーカスは 2px の `primary` のリングを必ず出す

## Do's and Don'ts

- Do: 数字には出典か根拠を添える
- Don't: グラデーション背景
- Don't: 絵文字を見出しに使う
- Don't: このファイルにない色・角丸・影を発明する
