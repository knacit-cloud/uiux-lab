/* ==========================================================================
   lang-toggle.js — 日英切り替え
   --------------------------------------------------------------------------
   HTML:
     <button type="button" data-lang-toggle aria-pressed="false">EN</button>
     <p><span class="ja">無料で診断します</span><span class="en">Free diagnosis</span></p>

   CSS（このファイルが自動で注入するので不要だが、CLS を避けたいなら
        先に <style> で書いておく）:
     [data-lang='ja'] .en { display: none; }
     [data-lang='en'] .ja { display: none; }

   JS: <script src="js/lang-toggle.js" defer></script>

   設計方針:
     ・localStorage に保存して次回訪問でも維持する
     ・<html lang> を実際に書き換える（スクリーンリーダーの読み上げ言語が変わる）
     ・aria-pressed でトグルの状態を伝える
     ・JS が動かなくても日本語は読める（既定が ja）
   ========================================================================== */

(function () {
  'use strict';

  var KEY      = 'site-lang';
  var DEFAULT  = 'ja';
  var LANGS    = ['ja', 'en'];

  // 表示切り替えの CSS を注入する。
  // HTML 側に書いておく方が CLS の観点では望ましいが、
  // スニペット単体で動くようにここで入れる。
  var style = document.createElement('style');
  style.textContent =
    "[data-lang='ja'] .en{display:none}" +
    "[data-lang='en'] .ja{display:none}";
  document.head.appendChild(style);

  function read() {
    try {
      var v = window.localStorage.getItem(KEY);
      return LANGS.indexOf(v) !== -1 ? v : DEFAULT;
    } catch (e) {
      return DEFAULT;   // プライベートブラウジング等で localStorage が使えない場合
    }
  }

  function save(lang) {
    try { window.localStorage.setItem(KEY, lang); } catch (e) { /* 保存できなくても動く */ }
  }

  function apply(lang) {
    var root = document.documentElement;
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);   // 読み上げ言語が変わる。必ず更新する

    var btns = document.querySelectorAll('[data-lang-toggle]');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var next = lang === 'ja' ? 'en' : 'ja';
      btn.setAttribute('aria-pressed', String(lang === 'en'));
      btn.setAttribute('lang', next);
      btn.textContent = next.toUpperCase();
      btn.setAttribute(
        'aria-label',
        lang === 'ja' ? 'Switch to English' : '日本語に切り替える'
      );
    }
  }

  function init() {
    var current = read();
    apply(current);

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-lang-toggle]');
      if (!btn) return;
      current = current === 'ja' ? 'en' : 'ja';
      apply(current);
      save(current);
    });
  }

  // data-lang は早いほど良い（切り替えのちらつきを避ける）ので、
  // DOMContentLoaded を待たずに属性だけ先に当てる。
  document.documentElement.setAttribute('data-lang', read());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
