/* ==========================================================================
   form-validate.js — フォームのバリデーションと送信
   --------------------------------------------------------------------------
   HTML: html/form-contact.html を参照
   JS:   <script src="js/form-validate.js" defer></script>

   使い方:
     <form data-validate action="/api/contact" method="post"> … </form>
     各 input の隣に <p id="{name}-error" class="field-error" hidden></p> を置く

   設計方針（1-web-site/forms.md）:
     ・入力中はエラーを出さない（打っている途中に赤くなるのは不快）
     ・フォーカスを外したら検証する
     ・一度エラーになった欄は、入力中に再検証して直ったら即消す
     ・送信時は全体を検証し、最初のエラー欄にフォーカスを移す
     ・送信ボタンはリクエスト開始「後」に無効化する
     ・失敗しても入力内容を消さない
     ・全角/半角・ハイフン有無はユーザーに直させず、こちらで正規化する
   ========================================================================== */

(function () {
  'use strict';

  /* --- メッセージ（何が問題か＋どう直すか）------------------------------- */
  var MESSAGES = {
    valueMissing: {
      text:     'を入力してください',
      checkbox: 'に同意してください',
      select:   'を選択してください'
    },
    typeMismatch: {
      email: 'メールアドレスに「@」が含まれていないか、形式が正しくありません',
      url:   'URL は https:// から始まる形式で入力してください'
    },
    tooLong:  'が長すぎます',
    tooShort: 'が短すぎます',
    patternMismatch: 'の形式が正しくありません'
  };

  /* --- 全角→半角の正規化 -------------------------------------------------
     ポステルの法則: 受け取りは寛容に。ユーザーに整形させない。
     ------------------------------------------------------------------------ */
  function toHalfWidth(str) {
    return str
      .replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
      })
      .replace(/[－ー―‐]/g, '-')
      .replace(/＠/g, '@')
      .replace(/[．。]/g, '.')
      .replace(/　/g, ' ')
      .trim();
  }

  function labelOf(field) {
    // 1) 明示指定が最優先。
    //    ラップ型の <label>（チェックボックス等）はラベル文が長くて
    //    エラー文に流用できないので、data-error-label で短い名前を渡す。
    if (field.dataset.errorLabel) return field.dataset.errorLabel;

    // 2) label[for="id"]
    var lbl = field.id && field.form.querySelector('label[for="' + field.id + '"]');

    // 3) field を包んでいる <label>
    if (!lbl) lbl = field.closest('label');

    if (!lbl) return 'この項目';
    // 「*」「必須」「任意」などの装飾を落とす
    return lbl.textContent.replace(/[*＊]|必須|任意/g, '').trim();
  }

  function messageFor(field) {
    var v = field.validity;
    var name = labelOf(field);

    if (v.valueMissing) {
      if (field.type === 'checkbox') return name + MESSAGES.valueMissing.checkbox;
      if (field.tagName === 'SELECT') return name + MESSAGES.valueMissing.select;
      return name + MESSAGES.valueMissing.text;
    }
    if (v.typeMismatch)    return MESSAGES.typeMismatch[field.type] || name + MESSAGES.patternMismatch;
    if (v.tooShort)        return name + MESSAGES.tooShort;
    if (v.tooLong)         return name + MESSAGES.tooLong;
    if (v.patternMismatch) return name + MESSAGES.patternMismatch;
    return field.validationMessage;   // 最後の保険
  }

  function errorBox(field) {
    return document.getElementById(field.name + '-error') ||
           field.parentElement.querySelector('.field-error');
  }

  function showError(field, msg) {
    var box = errorBox(field);
    field.setAttribute('aria-invalid', 'true');
    if (!box) return;
    box.textContent = msg;
    box.hidden = false;
    field.setAttribute('aria-describedby', box.id);
  }

  function clearError(field) {
    var box = errorBox(field);
    field.removeAttribute('aria-invalid');
    if (!box) return;
    box.textContent = '';
    box.hidden = true;
  }

  function validate(field) {
    if (field.disabled || field.type === 'hidden') return true;
    if (field.checkValidity()) { clearError(field); return true; }
    showError(field, messageFor(field));
    return false;
  }

  /* --- 送信ボタンの状態 --------------------------------------------------- */
  function setSubmitting(form, on) {
    var btn = form.querySelector('[type="submit"]');
    if (!btn) return;
    // リクエスト開始「後」に無効化する。押す前から disabled にしない
    btn.disabled = on;
    var spinner = btn.querySelector('[data-spinner]');
    var label   = btn.querySelector('[data-label]');
    if (spinner) spinner.hidden = !on;
    if (label) {
      if (on) {
        label.dataset.original = label.textContent;
        label.textContent = '送信中…';        // 読み込み中の文言は … で終える
      } else if (label.dataset.original) {
        label.textContent = label.dataset.original;
      }
    }
  }

  function announce(form, msg, isError) {
    var live = form.querySelector('[data-form-status]');
    if (!live) return;
    live.textContent = msg;
    live.hidden = !msg;
    live.classList.toggle('is-error', !!isError);
  }

  /* --- 初期化 -------------------------------------------------------------- */
  function setup(form) {
    // ブラウザ標準のツールチップを止めて、自前のインライン表示に一本化する
    form.setAttribute('novalidate', '');

    var fields = form.querySelectorAll('input, select, textarea');

    for (var i = 0; i < fields.length; i++) {
      (function (field) {
        // フォーカスを外したときに検証（入力中は出さない）
        field.addEventListener('blur', function () {
          if (field.value !== '' || field.required) validate(field);
        });

        // 一度エラーになった欄だけ、入力中に再検証して直ったら即消す
        field.addEventListener('input', function () {
          if (field.getAttribute('aria-invalid') === 'true') validate(field);
        });

        // メール・電話・URL は離れた時点で正規化する
        if (['email', 'tel', 'url'].indexOf(field.type) !== -1) {
          field.addEventListener('blur', function () {
            var normalized = toHalfWidth(field.value);
            if (normalized !== field.value) field.value = normalized;
          });
        }
      })(fields[i]);
    }

    form.addEventListener('submit', function (e) {
      var firstInvalid = null;

      for (var i = 0; i < fields.length; i++) {
        if (!validate(fields[i]) && !firstInvalid) firstInvalid = fields[i];
      }

      if (firstInvalid) {
        e.preventDefault();
        // 最初のエラー欄にフォーカスを移す
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
        announce(form, '入力内容に誤りがあります。赤字の項目をご確認ください。', true);
        return;
      }

      announce(form, '');

      // fetch で送る場合はここで preventDefault する。
      // 通常の POST 送信ならこのまま進めてよい。
      if (form.dataset.ajax === undefined) {
        setSubmitting(form, true);
        return;
      }

      e.preventDefault();
      setSubmitting(form, true);

      fetch(form.action, { method: form.method || 'POST', body: new FormData(form) })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.hidden = true;
          announce(form, '送信しました。3営業日以内にご連絡します。');
        })
        .catch(function () {
          // 失敗しても入力内容は絶対に消さない
          announce(
            form,
            '送信できませんでした。時間をおいて再度お試しください。' +
            '解決しない場合は hello@example.com までご連絡ください。',
            true
          );
        })
        .finally(function () { setSubmitting(form, false); });
    });
  }

  function init() {
    var forms = document.querySelectorAll('form[data-validate]');
    for (var i = 0; i < forms.length; i++) setup(forms[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
