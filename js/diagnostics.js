/* ═══════════════════════════════════════════════════════════════════════════
   زاد — مركز التشخيص (Diagnostics)
   ─────────────────────────────────────────────────────────────────────────
   • Overlay صغير في الركن يمسك الأخطاء اللحظية (JS errors, failed resources)
   • يظهر للأدمن فقط — يُفعّل بـ localStorage 'zad_dev' = 'on'
   • أو بكتابة #dev في آخر الرابط، أو ضغط مطوّل (3s) على شعار الزاوية
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── تفعيل وضع المطوّر ────────────────────────────────────────── */
  function isDevMode() {
    try {
      if (location.hash.includes('dev')) {
        localStorage.setItem('zad_dev', 'on');
      }
      return localStorage.getItem('zad_dev') === 'on';
    } catch (e) { return false; }
  }

  /* ── Network Monitor: يسجّل نداءات fetch الفاشلة (يعمل دائماً) ──── */
  window.__zadNet = window.__zadNet || [];
  if (!window.__zadFetchPatched && window.fetch) {
    window.__zadFetchPatched = true;
    var origFetch = window.fetch;
    window.fetch = function () {
      var url = (arguments[0] && arguments[0].url) || String(arguments[0] || '');
      var t0 = Date.now();
      return origFetch.apply(this, arguments).then(function (res) {
        if (!res.ok) {
          window.__zadNet.push({ url: url, status: res.status, ms: Date.now() - t0, ok: false });
        }
        return res;
      }).catch(function (err) {
        window.__zadNet.push({ url: url, status: 0, ms: Date.now() - t0, ok: false, error: String(err) });
        throw err;
      });
    };
  }

  if (!isDevMode()) {
    /* حتى بدون وضع المطوّر — نسجّل الأخطاء بصمت في الذاكرة للمراجعة لاحقاً */
    window.__zadErrors = window.__zadErrors || [];
    window.addEventListener('error', function (e) {
      window.__zadErrors.push({
        type: e.message ? 'js' : 'resource',
        msg: e.message || ('فشل تحميل: ' + (e.target && (e.target.src || e.target.href) || '?')),
        file: e.filename || '', line: e.lineno || '', time: Date.now()
      });
    }, true);
    window.addEventListener('unhandledrejection', function (e) {
      window.__zadErrors.push({ type: 'promise', msg: String(e.reason), time: Date.now() });
    });
    return; /* مفيش overlay للمستخدم العادي */
  }

  /* ── من هنا فصاعداً: وضع المطوّر مُفعّل ──────────────────────── */
  var errors = [];
  var warnings = [];

  /* امسك أخطاء JS وفشل تحميل الموارد */
  window.addEventListener('error', function (e) {
    if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK' || e.target.tagName === 'IMG')) {
      var url = e.target.src || e.target.href || '?';
      /* تجاهل السكريبتات الخارجية المعروفة (mixpanel/soundcloud) — ليست أخطاءك */
      var external = /soundcloud|mixpanel|googletagmanager|gtm|doubleclick/i.test(url);
      (external ? warnings : errors).push({
        type: 'resource', msg: 'فشل تحميل', url: url, time: Date.now()
      });
    } else {
      errors.push({ type: 'js', msg: e.message, file: e.filename, line: e.lineno, time: Date.now() });
    }
    render();
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    errors.push({ type: 'promise', msg: String(e.reason), time: Date.now() });
    render();
  });

  /* ── بناء الـ overlay ─────────────────────────────────────────── */
  var panel, badge, expanded = false;

  function injectCSS() {
    if (document.getElementById('zad-diag-css')) return;
    var s = document.createElement('style');
    s.id = 'zad-diag-css';
    s.textContent = [
      '#zad-diag-badge{position:fixed;bottom:14px;left:14px;z-index:99999;',
      'width:46px;height:46px;border-radius:50%;display:flex;align-items:center;',
      'justify-content:center;font-size:20px;cursor:pointer;border:none;',
      'box-shadow:0 4px 16px rgba(0,0,0,.3);font-family:inherit;color:#fff;',
      'transition:transform .2s;}',
      '#zad-diag-badge:active{transform:scale(.9);}',
      '#zad-diag-badge.ok{background:#1a7d4f;}',
      '#zad-diag-badge.warn{background:#d98a00;}',
      '#zad-diag-badge.err{background:#c0392b;}',
      '#zad-diag-count{position:absolute;top:-2px;right:-2px;background:#fff;',
      'color:#c0392b;font-size:11px;font-weight:800;border-radius:50%;',
      'min-width:18px;height:18px;display:flex;align-items:center;justify-content:center;padding:0 4px;}',
      '#zad-diag-panel{position:fixed;bottom:68px;left:14px;z-index:99999;',
      'width:min(380px,calc(100vw - 28px));max-height:60vh;overflow-y:auto;',
      'background:#1a1a1e;color:#eee;border-radius:14px;padding:14px;',
      'box-shadow:0 8px 40px rgba(0,0,0,.5);font-family:monospace;font-size:12px;',
      'direction:ltr;text-align:left;display:none;}',
      '#zad-diag-panel.open{display:block;}',
      '.zd-diag-h{display:flex;justify-content:space-between;align-items:center;',
      'margin-bottom:10px;font-family:sans-serif;}',
      '.zd-diag-h b{font-size:14px;color:#fff;}',
      '.zd-diag-row{padding:8px;border-radius:8px;margin-bottom:6px;line-height:1.5;word-break:break-all;}',
      '.zd-diag-row.err{background:rgba(192,57,43,.18);border-left:3px solid #c0392b;}',
      '.zd-diag-row.warn{background:rgba(217,138,0,.15);border-left:3px solid #d98a00;}',
      '.zd-diag-row .t{color:#888;font-size:10px;}',
      '.zd-diag-empty{color:#5fb87a;text-align:center;padding:16px;font-family:sans-serif;}',
      '.zd-diag-btns{display:flex;gap:6px;}',
      '.zd-diag-btns button{background:#333;color:#fff;border:none;border-radius:6px;',
      'padding:5px 10px;font-size:11px;cursor:pointer;font-family:sans-serif;}',
      '.zd-diag-link{color:#5aabff;text-decoration:underline;}'
    ].join('');
    document.head.appendChild(s);
  }

  function build() {
    badge = document.createElement('button');
    badge.id = 'zad-diag-badge';
    badge.className = 'ok';
    badge.innerHTML = '🩺<span id="zad-diag-count" style="display:none">0</span>';
    badge.title = 'مركز التشخيص';
    badge.onclick = toggle;
    document.body.appendChild(badge);

    panel = document.createElement('div');
    panel.id = 'zad-diag-panel';
    document.body.appendChild(panel);
  }

  function toggle() { expanded = !expanded; render(); }

  function render() {
    if (!badge) return;
    var total = errors.length + warnings.length;
    /* لون البادج */
    badge.className = errors.length ? 'err' : (warnings.length ? 'warn' : 'ok');
    var cnt = badge.querySelector('#zad-diag-count');
    if (total > 0) { cnt.style.display = 'flex'; cnt.textContent = total; }
    else { cnt.style.display = 'none'; }

    panel.className = expanded ? 'open' : '';
    if (!expanded) return;

    var html = '<div class="zd-diag-h"><b>🩺 مركز التشخيص</b><div class="zd-diag-btns">' +
      '<button onclick="ZadDiag.openFull()">فحص شامل</button>' +
      '<button onclick="ZadDiag.clear()">مسح</button>' +
      '<button onclick="ZadDiag.off()">إيقاف</button></div></div>';

    if (total === 0) {
      html += '<div class="zd-diag-empty">✅ لا توجد أخطاء في هذه الصفحة</div>';
    } else {
      errors.forEach(function (e) {
        html += '<div class="zd-diag-row err">🔴 ' + esc(e.msg) +
          (e.file ? '<br><span class="t">' + esc(e.file) + ':' + e.line + '</span>' : '') +
          (e.url ? '<br><span class="t">' + esc(e.url) + '</span>' : '') + '</div>';
      });
      warnings.forEach(function (w) {
        html += '<div class="zd-diag-row warn">🟡 ' + esc(w.msg) +
          (w.url ? '<br><span class="t">' + esc(w.url) + ' (سكريبت خارجي — غالباً محجوب)</span>' : '') + '</div>';
      });
    }
    panel.innerHTML = html;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ── واجهة عامة ───────────────────────────────────────────────── */
  window.ZadDiag = {
    clear: function () { errors = []; warnings = []; render(); },
    off: function () {
      try { localStorage.removeItem('zad_dev'); } catch (e) {}
      if (badge) badge.remove();
      if (panel) panel.remove();
    },
    openFull: function () { location.href = 'diagnostics.html'; },
    getErrors: function () { return errors; },
    getWarnings: function () { return warnings; }
  };

  function init() { injectCSS(); build(); render(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
