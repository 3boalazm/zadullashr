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
    { id: 'home',   icon: '🏠', label: 'الرئيسية', href: 'index.html',   pages: ['index.html','summary.html','profile.html','badges.html','hasad.html','hasad-month.html','ghars.html','about.html','demo.html','report.html','developer.html','diagnostics.html','zad_al_ashr.html','404.html'] },
    { id: 'quran',  icon: '📖', label: 'القرآن',   href: 'mushaf.html',  pages: ['mushaf.html','mushaf-quran.html','tasmee.html'] },
    { id: 'adhkar', icon: '🤲', label: 'الأذكار',  href: 'adhkar.html',  pages: ['adhkar.html','adhkar-categories.html','adhkar-section.html','hasn.html','du\'a.html','duas.html','dua-guide.html','arafah-dua.html','ruqyah.html','asma.html','nawawi.html','sunan.html','takbeer.html'] },
    { id: 'prayer', icon: '🕌', label: 'الصلاة',   href: 'prayers.html', pages: ['prayers.html','qibla.html','hijri.html','taqweem.html','barnamaj.html','worship.html'] },
    { id: 'more',   icon: '⚙️', label: 'المزيد',   href: '#more-menu',   pages: ['manasik.html','odhiya.html','arafah.html','zakat.html','zakat-ahkam.html','zakat-anwa.html','fadael.html','videos.html','playlist.html','Quran-radio.HTML','maktaba-nassiya.html','ai.html','groups.html','group-board.html','groups-privacy.html','hawwa.html','zahra.html','sadaqah.html','kids.html','kids-school.html','kids-creativity.html','kids-heroes.html','kids-fun.html','kids-parents.html','hikayat-hajj.html','settings.html','privacy.html'] },
  ];

  /* قائمة "المزيد" — اختصارات منسّقة (الدليل الكامل في القائمة الجانبية) */
  const MORE_ITEMS = [
    { icon: '🕋', label: 'مناسك الحج',       href: 'manasik.html' },
    { icon: '📅', label: 'برنامج اليوم',     href: 'barnamaj.html' },
    { icon: '💝', label: 'صدقة',             href: 'sadaqah.html' },
    { icon: '🧮', label: 'حاسبة الزكاة',     href: 'zakat.html' },
    { icon: '👨‍👩‍👧', label: 'التنافس العائلي', href: 'groups.html' },
    { icon: '🌟', label: 'ركن الأطفال',      href: 'kids.html' },
    { icon: '📺', label: 'المحاضرات',         href: 'videos.html' },
    { icon: '📻', label: 'إذاعة القرآن',      href: 'Quran-radio.HTML' },
    { icon: '🎵', label: 'البلاي ليست',       href: 'playlist.html' },
    { icon: '🤖', label: 'تدبّر بالذكاء',    href: 'ai.html' },
    { icon: '💎', label: 'أسماء الله الحسنى', href: 'asma.html' },
    { icon: '🏅', label: 'أوسمتي',            href: 'badges.html' },
    { icon: '📊', label: 'حصاد العشر',        href: 'hasad.html' },
    { icon: '⚙️', label: 'الإعدادات',         href: 'settings.html' },
  ];

  /* تبويبات وضع الأطفال — مبسّطة وآمنة للطفل (كل الصفحات تبقى متاحة عبر القائمة الجانبية) */
  const KID_TABS = [
    { id: 'khome',   icon: '🏠', label: 'الركن',   href: 'kids.html',            pages: ['kids.html','kids-parents.html','hikayat-hajj.html'] },
    { id: 'kschool', icon: '🎓', label: 'مدرستي',  href: 'kids-school.html',     pages: ['kids-school.html'] },
    { id: 'kcreate', icon: '🎨', label: 'إبداع',   href: 'kids-creativity.html', pages: ['kids-creativity.html'] },
    { id: 'kfun',    icon: '🎬', label: 'المرح',   href: 'kids-fun.html',        pages: ['kids-fun.html','kids-heroes.html'] },
    { id: 'kadult',  icon: '👨‍👩‍👧', label: 'الكبار', action: "ZadBottomNav.setMode('adult')", pages: [] },
  ];

  /* وضع التنقّل: 'adult' | 'kids' — مفتاح مستقل لا يمسّ بيانات الأطفال (zad_kids_v2) */
  const MODE_KEY = 'zad_nav_mode';
  function getMode() { try { return localStorage.getItem(MODE_KEY) === 'kids' ? 'kids' : 'adult'; } catch (e) { return 'adult'; } }
  function activeTabs() { return getMode() === 'kids' ? KID_TABS : TABS; }
  function setMode(m) {
    const mode = (m === 'kids') ? 'kids' : 'adult';
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
    /* انتقل لوجهة الوضع الجديد؛ تُعاد بناء التبويبات تلقائيًا عند التحميل */
    window.location.href = (mode === 'kids') ? 'kids.html' : 'index.html';
  }

  let moreOpen = false;

  /* ── الصفحة الحالية ─────────────────────────────────────────────────── */
  function getActiveTab() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const tabs = activeTabs();
    for (const tab of tabs) {
      if (tab.pages.includes(page)) return tab.id;
      if (tab.href === page) return tab.id;
    }
    /* في وضع الكبار: صفحات شيت "المزيد" تُبرز تبويب المزيد */
    if (getMode() === 'adult' && MORE_ITEMS.some(i => i.href === page)) return 'more';
    return tabs[0].id;
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
      .zad-more-item.zad-more-mode { background: linear-gradient(135deg, var(--gold,#c9a14a), #e6c97a); color: #3a2e10; font-weight: 900; }
      .zad-more-item-icon { font-size: 26px; }
      .zad-more-item-label { font-size: 11px; font-weight: 700; text-align: center; }

      /* ── يظهر على الموبايل فقط ── */
      @media (max-width: 768px) {
        .zad-bnav { display: block; }
        /* تعويض ارتفاع الـ bottom nav */
        main.main, #main-content, .main {
          padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important;
        }
        /* القائمة الجانبية تظل متاحة على الموبايل عبر زر القائمة (الدليل الكامل) */
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
    const tabs = activeTabs();
    const nav = document.createElement('nav');
    nav.className = 'zad-bnav';
    nav.setAttribute('aria-label', 'التنقل الرئيسي');
    nav.innerHTML = `<div class="zad-bnav-inner">` +
      tabs.map(tab => {
        const isActive = tab.id === activeTab;
        const isMore = tab.id === 'more';
        const isAction = isMore || !!tab.action;
        const el = isAction ? 'button' : 'a';
        const onclick = isMore ? `ZadBottomNav.toggleMore()` : (tab.action || '');
        const attr = isAction ? `onclick="${onclick}"` : `href="${(typeof ZadRouter !== 'undefined' && ZadRouter?.getLastPage?.(tab.id)) || tab.href}"`;
        return `
          <${el}
            class="zad-bnav-tab${isActive ? ' active' : ''}"
            ${attr}
            aria-label="${tab.label}"
            ${isActive ? 'aria-current="page"' : ''}>
            <span class="zad-bnav-icon" aria-hidden="true">${tab.icon}</span>
            <span class="zad-bnav-label">${tab.label}</span>
          </${el}>`;
      }).join('') +
    `</div>`;

    document.body.appendChild(nav);

    /* شيت "المزيد" يظهر في وضع الكبار فقط (وضع الأطفال له تبويب «الكبار» للرجوع) */
    if (getMode() === 'adult') {
      const overlay = document.createElement('div');
      overlay.className = 'zad-more-overlay';
      overlay.id = 'zad-more-overlay';
      overlay.onclick = () => closeMore();

      const sheet = document.createElement('div');
      sheet.className = 'zad-more-sheet';
      sheet.id = 'zad-more-sheet';
      sheet.innerHTML = `
        <div class="zad-more-handle"></div>
        <div class="zad-more-title">المزيد من الميزات</div>
        <div class="zad-more-grid">
          <button class="zad-more-item zad-more-mode" onclick="ZadBottomNav.setMode('kids')">
            <span class="zad-more-item-icon">🌟</span>
            <span class="zad-more-item-label">وضع الأطفال</span>
          </button>
          ${MORE_ITEMS.map(item => `
            <a class="zad-more-item${item.href === page ? ' current' : ''}"
               href="${item.href}" onclick="ZadBottomNav.closeMore()">
              <span class="zad-more-item-icon">${item.icon}</span>
              <span class="zad-more-item-label">${item.label}</span>
            </a>
          `).join('')}
        </div>`;

      document.body.appendChild(overlay);
      document.body.appendChild(sheet);
    }
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
    if (document.querySelector('.zad-bnav')) return; /* idempotent — لا تبنِ مرتين */
    injectCSS();
    build();
    /* أغلق الـ more sheet بالـ Escape */
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMore(); });
  }

  return { init, toggleMore, closeMore, getActiveTab, setMode, getMode };
})();

window.ZadBottomNav = ZadBottomNav;
document.addEventListener('DOMContentLoaded', () => ZadBottomNav.init());
