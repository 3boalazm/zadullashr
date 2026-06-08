/* ═══════════════════════════════════════════════════════════════════════════
   زاد — core/router.js
   ─────────────────────────────────────────────────────────────────────────
   Client-side router: يحفظ آخر صفحة، يتتبع التنقل، يوفّر API للـ bottom-nav
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadRouter = (() => {
  'use strict';

  /* خريطة الصفحات الرئيسية */
  const ROUTES = {
    'index.html':         { tab: 'home',    title: 'لوحة التحكم' },
    'mushaf.html':        { tab: 'quran',   title: 'الورد القرآني' },
    'mushaf-quran.html':  { tab: 'quran',   title: 'المصحف الشريف' },
    'adhkar.html':        { tab: 'adhkar',  title: 'الأذكار والدعاء' },
    'hasn.html':          { tab: 'adhkar',  title: 'حصن المسلم' },
    'prayers.html':       { tab: 'prayer',  title: 'مواقيت الصلاة' },
    'qibla.html':         { tab: 'prayer',  title: 'اتجاه القبلة' },
    'hijri.html':         { tab: 'prayer',  title: 'التقويم الهجري' },
    'takbeer.html':       { tab: 'tasbih',  title: 'المسبحة' },
    'settings.html':      { tab: 'more',    title: 'الإعدادات' },
    'videos.html':        { tab: 'more',    title: 'المحاضرات' },
    'Quran-radio.HTML':   { tab: 'more',    title: 'إذاعة القرآن' },
    'ai.html':            { tab: 'more',    title: 'تدبّر بالذكاء' },
    'hasad.html':         { tab: 'more',    title: 'حصاد العشر' },
    'zakat.html':         { tab: 'more',    title: 'حاسبة الزكاة' },
    'asma.html':          { tab: 'more',    title: 'أسماء الله الحسنى' },
    'worship.html':       { tab: 'more',    title: 'جدول العبادات' },
  };

  const TABS = [
    { id: 'home',   icon: '🏠', label: 'الرئيسية', href: 'index.html' },
    { id: 'quran',  icon: '📖', label: 'القرآن',   href: 'mushaf.html' },
    { id: 'adhkar', icon: '🤲', label: 'الأذكار',  href: 'adhkar.html' },
    { id: 'prayer', icon: '🕌', label: 'الصلاة',   href: 'prayers.html' },
    { id: 'more',   icon: '⚙️', label: 'المزيد',   href: 'settings.html' },
  ];

  /* ── الصفحة الحالية ──────────────────────────────────────────────────── */
  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function currentTab() {
    const route = ROUTES[currentPage()];
    return route ? route.tab : 'home';
  }

  /* ── حفظ آخر صفحة في كل tab ─────────────────────────────────────────── */
  function saveLastPage() {
    const page = currentPage();
    const route = ROUTES[page];
    if (route) {
      try {
        const last = JSON.parse(localStorage.getItem('zad_last_pages') || '{}');
        last[route.tab] = page;
        localStorage.setItem('zad_last_pages', JSON.stringify(last));
      } catch {}
    }
  }

  function getLastPage(tabId) {
    try {
      const last = JSON.parse(localStorage.getItem('zad_last_pages') || '{}');
      return last[tabId] || TABS.find(t => t.id === tabId)?.href || 'index.html';
    } catch {
      return TABS.find(t => t.id === tabId)?.href || 'index.html';
    }
  }

  /* ── التنقل ─────────────────────────────────────────────────────────── */
  function navigateTo(page) {
    if (page !== currentPage()) {
      window.location.href = page;
    }
  }

  function navigateTab(tabId) {
    const dest = getLastPage(tabId);
    navigateTo(dest);
  }

  /* ── Init ────────────────────────────────────────────────────────────── */
  function init() {
    saveLastPage();
    /* تحديث document.title */
    const route = ROUTES[currentPage()];
    if (route && !document.title.includes(route.title)) {
      document.title = `${route.title} — زاد العشر`;
    }
  }

  return { init, currentPage, currentTab, navigateTo, navigateTab, ROUTES, TABS };
})();

window.ZadRouter = ZadRouter;
document.addEventListener('DOMContentLoaded', () => ZadRouter.init());
