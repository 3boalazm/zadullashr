/* ═══════════════════════════════════════════════════════════════════════════
   زاد — Design System + إمكانية الوصول + Calm UX
   الفيز الرابع: Design Tokens موحّدة + WCAG 2.2 + Arabic-first + Calm UX
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   1. Design Tokens — المصدر الوحيد للحقيقة البصرية
   ─────────────────────────────────────────────────────────────────────────
   يُوحَّد هنا كل الألوان والمسافات والخطوط والتحولات.
   أي تغيير بصري يحدث هنا فقط — لا في ملفات CSS المبعثرة.
   ═══════════════════════════════════════════════════════════════════════════ */
const ZAD_TOKENS_CSS = `
/* ═══════════════ زاد — Design Tokens v1.0 ═══════════════ */

:root {
  /* ── الألوان الأساسية ──────────────────────────────── */
  --zad-green-900: #0e3b2e;   /* الأخضر الداكن — primary */
  --zad-green-700: #1a5d47;
  --zad-green-500: #2d8a6a;
  --zad-green-100: #e8f5f0;

  --zad-gold-700:  #b87200;   /* الذهبي */
  --zad-gold-500:  #c9a14a;
  --zad-gold-100:  #fff8e8;

  --zad-amber:     #ff9500;   /* البرتقالي */
  --zad-coral:     #c0392b;   /* الأحمر */
  --zad-purple:    #4a3580;   /* البنفسجي */

  /* ── نسب contrast آمنة (WCAG 2.2 AA) ─────────────── */
  /* green-900 on white:  contrast 9.4:1  ✅ AAA */
  /* green-700 on white:  contrast 6.8:1  ✅ AA  */
  /* gold-500 on dark:    contrast 4.6:1  ✅ AA  */

  /* ── المسافات (8px grid) ───────────────────────────── */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;

  /* ── نصف القطر ──────────────────────────────────────── */
  --radius-sm:  8px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  20px;
  --radius-full: 9999px;

  /* ── الخطوط ─────────────────────────────────────────── */
  --font-ui:    'ThmanyahSans', 'Segoe UI', 'Arial', sans-serif;
  --font-quran: 'ThmanyahSerifText', 'Amiri', 'Traditional Arabic', serif;
  --font-display: 'ThmanyahSerifDisplay', serif;

  /* ── أحجام الخط ──────────────────────────────────────── */
  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 15px;
  --text-md:   16px;
  --text-lg:   18px;
  --text-xl:   22px;
  --text-2xl:  28px;
  --text-3xl:  36px;

  /* ── التحولات (Calm UX: خفيفة وهادئة) ─────────────── */
  --transition-fast:   150ms ease;
  --transition-base:   250ms ease;
  --transition-slow:   400ms ease;
  --transition-calm:   350ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ── الظلال ──────────────────────────────────────────── */
  --shadow-sm:  0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
  --shadow-md:  0 4px 12px rgba(0,0,0,.10), 0 2px 4px rgba(0,0,0,.06);
  --shadow-lg:  0 10px 30px rgba(0,0,0,.15), 0 4px 8px rgba(0,0,0,.08);

  /* ── مؤشر التركيز (Accessibility) ───────────────────── */
  --focus-ring: 0 0 0 3px rgba(14,59,46,.4);
  --focus-ring-gold: 0 0 0 3px rgba(201,161,74,.5);
}

/* ── 2. Reduced Motion — احترام تفضيلات المستخدم ─────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* إيقاف الأنيميشن في GSAP يدوياً في JS */
}

/* ── 3. مؤشرات التركيز (WCAG 2.2 — Focus Visible) ────────────────────────── */
:focus-visible {
  outline: 3px solid var(--zad-green-700);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* إزالة outline الافتراضي القبيح مع الحفاظ على الوصول */
:focus:not(:focus-visible) {
  outline: none;
}

/* ── 4. Buttons — حجم لمسي مناسب (44x44px minimum WCAG) ──────────────────── */
button, .btn, [role="button"], .check, .fast-day, .charity-act {
  min-height: 44px;
  min-width: 44px;
}

/* ── 5. التباين — نصوص قابلة للقراءة لكبار السن ───────────────────────────── */
.muted, small, .tag, .prayer-sub, .adhkar-source {
  color: #5a5a58; /* contrast 5.8:1 على أبيض ✅ */
}

/* ── 6. الخط العربي — القرآن الكريم بالرسم العثماني ──────────────────────── */
.quran-text, .adhkar-arabic, .af-ms-dua, [lang="ar-Quran"] {
  font-family: var(--font-quran);
  font-size: var(--qf-size, 24px);
  line-height: 2.2;
  letter-spacing: 0;
  direction: rtl;
  text-align: center;
}

/* ── 7. RTL Consistency ──────────────────────────────────────────────────── */
html {
  direction: rtl;
}
[dir="ltr"], .ltr {
  direction: ltr;
  text-align: left;
}

/* ── 8. Calm UX — تقليل مصادر التشتت ──────────────────────────────────────── */

/* لا animations أثناء القراءة (في وضع المصحف) */
.mushaf-mode * {
  animation: none !important;
  transition: none !important;
}

/* الإشعارات تظهر بهدوء */
.toast {
  transition: opacity var(--transition-slow), transform var(--transition-slow);
}

/* الكاردات تظهر بتأخير بسيط للتسلسل الطبيعي */
.card.reveal {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity var(--transition-slow), transform var(--transition-slow);
}
.card.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── 9. High Contrast Mode ───────────────────────────────────────────────── */
@media (prefers-contrast: high) {
  :root {
    --zad-green-900: #000;
    --zad-gold-500: #7a5000;
  }
  .card { border: 2px solid #000; }
}

/* ── 10. Print — إزالة عناصر غير ضرورية ────────────────────────────────── */
@media print {
  .sidebar, .topbar, .pwa-banner, .toast, .scroll-top-btn, 
  .btn, footer, nav { display: none !important; }
  .main { margin: 0 !important; padding: 0 !important; }
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   2. حقن Design Tokens في الـ DOM
   ═══════════════════════════════════════════════════════════════════════════ */
function injectDesignTokens() {
  if (document.getElementById('zad-design-tokens')) return;
  const style = document.createElement('style');
  style.id = 'zad-design-tokens';
  style.textContent = ZAD_TOKENS_CSS;
  document.head.insertBefore(style, document.head.firstChild);
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. إمكانية الوصول — Accessibility Enhancements
   ─────────────────────────────────────────────────────────────────────────
   تُطبَّق تلقائياً على كل الصفحات
   ═══════════════════════════════════════════════════════════════════════════ */
function enhanceAccessibility() {

  /* ── 3.1 aria-label للأزرار التي تحتوي Emoji فقط ───────────────────── */
  const EMOJI_LABELS = {
    '🌙': 'تفعيل الوضع الداكن',
    '☀️': 'تفعيل الوضع الفاتح',
    '⚫': 'وضع OLED',
    '🔔': 'الإشعارات',
    '🔕': 'إيقاف الإشعارات',
    '↑': 'العودة لأعلى',
    '☰': 'القائمة',
    '🔍': 'بحث',
    '❌': 'إغلاق',
    '✅': 'مكتمل',
    '🏠': 'الرئيسية',
  };

  document.querySelectorAll('button, [role="button"]').forEach(btn => {
    if (btn.getAttribute('aria-label')) return; /* already labeled */
    const text = btn.textContent.trim();
    if (EMOJI_LABELS[text]) {
      btn.setAttribute('aria-label', EMOJI_LABELS[text]);
    } else if (text.length <= 2 && /[\u{1F000}-\u{1FFFF}]/u.test(text)) {
      /* Emoji بدون label معروف — أضف role description */
      btn.setAttribute('aria-describedby', btn.id || 'btn-' + Math.random().toString(36).slice(2,6));
    }
  });

  /* ── 3.2 Skip to Main Content ────────────────────────────────────────── */
  if (!document.getElementById('skip-to-main')) {
    const skip = document.createElement('a');
    skip.id   = 'skip-to-main';
    skip.href = '#main-content';
    skip.textContent = 'انتقل للمحتوى الرئيسي';
    skip.style.cssText = `
      position: absolute;
      top: -40px;
      right: 16px;
      background: var(--zad-green-900, #0e3b2e);
      color: #fff;
      padding: 8px 16px;
      border-radius: 0 0 8px 8px;
      font-size: 14px;
      font-weight: 700;
      z-index: 10000;
      transition: top 0.2s;
      text-decoration: none;
    `;
    skip.addEventListener('focus', () => { skip.style.top = '0'; });
    skip.addEventListener('blur',  () => { skip.style.top = '-40px'; });
    document.body.insertBefore(skip, document.body.firstChild);

    /* تأكد إن .main له id="main-content" */
    const main = document.querySelector('.main');
    if (main && !main.id) main.id = 'main-content';
  }

  /* ── 3.3 Landmarks — أدوار ARIA للمناطق ────────────────────────────── */
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && !sidebar.getAttribute('role')) {
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', 'القائمة الرئيسية');
  }

  const main = document.querySelector('.main');
  if (main && !main.getAttribute('role')) {
    main.setAttribute('role', 'main');
  }

  /* ── 3.4 Checklist items — keyboard accessible ──────────────────────── */
  document.querySelectorAll('.check[data-key]').forEach(el => {
    if (!el.getAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.getAttribute('role'))     el.setAttribute('role', 'checkbox');
    
    const key = el.dataset.key;
    const labels = {
      'fajr': 'صلاة الفجر', 'zuhr': 'صلاة الظهر',
      'asr': 'صلاة العصر', 'maghrib': 'صلاة المغرب',
      'isha': 'صلاة العشاء', 'qiyam': 'قيام الليل',
      'morning_dhikr': 'أذكار الصباح', 'evening_dhikr': 'أذكار المساء',
      'takbeer_100': 'التكبير', 'tawbah': 'التوبة والاستغفار',
      'rawatib': 'السنن الرواتب', 'duha': 'صلاة الضحى',
    };
    if (labels[key] && !el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', labels[key]);
    }
    
    const isDone = el.classList.contains('done');
    el.setAttribute('aria-checked', isDone ? 'true' : 'false');

    /* مراقبة تغير الحالة لتحديث aria-checked */
    const observer = new MutationObserver(() => {
      el.setAttribute('aria-checked', el.classList.contains('done') ? 'true' : 'false');
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });

    /* Keyboard: Space/Enter لتفعيل */
    if (!el._a11yBound) {
      el._a11yBound = true;
      el.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); el.click(); }
      });
    }
  });

  /* ── 3.5 Images and icons — alt text ────────────────────────────────── */
  document.querySelectorAll('img:not([alt])').forEach(img => {
    img.setAttribute('alt', ''); /* decorative */
  });

  /* ── 3.6 Language attribute ──────────────────────────────────────────── */
  if (!document.documentElement.getAttribute('lang')) {
    document.documentElement.setAttribute('lang', 'ar');
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. Calm UX — مراجعة الـ Gamification
   ─────────────────────────────────────────────────────────────────────────
   «التحفيز الداخلي فوق المكافأة الخارجية» — Architecture Principle
   الأوسمة والشريط موجودان، لكن نضبطهما ليكونا محفّزين لا مدمِنين.
   ═══════════════════════════════════════════════════════════════════════════ */
function applyCalmUX() {

  /* ── 4.1 Reduced Motion: إيقاف GSAP animations ─────────────────────── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    /* إخبار GSAP بالإيقاف */
    if (window.gsap) {
      gsap.globalTimeline.pause();
      gsap.defaults({ duration: 0 });
    }
    /* إيقاف CSS animations */
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-base', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
    document.documentElement.style.setProperty('--transition-calm', '0ms');
  }

  /* ── 4.2 لا Confetti في وضع التدبر / المصحف ────────────────────────── */
  const quietPages = ['mushaf', 'arafah', 'adhkar', 'ai'];
  const currentPage = window.location.pathname.split('/').pop().split('.')[0];
  if (quietPages.includes(currentPage)) {
    window._calmMode = true;
    /* Override triggerConfetti لا يعمل في الصفحات الهادئة */
    window.triggerConfetti = function() {
      /* في الصفحات الهادئة: toast بسيط بدل confetti */
      if (typeof showToast === 'function') {
        showToast('🎉 ما شاء الله — تقبّل الله منك');
      }
    };
  }

  /* ── 4.3 الإشعارات: لا تُرسَل في منتصف الليل (12am–5am) ──────────── */
  const _origSchedule = window.scheduleReminders;
  if (_origSchedule) {
    window.scheduleReminders = function() {
      const hour = new Date().getHours();
      if (hour >= 0 && hour < 5) {
        console.log('[CalmUX] الإشعارات مؤجلة — وقت الراحة');
        return;
      }
      _origSchedule();
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. Arabic-first Rendering — ضمان جودة العربية
   ═══════════════════════════════════════════════════════════════════════════ */
function ensureArabicRendering() {

  /* ── 5.1 تحقق من تحميل الخطوط ───────────────────────────────────────── */
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      const fontsLoaded = [...document.fonts.values()].filter(f => f.status === 'loaded');
      console.log(`[Arabic] ${fontsLoaded.length} خط محمّل`);
    });
  }

  /* ── 5.2 font-display: swap لكل الخطوط (تُضاف في CSS) ──────────────── */
  /* هذا يضمن عرض النص فوراً بخط بديل ثم الاستبدال بالخط الأصلي */

  /* ── 5.3 تأكد من dir="rtl" على كل العناصر الرئيسية ─────────────────── */
  document.querySelectorAll('.main, .sidebar, .card, section').forEach(el => {
    if (!el.hasAttribute('dir') && !el.closest('[dir]')) {
      el.setAttribute('dir', 'rtl');
    }
  });

  /* ── 5.4 الأرقام العربية في الإحصائيات ─────────────────────────────── */
  /* التطبيق يستخدم toLocaleString('ar-EG') بالفعل — تأكد من الاتساق */
  document.querySelectorAll('[data-arabic-num]').forEach(el => {
    const num = parseFloat(el.textContent);
    if (!isNaN(num)) {
      el.textContent = num.toLocaleString('ar-EG');
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. اختبار الـ Contrast (Development Tool)
   ─────────────────────────────────────────────────────────────────────────
   يُشغَّل فقط في وضع التطوير لرصد مشاكل الـ contrast
   ═══════════════════════════════════════════════════════════════════════════ */
function checkContrastIssues() {
  if (!window._zadDevMode) return;

  const issues = [];
  document.querySelectorAll('p, span, div, h1, h2, h3, h4, button').forEach(el => {
    const style = window.getComputedStyle(el);
    const fg = style.color;
    const bg = style.backgroundColor;
    /* تحقق بسيط — في التطوير فقط */
    if (fg === bg) {
      issues.push({ el, issue: 'نص ملون نفس خلفيته' });
    }
  });

  if (issues.length > 0) {
    console.warn('[A11y] مشاكل contrast محتملة:', issues.length);
    issues.forEach(({ el, issue }) => console.warn(issue, el));
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. تشغيل كل التحسينات
   ═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  injectDesignTokens();
  enhanceAccessibility();
  applyCalmUX();
  ensureArabicRendering();

  /* إعادة تطبيق a11y بعد تحديثات DOM الديناميكية */
  const observer = new MutationObserver(() => {
    clearTimeout(window._a11yTimer);
    window._a11yTimer = setTimeout(() => {
      enhanceAccessibility();
    }, 500);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  console.log('[ZadDesign] ✅ Design System + A11y + Calm UX جاهزة');
});
