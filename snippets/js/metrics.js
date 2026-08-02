/* ==========================================================================
   metrics.js — ページの設計値を数値で抽出する
   --------------------------------------------------------------------------
   audit.js が「壊れていないか」を見るのに対し、
   これは「どう作られているか」を測る。

   なぜ必要か:
     資料に書いた「セクション余白は py-20 md:py-28」等は、
     私（AI）の推測であって根拠がない（references/sources.md に自己申告済み）。
     実例を測って分布を出せば、その数値が現代の水準に対して
     広いのか狭いのかを、感覚ではなく数値で答えられる。

   ⚠️ 重要な注意
     分布は「よくあるもの」を示すだけで「良いもの」は示さない。
     中央値に合わせにいくと平均的なものが出来上がる（LESSONS L-007）。
     正しい使い方は「自分がどこにいるか把握し、
     どの軸で意図的に外れるかを決める」こと。

   使い方:
     uiuxMetrics()            → オブジェクトを返す
     uiuxMetrics({json:true}) → JSON文字列（複数サイトの集計用）

   測るのは「形」だけ。文章の良さ・説得力・独自性は測れない。

   ⚠️ 実測で判明した限界（references/metrics/2026-08-01-baseline.md）
     1. セクション余白を padding でしか測っていない。
        margin や内側ラッパーで余白を作るサイトは測定不可になる（stripe / kaminashi）
     2. **測定前に一度スクロールすること。**
        出現アニメ（opacity:0）の要素が「不可視」として除外される。
        自作ページで 6→9 のセクション数の差が出て発覚した
     3. h1 のサイズは DOM 構造に依存する（ロゴを h1 にしている等）
     4. 1画面の定義はビューポート依存。比較するなら幅を固定する（1280×900 等）
     5. **HTTPS ページから HTTP localhost の script は読めない**（混在コンテンツ）。
        他サイトで使うときはこのファイルの中身を直接コンソールに貼る

     6. **スクロールは必ず behavior:'instant' で行う。**
        対象ページが `scroll-behavior: smooth` を持っていると、
        scrollTo(0,0) がアニメーションし、**戻り切る前に測定してしまう**。
        実際に fold 内のCTAを 1件 → 0件 と誤測定した（LESSONS L-014）

   測定前の必須手順:
     await (async()=>{
       const H=innerHeight,B=document.body.scrollHeight;
       for(let y=0;y<B;y+=H*0.8){
         scrollTo({top:y,behavior:'instant'});
         await new Promise(r=>setTimeout(r,110));
       }
       scrollTo({top:0,behavior:'instant'});
       await new Promise(r=>setTimeout(r,500));
       if (scrollY !== 0) throw new Error('スクロールが戻っていない。測定中止');
     })();
     uiuxMetrics();
   ========================================================================== */

(function (global) {
  'use strict';

  /* ---------- 小道具 ------------------------------------------------------ */

  function px(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }

  function visible(el) {
    if (!el || el.nodeType !== 1) return false;
    var s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function median(arr) {
    if (!arr.length) return null;
    var a = arr.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2);
  }

  // 最頻値（同率なら小さい方）
  function mode(arr) {
    if (!arr.length) return null;
    var c = {};
    arr.forEach(function (v) { c[v] = (c[v] || 0) + 1; });
    var best = null, n = -1;
    Object.keys(c).map(Number).sort(function (a, b) { return a - b; })
      .forEach(function (v) { if (c[v] > n) { n = c[v]; best = v; } });
    return best;
  }

  function toRgb(css) {
    var m = (css || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    if (p.length < 3) return null;
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }

  function hex(c) {
    return '#' + [c.r, c.g, c.b].map(function (v) {
      return ('0' + Math.round(v).toString(16)).slice(-2);
    }).join('').toUpperCase();
  }

  // 彩度（HSL の S）。ニュートラルかどうかの判定に使う
  function saturation(c) {
    var r = c.r / 255, g = c.g / 255, b = c.b / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx === mn) return 0;
    var l = (mx + mn) / 2;
    return l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn);
  }

  function isNeutral(c) { return saturation(c) < 0.15; }

  /* ---------- 収集 -------------------------------------------------------- */

  function collect() {
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;
    var all = [].filter.call(document.querySelectorAll('body *'), visible);

    /* --- セクションの縦余白 ---------------------------------------------
       <section> があればそれを、なければ「幅がほぼ全幅で高さのある直下ブロック」を
       セクションとみなす。サイトによって組み方が違うので両対応する。 */
    var sections = [].filter.call(document.querySelectorAll('section'), visible);
    if (sections.length < 2) {
      sections = all.filter(function (el) {
        var r = el.getBoundingClientRect();
        var s = getComputedStyle(el);
        return r.width > vw * 0.9 && r.height > vh * 0.25 &&
               (s.display === 'block' || s.display === 'flex' || s.display === 'grid') &&
               el.children.length > 0;
      });
    }
    var padTop = [], padBottom = [];
    sections.forEach(function (el) {
      var s = getComputedStyle(el);
      var t = px(s.paddingTop), b = px(s.paddingBottom);
      if (t > 8) padTop.push(Math.round(t));
      if (b > 8) padBottom.push(Math.round(b));
    });

    /* --- 本文 ------------------------------------------------------------ */
    var paras = all.filter(function (el) {
      if (el.tagName !== 'P' && el.tagName !== 'LI') return false;
      var t = (el.textContent || '').trim();
      return t.length >= 30;                       // 短いラベルを除く
    });
    var bodySizes = [], bodyLH = [], lineChars = [];
    paras.forEach(function (el) {
      var s = getComputedStyle(el);
      var fs = px(s.fontSize), lh = px(s.lineHeight);
      if (fs) bodySizes.push(Math.round(fs * 10) / 10);
      if (fs && lh) bodyLH.push(Math.round((lh / fs) * 100) / 100);
      // 1行あたりのおおよその文字数（幅 ÷ 1文字の推定幅）
      var w = el.getBoundingClientRect().width;
      var perChar = /[぀-ヿ一-鿿]/.test(el.textContent) ? fs : fs * 0.5;  // 和文≒全角
      if (w && perChar) lineChars.push(Math.round(w / perChar));
    });

    /* --- 見出し ---------------------------------------------------------- */
    function headSize(tag) {
      var el = [].filter.call(document.querySelectorAll(tag), visible)[0];
      return el ? Math.round(px(getComputedStyle(el).fontSize)) : null;
    }

    /* --- 書体 ------------------------------------------------------------ */
    var families = {};
    all.slice(0, 1200).forEach(function (el) {
      var f = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
      if (f) families[f] = (families[f] || 0) + 1;
    });

    /* --- 色 -------------------------------------------------------------- */
    var textColors = {}, bgColors = {}, accents = {};
    all.slice(0, 1500).forEach(function (el) {
      var s = getComputedStyle(el);
      var own = [].filter.call(el.childNodes, function (n) {
        return n.nodeType === 3 && n.nodeValue.trim();
      }).length;
      if (own) {
        var c = toRgb(s.color);
        if (c && c.a > 0.5) textColors[hex(c)] = (textColors[hex(c)] || 0) + 1;
      }
      var b = toRgb(s.backgroundColor);
      if (b && b.a > 0.5) {
        bgColors[hex(b)] = (bgColors[hex(b)] || 0) + 1;
        if (!isNeutral(b)) accents[hex(b)] = (accents[hex(b)] || 0) + 1;
      }
    });
    function nonNeutral(map) {
      return Object.keys(map).filter(function (h) {
        var c = toRgb('rgb(' + parseInt(h.slice(1, 3), 16) + ',' +
                      parseInt(h.slice(3, 5), 16) + ',' + parseInt(h.slice(5, 7), 16) + ')');
        return c && !isNeutral(c);
      });
    }

    /* --- 角丸（りょうまさんが重視している軸）------------------------------ */
    var radii = [];
    all.forEach(function (el) {
      var r = px(getComputedStyle(el).borderTopLeftRadius);
      if (r > 0 && r < 400) radii.push(Math.round(r));
    });
    var radiusSet = {};
    radii.forEach(function (r) { radiusSet[r] = (radiusSet[r] || 0) + 1; });
    var topRadii = Object.keys(radiusSet).map(Number)
      .sort(function (a, b) { return radiusSet[b] - radiusSet[a]; }).slice(0, 5);

    /* --- 影 -------------------------------------------------------------- */
    var shadows = {};
    all.forEach(function (el) {
      var sh = getComputedStyle(el).boxShadow;
      if (sh && sh !== 'none') shadows[sh] = (shadows[sh] || 0) + 1;
    });

    /* --- コンテナ幅 ------------------------------------------------------- */
    var widths = all.filter(function (el) {
      var s = getComputedStyle(el);
      return s.maxWidth !== 'none' && px(s.maxWidth) > 400;
    }).map(function (el) { return Math.round(px(getComputedStyle(el).maxWidth)); });

    /* --- CTA / リンク ----------------------------------------------------- */
    var ctaLike = [].filter.call(
      document.querySelectorAll('a[href], button'), visible)
      .filter(function (el) {
        var s = getComputedStyle(el);
        var bg = toRgb(s.backgroundColor);
        var r = el.getBoundingClientRect();
        // 塗りつぶし or 枠線があり、ある程度大きいもの＝ボタンとみなす
        return r.height >= 32 && r.width >= 60 &&
               ((bg && bg.a > 0.3) || px(s.borderTopWidth) > 0);
      });
    var ctaInFold = ctaLike.filter(function (el) {
      var r = el.getBoundingClientRect();
      return r.top < vh && r.bottom > 0;
    }).length;

    /* --- fold の中身 ------------------------------------------------------ */
    var h1 = document.querySelector('h1');
    var h1InFold = h1 && visible(h1) ? h1.getBoundingClientRect().top < vh : false;

    /* --- 情報密度（1画面あたりの文字数の目安）----------------------------- */
    var totalChars = (document.body.innerText || '').replace(/\s+/g, '').length;
    var pageH = document.body.scrollHeight;
    var charsPerScreen = pageH ? Math.round(totalChars / (pageH / vh)) : null;

    /* --- 画像 ------------------------------------------------------------- */
    var imgs = [].filter.call(document.querySelectorAll('img'), visible);

    return {
      url: location.href,
      viewport: vw + '×' + vh,
      lang: document.documentElement.lang || null,

      spacing: {
        sectionPaddingTop:    { median: median(padTop),    n: padTop.length },
        sectionPaddingBottom: { median: median(padBottom), n: padBottom.length },
        containerMaxWidth:    { median: median(widths),    n: widths.length }
      },

      typography: {
        bodySize:      { median: median(bodySizes), mode: mode(bodySizes), n: bodySizes.length },
        bodyLineHeight:{ median: median(bodyLH.map(function (v) { return v * 100; })) / 100 },
        lineChars:     { median: median(lineChars) },
        h1: headSize('h1'), h2: headSize('h2'), h3: headSize('h3'),
        fontFamilies: Object.keys(families)
          .sort(function (a, b) { return families[b] - families[a]; }).slice(0, 4),
        familyCount: Object.keys(families).length
      },

      color: {
        textColorCount: Object.keys(textColors).length,
        bgColorCount:   Object.keys(bgColors).length,
        nonNeutralTextColors: nonNeutral(textColors).length,
        nonNeutralBgColors:   nonNeutral(bgColors).length,
        topAccentBg: Object.keys(accents)
          .sort(function (a, b) { return accents[b] - accents[a]; }).slice(0, 3)
      },

      shape: {
        radiusValues: topRadii,                      // 使用頻度上位5
        radiusVariety: Object.keys(radiusSet).length,
        radiusMode: mode(radii),
        shadowVariety: Object.keys(shadows).length
      },

      structure: {
        sectionCount: sections.length,
        buttonLikeCount: ctaLike.length,
        buttonLikeInFold: ctaInFold,
        h1InFold: h1InFold,
        imageCount: imgs.length,
        pageHeightScreens: pageH ? Math.round((pageH / vh) * 10) / 10 : null
      },

      density: { charsPerScreen: charsPerScreen }
    };
  }

  function uiuxMetrics(opts) {
    opts = opts || {};
    var m;
    try { m = collect(); }
    catch (e) { m = { url: location.href, error: e.message }; }
    if (opts.json) return JSON.stringify(m);
    if (opts.silent !== true) console.log(m);
    return m;
  }

  global.uiuxMetrics = uiuxMetrics;
})(window);
