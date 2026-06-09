/* ═══════════════════════════════════════════════════════════════════════════
   زاد — ui/progress-rollup.js
   ─────────────────────────────────────────────────────────────────────────
   سطح «تقدّمي» الموحّد — قراءةٌ فقط (READ-ONLY). لا يكتب ولا يدمج أي تخزين.
   يجمّع الأرقام المبعثرة الموجودة أصلًا في مكان واحد على صفحة «حسابي»:
     • السلسلة (streak)            ← zad_v2.streak
     • أيام نشطة                  ← عدد مفاتيح zad_v2.history
     • الأوسمة                    ← zad_v2.badges + zad_badges_asma
     • أجزاء القرآن               ← zad_v2.mushaf.juz
     • الصدقات                    ← zad_v2.sadaqahPage.total
     • التكبيرات                  ← zad_v2.takbeer.total
     • نور الأطفال                ← نفس صيغة kids-school (countDone*10 + akhlaq*5 + light)
     • الأهداف (إن وُجدت)          ← ZadStore.getState('userGoals') (غير متزامن، اختياري)
   كل رقمٍ يربط بصفحته المصدر. لا يلغي صفحة «حسابي» القائمة، بل يضيف بطاقة تجميعية.
   ═══════════════════════════════════════════════════════════════════════════ */

const ZadProgress = (() => {
  'use strict';

  function read() { try { return JSON.parse(localStorage.getItem('zad_v2') || '{}') || {}; } catch (e) { return {}; } }
  function readArr(k) { try { return JSON.parse(localStorage.getItem(k) || '[]') || []; } catch (e) { return []; } }

  /* صيغة نور الأطفال — منقولة كما هي من kids-school.html (قراءة فقط) */
  function kidsNoor(ks) {
    ks = ks || {};
    const cd = j => Object.keys(ks[j] || {}).length;
    let akh = 0; const a = ks.akhlaq || {};
    Object.keys(a).forEach(k => { const v = a[k]; akh += (typeof v === 'number' ? v : (v ? 1 : 0)); });
    return cd('wudu') * 10 + cd('salah') * 10 + akh * 5 + (Number(ks.light) || 0);
  }

  /* حساب الإحصاءات (متزامن، من localStorage) */
  function compute() {
    const st = read();
    const history = st.history || {};
    const badges = Array.isArray(st.badges) ? st.badges.length : 0;
    const asma = readArr('zad_badges_asma').length;
    const ks = st.kidsSchool || {};
    const hasKids = ks && Object.keys(ks).length > 0;

    const stats = [
      { icon: '🔥', label: 'سلسلة', value: (st.streak || 0), unit: 'يوم', href: 'barnamaj.html' },
      { icon: '📅', label: 'أيام نشطة', value: Object.keys(history).length, unit: '', href: 'hasad.html' },
      { icon: '🏅', label: 'أوسمة', value: badges + asma, unit: '', href: 'badges.html' },
      { icon: '📖', label: 'أجزاء', value: (st.mushaf && st.mushaf.juz) || 0, unit: '/30', href: 'mushaf.html' },
      { icon: '💝', label: 'صدقات', value: (st.sadaqahPage && st.sadaqahPage.total) || 0, unit: '', href: 'sadaqah.html' },
      { icon: '🤲', label: 'تكبيرات', value: (st.takbeer && st.takbeer.total) || 0, unit: '', href: 'takbeer.html' },
    ];
    if (hasKids) stats.push({ icon: '🌟', label: 'نور الأطفال', value: kidsNoor(ks), unit: '', href: 'kids.html' });
    return { streak: st.streak || 0, stats };
  }

  function statCard(s) {
    return `
      <a class="zpr-stat" href="${s.href}">
        <span class="zpr-stat-icon" aria-hidden="true">${s.icon}</span>
        <span class="zpr-stat-val">${s.value}<span class="zpr-stat-unit">${s.unit || ''}</span></span>
        <span class="zpr-stat-label">${s.label}</span>
      </a>`;
  }

  function injectCSS() {
    if (document.getElementById('zpr-css')) return;
    const s = document.createElement('style');
    s.id = 'zpr-css';
    s.textContent = `
      .zad-progress-rollup { background: var(--card,#fff); border:1.5px solid var(--border,#eee);
        border-radius: var(--r-xl,20px); padding:16px; margin:0 0 18px; box-shadow: var(--shadow-sm,0 2px 10px rgba(0,0,0,.05)); }
      .zpr-head { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
      .zpr-title { font-size:16px; font-weight:900; color:var(--green-deep,#0e3b2e); font-family:'ThmanyahSans',sans-serif; }
      html[data-theme="dark"] .zpr-title, html[data-theme="oled"] .zpr-title { color:var(--sys-green,#7fd1b0); }
      .zpr-sub { font-size:11.5px; color:var(--muted,#888); margin-bottom:14px; }
      .zpr-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
      .zpr-stat { display:flex; flex-direction:column; align-items:center; gap:3px; text-decoration:none;
        background:var(--sand,#faf9f6); border-radius:14px; padding:13px 6px; min-height:78px; justify-content:center;
        transition:background .2s, transform .2s; -webkit-tap-highlight-color:transparent; }
      html[data-theme="dark"] .zpr-stat, html[data-theme="oled"] .zpr-stat { background:rgba(255,255,255,.04); }
      .zpr-stat:hover { background:var(--green-pale,#e8f4ef); }
      .zpr-stat:active { transform:scale(.97); }
      .zpr-stat-icon { font-size:22px; line-height:1; }
      .zpr-stat-val { font-size:20px; font-weight:900; color:var(--green-deep,#0e3b2e); font-family:'ThmanyahSans',sans-serif; }
      html[data-theme="dark"] .zpr-stat-val, html[data-theme="oled"] .zpr-stat-val { color:var(--sys-green,#7fd1b0); }
      .zpr-stat-unit { font-size:11px; font-weight:700; opacity:.6; margin-inline-start:2px; }
      .zpr-stat-label { font-size:11px; font-weight:700; color:var(--muted,#888); }
      .zpr-goals { margin-top:12px; font-size:12.5px; font-weight:700; color:var(--green-deep,#0e3b2e);
        background:var(--green-pale,#e8f4ef); border-radius:12px; padding:10px 12px; display:none; }
      html[data-theme="dark"] .zpr-goals, html[data-theme="oled"] .zpr-goals { background:rgba(201,161,74,.12); color:var(--sys-green,#7fd1b0); }
      @media (prefers-reduced-motion: reduce){ .zpr-stat{transition:none!important;} }
    `;
    document.head.appendChild(s);
  }

  function mount() {
    const main = document.querySelector('main.main, #main-content');
    if (!main || document.getElementById('zad-progress-rollup')) return;
    const { stats } = compute();

    const card = document.createElement('section');
    card.id = 'zad-progress-rollup';
    card.className = 'zad-progress-rollup';
    card.setAttribute('aria-label', 'تقدّمي — نظرة موحّدة');
    card.innerHTML = `
      <div class="zpr-head"><span aria-hidden="true">✨</span><span class="zpr-title">تقدّمي</span></div>
      <div class="zpr-sub">نظرة موحّدة على رحلتك (اضغط أي رقم لتفتح صفحته)</div>
      <div class="zpr-grid">${stats.map(statCard).join('')}</div>
      <div class="zpr-goals" id="zpr-goals"></div>
    `;

    const topbar = main.querySelector('.topbar');
    if (topbar && topbar.nextSibling) main.insertBefore(card, topbar.nextSibling);
    else main.prepend(card);

    /* الأهداف (غير متزامن، اختياري — لا يعطّل البطاقة إن غابت) */
    try {
      if (window.ZadStore && typeof window.ZadStore.getState === 'function') {
        Promise.resolve(window.ZadStore.getState('userGoals', [])).then(goals => {
          if (!Array.isArray(goals) || !goals.length) return;
          const done = goals.filter(g => (g.current || 0) >= (g.target || Infinity)).length;
          const box = document.getElementById('zpr-goals');
          if (box) { box.textContent = `🎯 الأهداف: ${done}/${goals.length} مكتمل`; box.style.display = 'block'; }
        }).catch(() => {});
      }
    } catch (e) {}
  }

  function init() {
    const page = window.location.pathname.split('/').pop() || '';
    if (page !== 'profile.html') return;
    injectCSS();
    setTimeout(mount, 250);
  }

  return { init, mount, compute };
})();

window.ZadProgress = ZadProgress;
document.addEventListener('DOMContentLoaded', () => ZadProgress.init());
