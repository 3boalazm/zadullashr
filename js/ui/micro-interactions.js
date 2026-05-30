/* ═══════════════════════════════════════════════════════════════════════════
   زاد — ui/micro-interactions.js
   ─────────────────────────────────────────────────────────────────────────
   تفاعلات دقيقة: Ripple effect عند الضغط على الأزرار والبطاقات
   خفيف جداً، يحترم prefers-reduced-motion
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* احترم تفضيل تقليل الحركة */
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  /* العناصر القابلة للـ ripple */
  const RIPPLE_SELECTOR = '.btn, .card[onclick], a.card, .quick-card, .zd-btn, .zdh-cta, .bb-extra-btn';

  function createRipple(e) {
    const target = e.currentTarget;
    if (!target) return;

    /* تأكد إن العنصر ripple-host */
    if (getComputedStyle(target).position === 'static') {
      target.style.position = 'relative';
    }
    target.classList.add('ripple-host');

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (e.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (e.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

    const ink = document.createElement('span');
    ink.className = 'ripple-ink';
    ink.style.width = ink.style.height = size + 'px';
    ink.style.left = x + 'px';
    ink.style.top = y + 'px';

    target.appendChild(ink);
    setTimeout(() => ink.remove(), 650);
  }

  /* Event delegation — أداء أفضل من listener لكل عنصر */
  document.addEventListener('click', (e) => {
    const target = e.target.closest(RIPPLE_SELECTOR);
    if (target) {
      /* اربط الحدث مؤقتاً للحصول على currentTarget الصحيح */
      const fakeEvent = { currentTarget: target, clientX: e.clientX, clientY: e.clientY };
      createRipple(fakeEvent);
    }
  }, { passive: true });

  /* أضف stagger-in تلقائياً للـ grids الرئيسية في الصفحة */
  document.addEventListener('DOMContentLoaded', () => {
    const grids = document.querySelectorAll('.grid.cols-3, .grid.cols-2, .quick-actions');
    grids.forEach(g => {
      if (!g.classList.contains('stagger-in')) g.classList.add('stagger-in');
    });
  });

  console.log('[MicroInteractions] ✅ Ripple + stagger جاهز');
})();
