/* ==========================================================================
   nav-toggle.js — モバイルナビの開閉
   --------------------------------------------------------------------------
   HTML:
     <button type="button" data-nav-toggle="mobileNav"
             aria-expanded="false" aria-controls="mobileNav"
             aria-label="メニューを開く"> … </button>
     <nav id="mobileNav" hidden> … </nav>

   JS: <script src="js/nav-toggle.js" defer></script>

   アクセシビリティ要件（1-web-site/responsive.md）:
     ・aria-expanded を実際の状態に同期させる
     ・aria-label も開/閉で切り替える
     ・Esc で閉じて、フォーカスをトグルボタンに戻す
     ・メニュー内のリンクを押したら閉じる
     ・開いている間は背景をスクロールさせない
   ========================================================================== */

(function () {
  'use strict';

  var LABEL_OPEN  = 'メニューを開く';
  var LABEL_CLOSE = 'メニューを閉じる';

  function setup(btn) {
    var panel = document.getElementById(btn.getAttribute('data-nav-toggle'));
    if (!panel) return;

    function isOpen() {
      return btn.getAttribute('aria-expanded') === 'true';
    }

    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? LABEL_CLOSE : LABEL_OPEN);
      panel.hidden = !open;
      // 背景のスクロールを止める（モバイルで全画面メニューの場合）
      document.documentElement.style.overflow = open ? 'hidden' : '';
    }

    btn.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    // Esc で閉じて、フォーカスをトグルに戻す
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isOpen()) return;
      setOpen(false);
      btn.focus();
    });

    // メニュー内のリンクを押したら閉じる（同一ページ内アンカーで特に必要）
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    // デスクトップ幅に戻ったら状態をリセットする。
    // これをやらないと、開いたまま拡げたときに overflow:hidden が残る。
    var mq = window.matchMedia('(min-width: 768px)');
    var onChange = function (e) { if (e.matches && isOpen()) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);   // Safari 13 以前

    setOpen(false);   // 初期状態を明示的に揃える
  }

  function init() {
    var btns = document.querySelectorAll('[data-nav-toggle]');
    for (var i = 0; i < btns.length; i++) setup(btns[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
