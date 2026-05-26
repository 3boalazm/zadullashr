/* ═══════════════════════════════════════════════════════════════════════════
   pwa-install-fab.js — زر عائم لتثبيت التطبيق
   الاستخدام: <script src="pwa-install-fab.js" defer></script>
   • يظهر فقط لمستخدمي المتصفح (لا يظهر لمن ثبّت التطبيق)
   • يختفي تلقائياً بعد التثبيت
   • لا يظهر لو المستخدم أغلقه (48 ساعة)
   • صفر تعارض مع الصفحة — يحقن CSS + HTML تلقائياً
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {

  /* ── إعدادات ──────────────────────────────────────────────────────────── */
  var DISMISS_KEY    = 'zad_pwa_fab_dismissed';
  var DISMISS_HOURS  = 48;          /* عدد ساعات الاختفاء بعد الإغلاق      */
  var SHOW_DELAY_MS  = 3000;        /* ثواني الانتظار قبل ظهور الزر         */
  var FAB_ID         = 'zad-pwa-fab';

  /* ── 1. تحقق سريع: هل التطبيق مثبّت بالفعل؟ ─────────────────────────── */
  function isInstalled () {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator.standalone === true                    /* iOS Safari  */
    );
  }

  /* ── 2. تحقق من حالة الإغلاق ─────────────────────────────────────────── */
  function isDismissed () {
    try {
      var ts = parseInt(localStorage.getItem(DISMISS_KEY), 10);
      if (!ts) return false;
      return (Date.now() - ts) < DISMISS_HOURS * 3600 * 1000;
    } catch (e) { return false; }
  }
  function markDismissed () {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
  }

  /* ── 3. حقن CSS ──────────────────────────────────────────────────────── */
  function injectCSS () {
    if (document.getElementById('zad-pwa-fab-style')) return;
    var s = document.createElement('style');
    s.id  = 'zad-pwa-fab-style';
    s.textContent = [
      /* wrapper */
      '#zad-pwa-fab{',
        'position:fixed;',
        'bottom:28px;',
        'left:20px;',         /* يسار — RTL: الزاوية الطبيعية للـ FAB */
        'z-index:99998;',
        'display:flex;',
        'align-items:center;',
        'gap:10px;',
        'background:linear-gradient(135deg,#0e3b2e 0%,#1a5d47 60%,rgba(201,161,74,.25) 100%);',
        'border:1.5px solid rgba(201,161,74,.4);',
        'border-radius:56px;',
        'padding:12px 18px 12px 14px;',
        'box-shadow:0 8px 28px rgba(0,0,0,.35),0 2px 8px rgba(0,0,0,.2);',
        'cursor:pointer;',
        'direction:rtl;',
        'font-family:"IBM Plex Sans Arabic","Tajawal",Tahoma,sans-serif;',
        'transform:translateY(120px);',
        'opacity:0;',
        'transition:transform .45s cubic-bezier(.34,1.56,.64,1),opacity .35s ease;',
        'will-change:transform,opacity;',
        'backdrop-filter:blur(10px);',
        '-webkit-backdrop-filter:blur(10px);',
      '}',
      /* entrada */
      '#zad-pwa-fab.visible{transform:translateY(0);opacity:1}',
      /* hover */
      '#zad-pwa-fab:hover{',
        'transform:translateY(-3px) scale(1.02);',
        'box-shadow:0 14px 36px rgba(0,0,0,.4),0 4px 12px rgba(201,161,74,.2);',
      '}',
      '#zad-pwa-fab:active{transform:scale(.97);transition-duration:.1s}',
      /* icon */
      '#zad-pwa-fab .pfab-ico{',
        'font-size:22px;line-height:1;flex-shrink:0;',
        'animation:pfabPulse 2.4s ease-in-out infinite;',
        'filter:drop-shadow(0 0 8px rgba(201,161,74,.5));',
      '}',
      '@keyframes pfabPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}',
      /* text block */
      '#zad-pwa-fab .pfab-txt{display:flex;flex-direction:column;gap:2px;line-height:1.2}',
      '#zad-pwa-fab .pfab-title{',
        'font-size:13px;font-weight:800;color:#fff;white-space:nowrap;',
      '}',
      '#zad-pwa-fab .pfab-sub{',
        'font-size:10px;color:rgba(255,255,255,.6);white-space:nowrap;',
      '}',
      /* X close button */
      '#zad-pwa-fab .pfab-close{',
        'width:22px;height:22px;border-radius:50%;',
        'border:1px solid rgba(255,255,255,.25);',
        'background:rgba(255,255,255,.1);',
        'color:rgba(255,255,255,.7);',
        'font-size:11px;line-height:1;',
        'display:flex;align-items:center;justify-content:center;',
        'cursor:pointer;flex-shrink:0;',
        'transition:background .2s,color .2s;',
        'margin-right:2px;',
      '}',
      '#zad-pwa-fab .pfab-close:hover{background:rgba(255,255,255,.25);color:#fff}',
      /* pulse ring */
      '#zad-pwa-fab::before{',
        'content:"";',
        'position:absolute;',
        'inset:-4px;',
        'border-radius:60px;',
        'border:2px solid rgba(201,161,74,.35);',
        'animation:pfabRing 2.8s ease-in-out infinite;',
        'pointer-events:none;',
      '}',
      '@keyframes pfabRing{',
        '0%,100%{opacity:.6;transform:scale(1)}',
        '50%{opacity:0;transform:scale(1.06)}',
      '}',
      /* hide on standalone */
      '@media all and (display-mode:standalone){#zad-pwa-fab{display:none!important}}',
      '@media all and (display-mode:fullscreen){#zad-pwa-fab{display:none!important}}',
    ].join('');
    (document.head || document.documentElement).appendChild(s);
  }

  /* ── 4. بناء الـ FAB ─────────────────────────────────────────────────── */
  function buildFAB () {
    if (document.getElementById(FAB_ID)) return;

    var fab = document.createElement('div');
    fab.id   = FAB_ID;
    fab.setAttribute('role', 'button');
    fab.setAttribute('aria-label', 'تثبيت تطبيق زاد العشر');
    fab.setAttribute('tabindex', '0');
    fab.innerHTML = [
      '<span class="pfab-ico" aria-hidden="true">📲</span>',
      '<div class="pfab-txt">',
        '<span class="pfab-title">ثبّت التطبيق</span>',
        '<span class="pfab-sub">يعمل بدون إنترنت 📴</span>',
      '</div>',
      '<button class="pfab-close" id="zad-pwa-fab-close" aria-label="إغلاق">✕</button>',
    ].join('');

    document.body.appendChild(fab);

    /* show with delay */
    setTimeout(function () {
      fab.classList.add('visible');
    }, SHOW_DELAY_MS);

    return fab;
  }

  /* ── 5. إخفاء الـ FAB ────────────────────────────────────────────────── */
  function hideFAB (animate) {
    var fab = document.getElementById(FAB_ID);
    if (!fab) return;
    if (animate) {
      fab.style.transform  = 'translateY(120px)';
      fab.style.opacity    = '0';
      setTimeout(function () { fab.remove(); }, 450);
    } else {
      fab.remove();
    }
  }

  /* ── 6. منطق الـ install prompt ─────────────────────────────────────── */
  var _deferredPrompt = null;

  function doInstall () {
    if (!_deferredPrompt) return;
    _deferredPrompt.prompt();
    _deferredPrompt.userChoice.then(function (result) {
      _deferredPrompt = null;
      if (result.outcome === 'accepted') {
        hideFAB(true);
      }
    });
  }

  /* ── 7. Init ─────────────────────────────────────────────────────────── */
  function init () {
    /* لو بالفعل مثبّت → لا تكمّل */
    if (isInstalled()) return;

    /* لو المستخدم أغلقه مؤخراً → لا تظهره */
    if (isDismissed()) return;

    injectCSS();

    /* استمع لـ beforeinstallprompt */
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      _deferredPrompt = e;

      /* لو أُغلق بعد حفظ الحدث */
      if (isDismissed()) return;

      var fab = buildFAB();
      if (!fab) return;

      /* كليك على الزر → install */
      fab.addEventListener('click', function (ev) {
        /* لو ضغط على X → أغلق فقط */
        if (ev.target.id === 'zad-pwa-fab-close' ||
            ev.target.closest('#zad-pwa-fab-close')) {
          ev.stopPropagation();
          markDismissed();
          hideFAB(true);
          return;
        }
        doInstall();
      });

      /* Keyboard */
      fab.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') doInstall();
      });
    });

    /* بعد التثبيت → اخفيه */
    window.addEventListener('appinstalled', function () {
      hideFAB(true);
    });

    /* لو فتح التطبيق بعدين كـ standalone → اخفيه من localStorage */
    window.matchMedia('(display-mode: standalone)').addEventListener('change', function (e) {
      if (e.matches) hideFAB(false);
    });
  }

  /* شغّل init بعد تحميل الـ DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ── 8. API عام (للتحكم اليدوي لو احتجت) ──────────────────────────── */
  window.ZadPWA = {
    show : function () {
      if (isInstalled()) return;
      injectCSS();
      buildFAB();
    },
    hide : function () { hideFAB(true); },
    reset: function () {
      try { localStorage.removeItem(DISMISS_KEY); } catch(e) {}
    },
  };

})();
