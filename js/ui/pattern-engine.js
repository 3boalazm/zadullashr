/* ═══════════════════════════════════════════════════════════════════════════
   زاد — نظام الزخارف الخلفية (Pattern Engine)
   خفيف · يحترم نظام الثيمات · يحفظ تفضيل المستخدم · يعمل في كل الصفحات
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'zad_pattern';
  var VALID = ['geometry', 'stars', 'grid', 'none'];
  var DEFAULT = 'none';

  function getSaved() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return VALID.indexOf(v) !== -1 ? v : DEFAULT;
    } catch (e) { return DEFAULT; }
  }

  /* يحقن عنصر الخلفية مرة واحدة */
  function ensureBgElement() {
    if (document.getElementById('zad-pattern-bg')) return;
    var bg = document.createElement('div');
    bg.id = 'zad-pattern-bg';
    bg.setAttribute('aria-hidden', 'true');
    if (document.body.firstChild) {
      document.body.insertBefore(bg, document.body.firstChild);
    } else {
      document.body.appendChild(bg);
    }
  }

  /* يطبّق زخرفة على الصفحة */
  function applyPattern(name) {
    if (VALID.indexOf(name) === -1) name = DEFAULT;
    ensureBgElement();
    document.body.setAttribute('data-pattern', name);
    try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
    /* حدّث الأزرار النشطة لو موجودة في صفحة الإعدادات */
    var btns = document.querySelectorAll('[data-pattern-btn]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-pattern-btn') === name);
    }
  }

  /* تطبيق فوري عند التحميل */
  function init() {
    ensureBgElement();
    applyPattern(getSaved());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* واجهة عامة */
  window.setPattern = applyPattern;
  window.getPattern = getSaved;
})();
