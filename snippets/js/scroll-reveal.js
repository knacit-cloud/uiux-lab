/* ==========================================================================
   scroll-reveal.js — スクロールで要素を出現させる
   --------------------------------------------------------------------------
   HTML:  <section data-reveal> … </section>
   CSS:   css/reduced-motion.css を読み込む（初期状態と遷移が定義してある）
   JS:    <script src="js/scroll-reveal.js" defer></script>

   設計方針（1-web-site/motion.md）:
     ・scroll イベントで毎フレーム計算しない → IntersectionObserver
     ・一度出したら監視をやめる。戻さない（スクロールで点滅するのは最悪）
     ・prefers-reduced-motion なら即表示
     ・JS が失敗してもコンテンツが読める（.js クラス方式）
     ・使うのはページ内 1〜2 箇所まで。全セクションに付けない
   ========================================================================== */

(function () {
  'use strict';

  // CSS の初期状態（opacity:0）は .js が付いているときだけ効く。
  // 先頭で付けることで、JS が動く環境でのみ隠す。
  document.documentElement.classList.add('js');

  var SELECTOR = '[data-reveal]';
  var VISIBLE  = 'is-visible';

  function showAll(nodes) {
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.add(VISIBLE);
  }

  function init() {
    var targets = document.querySelectorAll(SELECTOR);
    if (!targets.length) return;

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 動きを減らす設定、または IntersectionObserver 非対応 → 全部表示して終了
    if (reduced || !('IntersectionObserver' in window)) {
      showAll(targets);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(VISIBLE);
        io.unobserve(entry.target);        // 一度出したら監視をやめる
      }
    }, {
      threshold: 0.15,                     // 15% 見えたら発火
      rootMargin: '0px 0px -10% 0px'       // 下端の少し手前で発火させる
    });

    for (var i = 0; i < targets.length; i++) io.observe(targets[i]);

    // 保険: 何らかの理由で発火しなかった要素を 3 秒後に強制表示する。
    // これがないと、条件次第でコンテンツが永久に見えないままになる。
    window.setTimeout(function () {
      showAll(document.querySelectorAll(SELECTOR + ':not(.' + VISIBLE + ')'));
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
