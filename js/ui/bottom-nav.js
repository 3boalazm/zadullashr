/* ═══════════════════════════════════════════════════════════════════════════
   زاد — ui/bottom-nav.js
   ─────────────────────────────────────────────────────────────────────────
   Bottom Navigation Bar — 5 تبويبات على الموبايل بأسلوب PWA
   يظهر على الموبايل فقط (< 768px) ويختفي على الـ desktop
   يحترم: RTL، safe-area، prefers-reduced-motion، WCAG 2.2
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadBottomNav = (() => {
  'use strict';

  /* تبويبات الـ bottom nav — مطابقة لـ ZadRouter.TABS */
  const TABS = [
    { id: 'home',   icon: '🏠', label: 'الرئيسية', href: 'index.html',   pages: ['index.html'] },
    { id: 'quran',  icon: '📖', label: 'القرآن',   href: 'mushaf.html',  pages: ['mushaf.html','mushaf-quran.html','tasmee.html'] },
    { id: 'adhkar', icon: '🤲', label: 'الأذكار',  href: 'adhkar.html',  pages: ['adhkar.html','hasn.html','adhkar-categories.html','du\'a.html','dua-guide.html'] },
    { id: 'prayer', icon: '🕌', label: 'الصلاة',   href: 'prayers.html', pages: ['prayers.html','qibla.html','hijri.html','taqweem.html'] },
    { id: 'more',   icon: '⚙️', label: 'المزيد',   href: '#more-menu',   pages: [] },
  ];

  /* قائمة "المزيد" */
  const MORE_ITEMS = [
    { icon: '📺', label: 'المحاضرات',         href: 'videos.html' },
    { icon: '📻', label: 'إذاعة القرآن',      href: 'Quran-radio.HTML' },
    { icon: '🎵', label: 'البلاي ليست',       href: 'playlist.html' },
    { icon: '🤖', label: 'تدبّر بالذكاء',    href: 'ai.html' },
    { icon: '📊', label: 'حصاد العشر',        href: 'hasad.html' },
    { icon: '🧮', label: 'حاسبة الزكاة',     href: 'zakat.html' },
    { icon: '💎', label: 'أسماء الله الحسنى', href: 'asma.html' },
    { icon: '📅', label: 'جدول العبادات',    href: 'worship.html' },
    { icon: '🏅', label: 'أوسمتي',            href: 'badges.html' },
    { icon: '⚙️', label: 'الإعدادات',         href: 'settings.html' },
  ];

  let moreOpen = false;

  /* ── الصفحة الحالية ─────────────────────────────────────────────────── */
  function getActiveTab() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    for (const tab of TABS) {
      if (tab.pages.includes(page)) return tab.id;
      if (tab.href === page) return tab.id;
    }
    /* افحص المزيد */
    if (MORE_ITEMS.some(i => i.href === page)) return 'more';
    return 'home';
  }

  /* ── Inject CSS ─────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('zad-bnav-css')) return;
    const style = document.createElement('style');
    style.id = 'zad-bnav-css';
    style.textContent = `
      /* ── Bottom Nav ── */
      .zad-bnav {
        display: none; /* يظهر فقط على الموبايل */
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 8000;
        background: var(--card, #fff);
        border-top: 1px solid var(--border, #e5e5e5);
        padding-bottom: env(safe-area-inset-bottom, 0px);
        box-shadow: 0 -4px 24px rgba(0,0,0,.08);
      }
      .zad-bnav-inner {
        display: flex; align-items: stretch; height: 60px;
      }
      .zad-bnav-tab {
        flex: 1; display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 3px; padding: 6px 4px;
        background: none; border: none; cursor: pointer; font-family: inherit;
        color: var(--muted, #888); transition: color .2s, background .2s;
        min-width: 0; text-decoration: none; position: relative;
        -webkit-tap-highlight-color: transparent; touch-action: manipulation;
      }
      .zad-bnav-tab.active { color: var(--green-deep, #0e3b2e); }
      .zad-bnav-tab.active::before {
        content: ''; position: absolute; top: 0; left: 25%; right: 25%;
        height: 3px; background: var(--green-deep, #0e3b2e); border-radius: 0 0 3px 3px;
      }
      .zad-bnav-tab:active { background: rgba(0,0,0,.04); }
      .zad-bnav-icon { font-size: 22px; line-height: 1; }
      .zad-bnav-label { font-size: 10px; font-weight: 700; white-space: nowrap; overflow: hidden; }
      
      /* ── More Sheet ── */
      .zad-more-overlay {
        position: fixed; inset: 0; z-index: 7999;
        background: rgba(0,0,0,.45);
        opacity: 0; pointer-events: none;
        transition: opacity .25s;
      }
      .zad-more-overlay.open { opacity: 1; pointer-events: auto; }
      .zad-more-sheet {
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 8001;
        background: var(--card, #fff); border-radius: 20px 20px 0 0;
        padding: 12px 16px calc(env(safe-area-inset-bottom, 0px) + 76px);
        transform: translateY(100%);
        transition: transform .3s cubic-bezier(.4,0,.2,1);
        max-height: 75vh; overflow-y: auto;
      }
      .zad-more-sheet.open { transform: translateY(0); }
      .zad-more-handle {
        width: 36px; height: 4px; background: var(--border, #ddd);
        border-radius: 2px; margin: 0 auto 16px;
      }
      .zad-more-title {
        font-size: 14px; font-weight: 800; color: var(--muted, #888);
        margin-bottom: 12px; text-align: center;
      }
      .zad-more-grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
      }
      .zad-more-item {
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        padding: 14px 8px; border-radius: 14px; text-decoration: none;
        background: var(--sand, #faf9f6); color: var(--ink, #222);
        font-family: inherit; border: none; cursor: pointer;
        transition: background .2s; -webkit-tap-highlight-color: transparent;
        min-height: 72px; justify-content: center;
      }
      .zad-more-item:active { background: var(--border, #eee); }
      .zad-more-item.current { background: var(--green-pale, #e8f4ef); color: var(--green-deep, #0e3b2e); }
      .zad-more-item-icon { font-size: 26px; }
      .zad-more-item-label { font-size: 11px; font-weight: 700; text-align: center; }

      /* ── يظهر على الموبايل فقط ── */
      @media (max-width: 768px) {
        .zad-bnav { display: block; }
        /* تعويض ارتفاع الـ bottom nav */
        main.main, #main-content, .main {
          padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important;
        }
        /* إخفاء الـ sidebar على الموبايل لأن الـ bottom nav بيعوّضها */
        .sidebar { display: none !important; }
        main.main, #main-content, .main { margin-right: 0 !important; }
      }

      @media (prefers-reduced-motion: reduce) {
        .zad-more-overlay, .zad-more-sheet, .zad-bnav-tab { transition: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── بناء الـ HTML ────────────────────────────────────────────────────── */
  function build() {
    const activeTab = getActiveTab();
    const page = window.location.pathname.split('/').pop() || 'index.html';

    /* Bottom Nav */
    const nav = document.createElement('nav');
    nav.className = 'zad-bnav';
    nav.setAttribute('aria-label', 'التنقل الرئيسي');
    nav.innerHTML = `<div class="zad-bnav-inner">` +
      TABS.map(tab => {
        const isActive = tab.id === activeTab;
        const isMore = tab.id === 'more';
        const href = isMore ? 'javascript:void(0)' : (ZadRouter?.getLastPage?.(tab.id) || tab.href);
        return `
          <${isMore ? 'button' : 'a'} 
            class="zad-bnav-tab${isActive ? ' active' : ''}"
            ${isMore ? `onclick="ZadBottomNav.toggleMore()"` : `href="${href}"`}
            aria-label="${tab.label}"
            ${isActive ? 'aria-current="page"' : ''}>
            <span class="zad-bnav-icon" aria-hidden="true">${tab.icon}</span>
            <span class="zad-bnav-label">${tab.label}</span>
          </${isMore ? 'button' : 'a'}>`;
      }).join('') +
    `</div>`;

    /* More Overlay */
    const overlay = document.createElement('div');
    overlay.className = 'zad-more-overlay';
    overlay.id = 'zad-more-overlay';
    overlay.onclick = () => closeMore();

    /* More Sheet */
    const sheet = document.createElement('div');
    sheet.className = 'zad-more-sheet';
    sheet.id = 'zad-more-sheet';
    sheet.innerHTML = `
      <div class="zad-more-handle"></div>
      <div class="zad-more-title">المزيد من الميزات</div>
      <div class="zad-more-grid">
        ${MORE_ITEMS.map(item => `
          <a class="zad-more-item${item.href === page ? ' current' : ''}"
             href="${item.href}" onclick="ZadBottomNav.closeMore()">
            <span class="zad-more-item-icon">${item.icon}</span>
            <span class="zad-more-item-label">${item.label}</span>
          </a>
        `).join('')}
      </div>`;

    document.body.appendChild(nav);
    document.body.appendChild(overlay);
    document.body.appendChild(sheet);
  }

  /* ── Toggle More ──────────────────────────────────────────────────────── */
  function toggleMore() {
    moreOpen = !moreOpen;
    document.getElementById('zad-more-overlay')?.classList.toggle('open', moreOpen);
    document.getElementById('zad-more-sheet')?.classList.toggle('open', moreOpen);
    /* فعّل active على تبويب المزيد */
    document.querySelectorAll('.zad-bnav-tab').forEach(btn => {
      if (btn.getAttribute('aria-label') === 'المزيد')
        btn.classList.toggle('active', moreOpen);
    });
  }

  function closeMore() {
    moreOpen = false;
    document.getElementById('zad-more-overlay')?.classList.remove('open');
    document.getElementById('zad-more-sheet')?.classList.remove('open');
  }

  /* ── Init ─────────────────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    build();
    /* أغلق الـ more sheet بالـ Escape */
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMore(); });
  }

  return { init, toggleMore, closeMore, getActiveTab };
})();

window.ZadBottomNav = ZadBottomNav;
document.addEventListener('DOMContentLoaded', () => ZadBottomNav.init());
