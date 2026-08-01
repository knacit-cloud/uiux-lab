/* ==========================================================================
   audit.js — ページ自己検査
   --------------------------------------------------------------------------
   どのページにも貼れる、依存なしの監査スクリプト。
   0-core/implementation-checklist.md と 1-web-site/launch-checklist.md の
   うち「機械で判定できる項目」を自動化したもの。

   なぜ作ったか（LESSONS.md L-008）:
     検査を手順書に書くと、いつか飛ばす。実際に自分で飛ばして
     ダークモードのコントラスト不足を見逃した。
     ページ自身に検査を埋め込めば、開くたびに自動で走る。

   使い方 A: 開発中のページに読み込む
     <script src="js/audit.js" defer></script>
     → コンソールに結果。?audit=panel を付けると画面にパネル表示

   使い方 B: 任意のサイトで DevTools のコンソールに貼る（読み取りのみ）
     fetch('http://localhost:4322/snippets/js/audit.js')
       .then(r => r.text()).then(eval).then(() => uiuxAudit({ panel: true }));

   使い方 C: プログラムから
     const result = uiuxAudit();     // { summary, findings }

   ⚠️ 自動検査で拾えるのは全体の一部。
      キーボードでの通し操作・読み上げ・文章の質は人間が見るしかない。
   ========================================================================== */

(function (global) {
  'use strict';

  /* ======================================================================
     ユーティリティ
     ====================================================================== */

  function toRgb(css) {
    if (!css) return null;
    var m = css.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    if (p.length < 3 || p.some(isNaN)) return null;
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }

  function luminance(c) {
    var a = [c.r, c.g, c.b].map(function (v) {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function contrast(fg, bg) {
    var l1 = luminance(fg), l2 = luminance(bg);
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  // 半透明の前景を背景に合成する
  function blend(fg, bg) {
    if (fg.a >= 1) return fg;
    return {
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1
    };
  }

  // background-image に含まれる rgb() を全部抜き出す（グラデーションの色停止点）
  function gradientStops(bgImage) {
    if (!bgImage || bgImage === 'none') return null;
    if (/url\(/.test(bgImage)) return 'unknown';   // 画像は測れない
    var m = bgImage.match(/rgba?\([^)]+\)/g);
    if (!m) return 'unknown';
    var stops = m.map(toRgb).filter(function (c) { return c && c.a > 0.5; });
    return stops.length ? stops : 'unknown';
  }

  /* 実際に見えている背景を祖先を辿って求める。
     戻り値: { colors: [色…], unknown: bool }
       ・単色なら colors は1つ
       ・グラデーションなら色停止点すべて（最悪ケースで判定するため）
       ・画像背景は unknown（測定不能として報告する）

     ⚠️ background-color だけを見ると、暗いグラデーションの上の
        明るい文字を「背景も明るい」と誤判定する（knacit.com で実際に発生）。 */
  function effectiveBg(el, depth) {
    depth = depth || 0;
    var node = el;
    while (node && node.nodeType === 1 && depth < 30) {
      var s = getComputedStyle(node);

      var stops = gradientStops(s.backgroundImage);
      if (stops === 'unknown') return { colors: [], unknown: true };
      if (stops) return { colors: stops, unknown: false };

      var c = toRgb(s.backgroundColor);
      if (c && c.a > 0) {
        if (c.a >= 1) return { colors: [c], unknown: false };
        var under = effectiveBg(node.parentElement, depth + 1);
        if (under.unknown) return under;
        return { colors: under.colors.map(function (u) { return blend(c, u); }), unknown: false };
      }
      node = node.parentElement;
      depth++;
    }
    return { colors: [{ r: 255, g: 255, b: 255, a: 1 }], unknown: false };
  }

  function isVisible(el) {
    if (!el || el.nodeType !== 1) return false;
    var s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function selectorOf(el) {
    if (!el || el.nodeType !== 1) return '?';
    var s = el.tagName.toLowerCase();
    if (el.id) return s + '#' + el.id;
    var cls = (el.className && el.className.toString ? el.className.toString() : '')
      .trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
    if (cls) s += '.' + cls;
    var txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24);
    return txt ? s + ' 〈' + txt + '〉' : s;
  }

  function hasJapanese(str) {
    return /[぀-ヿ一-鿿]/.test(str || '');
  }

  function hex(c) {
    return '#' + [c.r, c.g, c.b].map(function (v) {
      return ('0' + Math.round(v).toString(16)).slice(-2);
    }).join('').toUpperCase();
  }

  /* ======================================================================
     検査項目
     各関数は findings 配列に push する
     severity: 'error'（基準違反）/ 'warn'（要確認）/ 'info'（参考）
     ====================================================================== */

  var RULES = [];
  function rule(id, title, fn) { RULES.push({ id: id, title: title, run: fn }); }

  /* --- 横スクロール（WCAG 1.4.10 リフロー）------------------------------ */
  rule('reflow', '横スクロールが出ていないか', function (add) {
    var de = document.documentElement;
    if (de.scrollWidth <= de.clientWidth + 1) return;

    var offenders = [];
    var all = document.querySelectorAll('body *');
    for (var i = 0; i < all.length && offenders.length < 10; i++) {
      if (!isVisible(all[i])) continue;
      var r = all[i].getBoundingClientRect();
      if (r.right > de.clientWidth + 1 || r.left < -1) {
        // 親も同様にはみ出しているなら親だけ報告する
        var p = all[i].parentElement;
        if (p && p.getBoundingClientRect().right > de.clientWidth + 1) continue;
        offenders.push(selectorOf(all[i]) + ' → right:' + Math.round(r.right) + 'px');
      }
    }
    add('error', '横スクロールが発生している（幅 ' + de.clientWidth + 'px、内容 ' +
      de.scrollWidth + 'px）', offenders);
  });

  /* --- コントラスト（WCAG 1.4.3）---------------------------------------- */
  rule('contrast', 'テキストのコントラスト比', function (add) {
    var els = document.querySelectorAll(
      'p,li,td,th,dt,dd,h1,h2,h3,h4,h5,h6,a,button,label,span,figcaption,blockquote,small,strong,em');
    var seen = 0, bad = [], unmeasurable = [];

    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!isVisible(el)) continue;
      // 直接の子テキストを持つ要素だけ見る（入れ子の二重計上を避ける）
      var own = '';
      for (var n = 0; n < el.childNodes.length; n++) {
        if (el.childNodes[n].nodeType === 3) own += el.childNodes[n].nodeValue;
      }
      if (!own.trim()) continue;
      // 装飾は対象外：aria-hidden の中、および記号だけのテキスト（区切りの「·」等）
      if (el.closest('[aria-hidden="true"]')) continue;
      if (!/[\wぁ-んァ-ヶ一-鿿]/.test(own)) continue;
      seen++;

      var s = getComputedStyle(el);
      var fgRaw = toRgb(s.color);
      if (!fgRaw) continue;

      var size = parseFloat(s.fontSize);
      var weight = parseInt(s.fontWeight, 10) || 400;
      // 大きい文字 = 24px以上、または 18.66px以上かつ太字
      var large = size >= 24 || (size >= 18.66 && weight >= 700);
      var need = large ? 3 : 4.5;

      var bgInfo = effectiveBg(el);
      if (bgInfo.unknown) { unmeasurable.push(selectorOf(el)); continue; }

      // グラデーションは全停止点で測り、最悪値を採用する
      var ratio = Infinity, fg = null, bg = null;
      bgInfo.colors.forEach(function (candidate) {
        var f = blend(fgRaw, candidate);
        var r2 = contrast(f, candidate);
        if (r2 < ratio) { ratio = r2; fg = f; bg = candidate; }
      });
      if (!fg) continue;

      if (ratio < need) {
        bad.push({ combo: hex(fg) + ' on ' + hex(bg), ratio: ratio, need: need,
                   size: Math.round(size), sel: selectorOf(el) });
      }
    }
    if (unmeasurable.length) {
      add('info', unmeasurable.length + ' 件は背景が画像のため自動で測れない（目視で確認すること）',
        unmeasurable.slice(0, 8));
    }
    if (!bad.length) return;

    // 個別に59件並べても直せない。「どの色の組み合わせが原因か」に集約する。
    // 色は数個しかないので、直す対象は必ず少数に収束する。
    var groups = {};
    bad.forEach(function (b) {
      var g = groups[b.combo] || (groups[b.combo] = { n: 0, ratio: b.ratio, need: b.need,
                                                      sizes: {}, sample: b.sel });
      g.n++;
      g.ratio = Math.min(g.ratio, b.ratio);
      g.sizes[b.size + 'px'] = true;
    });

    var lines = Object.keys(groups).sort(function (a, b) {
      return groups[b].n - groups[a].n;
    }).map(function (k) {
      var g = groups[k];
      return k + ' — ' + g.ratio.toFixed(2) + ':1（要 ' + g.need + ':1） × ' + g.n + '件 ' +
             '[' + Object.keys(g.sizes).join(', ') + '] 例: ' + g.sample;
    });

    add('error', bad.length + ' 件が基準未満（' + seen + ' 件中）／原因は ' +
        lines.length + ' 通りの色の組み合わせ', lines);
  });

  /* --- タップ領域（WCAG 2.5.8）------------------------------------------ */
  rule('target-size', 'タップ／クリック領域の大きさ', function (add) {
    var els = document.querySelectorAll(
      'a[href],button,input:not([type=hidden]),select,textarea,[role=button],[tabindex]:not([tabindex="-1"])');
    var small = [], tiny = [];

    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!isVisible(el)) continue;
      var s = getComputedStyle(el);
      // 文章中のインラインリンクは例外（2.5.8 Inline）。
      // 「文章中」の判定は祖先タグではなく、前後に地の文があるかで見る。
      // （<label> の中のリンクなども拾えるようにするため）
      if (s.display === 'inline' || s.display === 'inline-block' || s.display === 'inline-flex') {
        var parent = el.parentElement;
        var siblingText = parent ? (parent.textContent || '').replace(el.textContent || '', '').trim() : '';
        if (siblingText.length > 0) continue;
      }

      var r = el.getBoundingClientRect();
      var w = Math.round(r.width), h = Math.round(r.height);
      if (w < 24 || h < 24) tiny.push(selectorOf(el) + ' — ' + w + '×' + h + 'px');
      else if (w < 44 || h < 44) small.push(selectorOf(el) + ' — ' + w + '×' + h + 'px');
    }
    if (tiny.length)  add('error', tiny.length + ' 件が 24×24px 未満（WCAG 2.5.8 違反）', tiny.slice(0, 10));
    if (small.length) add('warn',  small.length + ' 件が 44×44px 未満（モバイル主体なら要拡大）', small.slice(0, 10));
  });

  /* --- 画像 --------------------------------------------------------------- */
  rule('images', '画像の属性', function (add) {
    var imgs = document.querySelectorAll('img');
    var noDim = [], noAlt = [], lazyHero = [];
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) noDim.push(selectorOf(img));
      if (!img.hasAttribute('alt')) noAlt.push(selectorOf(img));
      // ファーストビュー内なのに lazy
      var r = img.getBoundingClientRect();
      if (img.loading === 'lazy' && r.top < window.innerHeight && r.bottom > 0) {
        lazyHero.push(selectorOf(img));
      }
    }
    if (noDim.length) add('error', noDim.length + ' 件に width/height がない（CLSの原因）', noDim.slice(0, 10));
    if (noAlt.length) add('error', noAlt.length + ' 件に alt がない（装飾なら alt="" を書く）', noAlt.slice(0, 10));
    if (lazyHero.length) add('warn', lazyHero.length + ' 件がファーストビュー内なのに loading="lazy"（LCP悪化）', lazyHero);
  });

  /* --- アクセシブルな名前 ------------------------------------------------- */
  rule('names', 'ボタン・リンクの名前', function (add) {
    var els = document.querySelectorAll('button,a[href],[role=button]');
    var bad = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!isVisible(el)) continue;
      var name = (el.textContent || '').trim() ||
                 el.getAttribute('aria-label') ||
                 (el.getAttribute('aria-labelledby') &&
                   (document.getElementById(el.getAttribute('aria-labelledby')) || {}).textContent) ||
                 el.getAttribute('title') ||
                 (el.querySelector('img') && el.querySelector('img').getAttribute('alt'));
      if (!name || !name.trim()) bad.push(selectorOf(el));
    }
    if (bad.length) add('error', bad.length + ' 件に名前がない（アイコンのみなら aria-label が必須）', bad.slice(0, 10));

    // 曖昧なリンクテキスト
    var vague = [];
    var links = document.querySelectorAll('a[href]');
    var NG = ['こちら', 'ここ', '詳細', '詳しく', 'もっと見る', 'click here', 'here', 'more', 'read more', 'link'];
    for (var j = 0; j < links.length; j++) {
      var t = (links[j].textContent || '').trim().toLowerCase();
      if (t && NG.indexOf(t) !== -1) vague.push(selectorOf(links[j]));
    }
    if (vague.length) add('warn', vague.length + ' 件のリンクテキストが曖昧（「料金プランを見る」のように具体的に）', vague.slice(0, 10));
  });

  /* --- フォーム ----------------------------------------------------------- */
  rule('forms', 'フォーム部品', function (add) {
    var fields = document.querySelectorAll(
      'input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea');
    var noLabel = [], noAuto = [], smallFont = [], blockedPaste = [];

    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (!isVisible(f)) continue;
      var labelled = (f.id && document.querySelector('label[for="' + CSS.escape(f.id) + '"]')) ||
                     f.closest('label') || f.getAttribute('aria-label') || f.getAttribute('aria-labelledby');
      if (!labelled) noLabel.push(selectorOf(f));

      if (['text', 'email', 'tel', 'url', 'password'].indexOf(f.type) !== -1 &&
          !f.hasAttribute('autocomplete')) noAuto.push(selectorOf(f));

      // iOS の自動ズームはテキスト入力系だけで起きる。
      // チェックボックス・ラジオ・レンジは対象外。
      var TEXTY = ['text', 'email', 'tel', 'url', 'password', 'search', 'number', 'date', 'textarea'];
      var kind = f.tagName === 'TEXTAREA' ? 'textarea' : f.type;
      if (TEXTY.indexOf(kind) !== -1) {
        var fs = parseFloat(getComputedStyle(f).fontSize);
        if (fs && fs < 16) smallFont.push(selectorOf(f) + ' — ' + fs + 'px');
      }
    }
    if (noLabel.length)   add('error', noLabel.length + ' 件にラベルがない', noLabel.slice(0, 10));
    if (smallFont.length) add('error', smallFont.length + ' 件が 16px 未満（iOSで自動ズームする）', smallFont.slice(0, 10));
    if (noAuto.length)    add('warn',  noAuto.length + ' 件に autocomplete がない（入力の手間が増える）', noAuto.slice(0, 10));

    // novalidate なしで required だけだと、ブラウザ標準の吹き出しになる
    var forms = document.querySelectorAll('form');
    for (var k = 0; k < forms.length; k++) {
      if (!forms[k].querySelector('[type=submit]')) {
        add('warn', 'form に submit ボタンがない（Enterキーで送信できない）', [selectorOf(forms[k])]);
      }
    }
  });

  /* --- 見出し階層 --------------------------------------------------------- */
  rule('headings', '見出しの階層', function (add) {
    var hs = [].filter.call(document.querySelectorAll('h1,h2,h3,h4,h5,h6'), isVisible);
    if (!hs.length) { add('warn', '見出しが1つもない', []); return; }

    var h1 = hs.filter(function (h) { return h.tagName === 'H1'; });
    if (h1.length === 0) add('error', '<h1> がない', []);
    if (h1.length > 1) add('warn', '<h1> が ' + h1.length + ' 個ある（通常は1つ）',
      h1.map(selectorOf));

    var skips = [], prev = 0;
    for (var i = 0; i < hs.length; i++) {
      var lv = parseInt(hs[i].tagName[1], 10);
      if (prev && lv > prev + 1) skips.push('h' + prev + ' → h' + lv + '：' + selectorOf(hs[i]));
      prev = lv;
    }
    if (skips.length) add('warn', '見出しレベルが飛んでいる（読み上げで構造が壊れる）', skips.slice(0, 10));
  });

  /* --- viewport / lang ---------------------------------------------------- */
  rule('document', 'ドキュメントの設定', function (add) {
    var vp = document.querySelector('meta[name=viewport]');
    var c = vp ? vp.getAttribute('content') || '' : '';
    if (!vp) add('error', 'meta viewport がない', []);
    if (/user-scalable\s*=\s*(no|0)/i.test(c) || /maximum-scale\s*=\s*1(\.0)?\b/.test(c)) {
      add('error', 'viewport が拡大を禁止している（WCAG違反）', [c]);
    }
    if (!document.documentElement.getAttribute('lang')) add('error', '<html lang> がない', []);
    if (!document.querySelector('title') || !document.title.trim()) add('error', '<title> がない', []);
    if (!document.querySelector('meta[name=description]')) add('warn', 'meta description がない', []);
    if (!document.querySelector('a[href^="#"]')) { /* skip link 判定は緩く */ }
  });

  /* --- 日本語の組版 ------------------------------------------------------- */
  rule('japanese', '日本語の組版', function (add) {
    var els = document.querySelectorAll('p,li,dd,td,blockquote');
    var tight = [], breakAll = [], small = [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!isVisible(el) || !hasJapanese(el.textContent)) continue;
      var s = getComputedStyle(el);
      var fs = parseFloat(s.fontSize);
      var lh = parseFloat(s.lineHeight);
      // 対象を絞る:
      //   ・24px以上は見出し・数値の表示用。行間を詰めるのが正しい
      //   ・1行で収まるテキストに行間は関係ない（2行以上折り返すものだけ見る）
      var lines = lh ? Math.round(el.getBoundingClientRect().height / lh) : 1;
      if (fs && fs < 24 && lh && lines >= 2 && lh / fs < 1.5) {
        tight.push(selectorOf(el) + ' — ' + (lh / fs).toFixed(2) + '（' + lines + '行）');
      }
      if (s.wordBreak === 'break-all') breakAll.push(selectorOf(el));
      if (fs && fs < 16 && el.textContent.trim().length > 30) small.push(selectorOf(el) + ' — ' + fs + 'px');
    }
    if (tight.length)    add('warn', tight.length + ' 件の行間が 1.5 未満（日本語は 1.7 前後が目安）', tight.slice(0, 8));
    if (breakAll.length) add('error', breakAll.length + ' 件が word-break:break-all（日本語が不正に折れる）', breakAll.slice(0, 8));
    if (small.length)    add('warn', small.length + ' 件の本文が 16px 未満', small.slice(0, 8));
  });

  /* --- モーション --------------------------------------------------------- */
  rule('motion', 'アニメーション', function (add) {
    var all = document.querySelectorAll('body *');
    var transAll = [];
    for (var i = 0; i < all.length && transAll.length < 10; i++) {
      if (!isVisible(all[i])) continue;
      var cs = getComputedStyle(all[i]);
      // transition-property の初期値は 'all' なので、それだけでは判定できない。
      // duration が 0 でないものだけが「実際に transition: all を書いている」要素。
      var dur = (cs.transitionDuration || '').split(',').some(function (d) {
        return parseFloat(d) > 0;
      });
      if (dur && cs.transitionProperty === 'all') transAll.push(selectorOf(all[i]));
    }
    if (transAll.length) add('warn', 'transition: all を使っている要素がある（プロパティを列挙する）', transAll);

    // reduced-motion 対応があるか（スタイルシートを走査。CORSで読めない場合は skip）
    var found = false, unreadable = 0;
    for (var s = 0; s < document.styleSheets.length; s++) {
      try {
        var rules = document.styleSheets[s].cssRules;
        for (var r = 0; r < rules.length; r++) {
          if (rules[r].conditionText && /prefers-reduced-motion/.test(rules[r].conditionText)) found = true;
        }
      } catch (e) { unreadable++; }
    }
    var animated = document.querySelectorAll('[class*=anim],[data-reveal]').length;
    if (!found && !unreadable && animated) {
      add('warn', 'prefers-reduced-motion への対応が見つからない', []);
    }
  });

  /* --- フォーカス表示 ----------------------------------------------------- */
  rule('focus', 'フォーカスの見た目', function (add, opts) {
    if (opts && opts.focus === false) return;
    var els = [].filter.call(
      document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea'), isVisible)
      .slice(0, 40);   // 多いと重いので上限
    var active = document.activeElement;
    var scrollY = window.scrollY, scrollX = window.scrollX;
    var bad = [];

    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var before = getComputedStyle(el);
      var b = { o: before.outlineWidth, s: before.boxShadow, bc: before.borderColor, bg: before.backgroundColor };
      try { el.focus({ preventScroll: true }); } catch (e) { continue; }
      var after = getComputedStyle(el);
      var changed = after.outlineWidth !== b.o || after.boxShadow !== b.s ||
                    after.borderColor !== b.bc || after.backgroundColor !== b.bg;
      // outline がそもそも 0 で、他も変わらない = 見えない
      if (!changed && parseFloat(after.outlineWidth) === 0) bad.push(selectorOf(el));
    }
    if (active && active.focus) { try { active.focus({ preventScroll: true }); } catch (e) {} }
    window.scrollTo(scrollX, scrollY);

    if (bad.length) {
      add('error', bad.length + ' 件でフォーカス時の見た目が変わらない（キーボード操作で位置が分からない）',
        bad.slice(0, 10));
    }
  });

  /* ======================================================================
     実行
     ====================================================================== */

  function uiuxAudit(opts) {
    opts = opts || {};
    var findings = [];

    RULES.forEach(function (r) {
      var add = function (severity, message, detail) {
        findings.push({ rule: r.id, title: r.title, severity: severity, message: message, detail: detail || [] });
      };
      try { r.run(add, opts); }
      catch (e) { findings.push({ rule: r.id, title: r.title, severity: 'info',
                                  message: '検査に失敗: ' + e.message, detail: [] }); }
    });

    var summary = {
      url: location.href,
      viewport: document.documentElement.clientWidth + '×' + document.documentElement.clientHeight,
      colorScheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      error: findings.filter(function (f) { return f.severity === 'error'; }).length,
      warn:  findings.filter(function (f) { return f.severity === 'warn'; }).length,
      info:  findings.filter(function (f) { return f.severity === 'info'; }).length
    };

    if (opts.silent !== true) print(summary, findings);
    if (opts.panel) renderPanel(summary, findings);
    return { summary: summary, findings: findings };
  }

  function print(summary, findings) {
    var tag = summary.error ? '%c✕ ' : (summary.warn ? '%c△ ' : '%c✓ ');
    var css = summary.error ? 'color:#B3261E;font-weight:bold'
            : summary.warn  ? 'color:#9A6B24;font-weight:bold'
            : 'color:#1B7A3D;font-weight:bold';
    console.group(tag + 'uiux-lab audit — error:' + summary.error + ' warn:' + summary.warn +
      ' / ' + summary.viewport + ' ' + summary.colorScheme, css);
    findings.forEach(function (f) {
      var fn = f.severity === 'error' ? console.error : f.severity === 'warn' ? console.warn : console.info;
      fn('[' + f.rule + '] ' + f.message);
      if (f.detail && f.detail.length) console.log(f.detail.join('\n'));
    });
    if (!findings.length) console.log('自動検査では問題なし。キーボード通し操作と文章の質は人間が見ること。');
    console.groupEnd();
  }

  function renderPanel(summary, findings) {
    var old = document.getElementById('uiux-audit-panel');
    if (old) old.remove();

    var wrap = document.createElement('div');
    wrap.id = 'uiux-audit-panel';
    wrap.style.cssText = [
      'position:fixed', 'right:16px', 'bottom:16px', 'z-index:2147483647',
      'width:min(420px,calc(100vw - 32px))', 'max-height:70vh', 'overflow:auto',
      'background:#fff', 'color:#1a1a1a', 'border:1px solid #ccc', 'border-radius:10px',
      'box-shadow:0 10px 40px rgba(0,0,0,.2)', 'font:13px/1.6 system-ui,sans-serif',
      'padding:14px 16px'
    ].join(';');

    var head = summary.error ? '✕ error ' + summary.error : (summary.warn ? '△ warn ' + summary.warn : '✓ 問題なし');
    var html = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<strong>uiux-lab audit — ' + head + '</strong>' +
      '<button id="uiux-audit-close" aria-label="閉じる" style="border:0;background:#eee;' +
      'border-radius:6px;width:28px;height:28px;cursor:pointer;font:inherit">×</button></div>' +
      '<div style="color:#666;margin:4px 0 10px">' + summary.viewport + ' / ' + summary.colorScheme + '</div>';

    if (!findings.length) {
      html += '<p style="margin:0;color:#1B7A3D">自動検査では問題なし。<br>' +
        'キーボード通し操作・読み上げ・文章の質は人間が見ること。</p>';
    } else {
      findings.forEach(function (f) {
        var color = f.severity === 'error' ? '#B3261E' : f.severity === 'warn' ? '#9A6B24' : '#666';
        html += '<div style="border-top:1px solid #eee;padding:8px 0">' +
          '<div style="color:' + color + ';font-weight:600">[' + f.rule + '] ' + f.message + '</div>';
        if (f.detail && f.detail.length) {
          html += '<ul style="margin:6px 0 0;padding-left:1.1em;color:#555">' +
            f.detail.map(function (d) {
              return '<li style="word-break:break-word">' +
                String(d).replace(/[<>&]/g, function (m) {
                  return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m];
                }) + '</li>';
            }).join('') + '</ul>';
        }
        html += '</div>';
      });
    }
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    document.getElementById('uiux-audit-close').addEventListener('click', function () { wrap.remove(); });
  }

  global.uiuxAudit = uiuxAudit;

  /* --- 自動実行 -----------------------------------------------------------
     ?audit=panel を付けるとパネル表示、?audit=0 で自動実行を止める
     ------------------------------------------------------------------------ */
  function auto() {
    var q = new URLSearchParams(location.search).get('audit');
    if (q === '0') return;
    uiuxAudit({ panel: q === 'panel' });
  }

  if (document.readyState === 'complete') setTimeout(auto, 0);
  else window.addEventListener('load', function () { setTimeout(auto, 300); });

})(window);
